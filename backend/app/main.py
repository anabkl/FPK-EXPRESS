from __future__ import annotations

import logging
from datetime import datetime, time
from time import perf_counter
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from .ai import build_ai_summary, estimate_waiting_time, predict_peak_hours, recommend_meals
from .cache import api_cache
from .database import Base, SessionLocal, engine, get_db
from .models import Meal, Order
from .schemas import (
    DashboardStats,
    MealCreate,
    MealRead,
    OrderCreate,
    OrderRead,
    OrderStatusUpdate,
    RecommendationItem,
)
from .security import SECURITY_HEADERS, build_rate_limiter, get_allowed_origins
from .seed import seed_database


SERVICE_FEE = 1.0
logger = logging.getLogger("uvicorn.access")
rate_limiter = build_rate_limiter()

app = FastAPI(
    title="FPK-EXPRESS API",
    description="AI-powered preorder and pickup API for FPK Khouribga students.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_response_time(request: Request, call_next):
    started_at = perf_counter()
    client_ip = request.client.host if request.client else "unknown"

    if not rate_limiter.allow(client_ip):
        response = JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please retry later."},
        )
    else:
        response = await call_next(request)

    duration_ms = (perf_counter() - started_at) * 1000
    response.headers["X-Response-Time-ms"] = f"{duration_ms:.2f}"
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value

    logger.info(
        "%s %s completed with %s in %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for error in exc.errors():
        location = ".".join(str(part) for part in error.get("loc", [])[1:])
        errors.append({"field": location or "request", "message": error.get("msg", "Invalid value")})

    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request payload.", "errors": errors},
    )


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)


def invalidate_read_cache() -> None:
    api_cache.clear()


def serialize_meal(meal: Meal) -> dict:
    return MealRead.model_validate(meal).model_dump(mode="json")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "FPK-EXPRESS", "timestamp": datetime.utcnow().isoformat()}


@app.get("/meals", response_model=list[MealRead])
def get_meals(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    normalized_category = category or "Tous"
    normalized_search = (search or "").strip().lower()

    def fetch_meals() -> list[dict]:
        query = db.query(Meal)
        if normalized_category != "Tous":
            query = query.filter(Meal.category == normalized_category)
        if normalized_search:
            like = f"%{normalized_search}%"
            query = query.filter((Meal.name.ilike(like)) | (Meal.description.ilike(like)))
        return [serialize_meal(meal) for meal in query.order_by(Meal.popularity_score.desc()).all()]

    return api_cache.get_or_set(("meals", normalized_category, normalized_search), fetch_meals)


@app.post("/meals", response_model=MealRead, status_code=201)
def create_meal(payload: MealCreate, db: Session = Depends(get_db)) -> Meal:
    meal = Meal(**payload.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    invalidate_read_cache()
    return meal


@app.get("/meals/{meal_id}", response_model=MealRead)
def get_meal(meal_id: int, db: Session = Depends(get_db)) -> Meal:
    meal = db.get(Meal, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal


@app.post("/orders", response_model=OrderRead, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    meal = db.get(Meal, payload.meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    if not meal.is_available:
        raise HTTPException(status_code=400, detail="Meal is not available")

    estimated_wait = estimate_waiting_time(db, meal, payload.quantity)
    order = Order(
        student_name=payload.student_name,
        student_department=payload.student_department,
        meal_id=payload.meal_id,
        quantity=payload.quantity,
        pickup_time=payload.pickup_time,
        status="Pending",
        total_price=round(meal.price * payload.quantity + SERVICE_FEE, 2),
        estimated_waiting_time=estimated_wait,
    )
    meal.popularity_score = min(meal.popularity_score + 1, 100)
    db.add(order)
    db.commit()
    db.refresh(order)
    invalidate_read_cache()
    return order


@app.get("/orders", response_model=list[OrderRead])
def get_orders(
    status: Optional[str] = Query(default=None, pattern="^(Pending|Preparing|Ready|Completed)$"),
    db: Session = Depends(get_db),
) -> list[Order]:
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.created_at.desc()).all()


@app.patch("/orders/{order_id}/status", response_model=OrderRead)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    invalidate_read_cache()
    return order


@app.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)) -> dict:
    def fetch_stats() -> dict:
        start_of_day = datetime.combine(datetime.utcnow().date(), time.min)
        today_orders = db.query(Order).filter(Order.created_at >= start_of_day).all()

        total_orders = len(today_orders)
        revenue_today = round(sum(order.total_price for order in today_orders), 2)
        avg_wait = round(
            sum(order.estimated_waiting_time for order in today_orders) / total_orders,
            1,
        ) if total_orders else 0

        popular_row = (
            db.query(Meal.name, func.count(Order.id).label("orders"))
            .join(Order, Meal.id == Order.meal_id)
            .group_by(Meal.id)
            .order_by(func.count(Order.id).desc())
            .first()
        )

        orders_per_hour = [
            {"hour": f"{hour:02d}:00", "orders": 0}
            for hour in range(8, 18)
        ]
        observed_orders = dict(
            db.query(func.strftime("%H", Order.created_at), func.count(Order.id))
            .group_by(func.strftime("%H", Order.created_at))
            .all()
        )
        for point in orders_per_hour:
            point["orders"] = int(observed_orders.get(point["hour"][:2], 0))

        popular_meals = [
            {"name": name, "orders": int(count)}
            for name, count in (
                db.query(Meal.name, func.count(Order.id))
                .join(Order, Meal.id == Order.meal_id)
                .group_by(Meal.id)
                .order_by(func.count(Order.id).desc())
                .limit(6)
                .all()
            )
        ]

        waiting_time_by_hour = [
            {"hour": point["hour"], "minutes": max(5, 6 + point["orders"] * 3)}
            for point in orders_per_hour
        ]

        return {
            "total_orders": total_orders,
            "revenue_today": revenue_today,
            "average_waiting_time": avg_wait,
            "popular_meal": popular_row.name if popular_row else "Aucun plat",
            "orders_per_hour": orders_per_hour,
            "popular_meals": popular_meals,
            "waiting_time_by_hour": waiting_time_by_hour,
        }

    return api_cache.get_or_set(("dashboard_stats",), fetch_stats)


@app.get("/ai/recommendations", response_model=dict)
def ai_recommendations(
    category: Optional[str] = None,
    limit: int = Query(default=4, ge=1, le=8),
    db: Session = Depends(get_db),
) -> dict:
    normalized_category = category or "all"

    def fetch_recommendations() -> dict:
        return {
            "summary": build_ai_summary(db),
            "recommendations": [
                RecommendationItem.model_validate(item).model_dump(mode="json")
                for item in recommend_meals(db, category=category, limit=limit)
            ],
        }

    return api_cache.get_or_set(("ai_recommendations", normalized_category, limit), fetch_recommendations)


@app.get("/ai/peak-hours")
def ai_peak_hours(db: Session = Depends(get_db)) -> dict:
    def fetch_peak_hours() -> dict:
        return {
            "campus": "FPK Khouribga",
            "predictions": predict_peak_hours(db),
            "message": "Les pics prevus se situent surtout entre 12:00 et 13:00.",
        }

    return api_cache.get_or_set(("ai_peak_hours",), fetch_peak_hours)
