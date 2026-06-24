from __future__ import annotations

import secrets
from collections import Counter
from datetime import UTC, datetime, time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .ai import build_insights_summary, estimate_waiting_time, predict_peak_hours, recommend_meals
from .auth import create_access_token, hash_password, verify_password
from .cache import api_cache
from .config import get_settings
from .database import get_db
from .dependencies import get_current_user, get_vendor_partner, require_student, require_vendor
from .models import Meal, Order, SnackPartner, User
from .schemas import (
    AuthResponse,
    DashboardStats,
    LoginRequest,
    MealCreate,
    MealRead,
    MealUpdate,
    OrderCreate,
    OrderRead,
    OrderStatusUpdate,
    PartnerUpdate,
    PaymentStatusUpdate,
    RecommendationItem,
    RegisterRequest,
    SnackPartnerRead,
    UserRead,
)


SERVICE_FEE = 1.0
NEXT_STATUS = {
    "Pending": "Preparing",
    "Preparing": "Ready",
    "Ready": "Collected",
}
CANCELLABLE_VENDOR_STATUSES = {"Pending", "Preparing", "Ready"}

router = APIRouter()


def invalidate_read_cache() -> None:
    api_cache.clear()


def serialize_meal(meal: Meal) -> dict:
    return MealRead.model_validate(meal).model_dump(mode="json")


def build_order_reference(db: Session) -> str:
    for _ in range(10):
        reference = f"FPK-{secrets.token_hex(3).upper()}"
        if not db.query(Order).filter(Order.order_reference == reference).first():
            return reference
    raise HTTPException(status_code=503, detail="Impossible de générer une référence de commande.")


def own_vendor_meal(db: Session, meal_id: int, partner: SnackPartner) -> Meal:
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.snack_partner_id == partner.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Plat introuvable pour ce snack partenaire.")
    return meal


def own_vendor_order(db: Session, order_id: int, partner: SnackPartner) -> Order:
    order = db.query(Order).filter(Order.id == order_id, Order.snack_partner_id == partner.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable pour ce snack partenaire.")
    return order


@router.post("/auth/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Un compte existe déjà avec cette adresse e-mail.")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="student",
        is_active=True,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Un compte existe déjà avec cette adresse e-mail.") from None
    db.refresh(user)
    token, expires_in = create_access_token(user.id, user.role)
    return {"access_token": token, "expires_in": expires_in, "user": user}


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Adresse e-mail ou mot de passe incorrect.")
    token, expires_in = create_access_token(user.id, user.role)
    return {"access_token": token, "expires_in": expires_in, "user": user}


@router.get("/auth/me", response_model=UserRead)
def auth_me(user: User = Depends(get_current_user)) -> User:
    return user


@router.get("/partners", response_model=list[SnackPartnerRead])
def get_partners(db: Session = Depends(get_db)) -> list[SnackPartner]:
    return db.query(SnackPartner).order_by(SnackPartner.name).all()


@router.get("/meals", response_model=list[MealRead])
def get_meals(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    normalized_category = category or "Tous"
    normalized_search = (search or "").strip().lower()

    def fetch_meals() -> list[dict]:
        query = db.query(Meal).join(SnackPartner).filter(
            Meal.is_available.is_(True),
            Meal.stock_quantity > 0,
            SnackPartner.is_open.is_(True),
        )
        if normalized_category != "Tous":
            query = query.filter(Meal.category == normalized_category)
        if normalized_search:
            like = f"%{normalized_search}%"
            query = query.filter((Meal.name.ilike(like)) | (Meal.description.ilike(like)))
        return [serialize_meal(meal) for meal in query.order_by(Meal.popularity_score.desc()).all()]

    return api_cache.get_or_set(("meals", normalized_category, normalized_search), fetch_meals)


@router.get("/meals/{meal_id}", response_model=MealRead)
def get_meal(meal_id: int, db: Session = Depends(get_db)) -> Meal:
    meal = db.get(Meal, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Plat introuvable.")
    return meal


@router.get("/vendor/meals", response_model=list[MealRead])
def get_vendor_meals(
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> list[Meal]:
    return db.query(Meal).filter(Meal.snack_partner_id == partner.id).order_by(Meal.name).all()


@router.post("/meals", response_model=MealRead, status_code=201)
def create_meal(
    payload: MealCreate,
    _: User = Depends(require_vendor),
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> Meal:
    meal = Meal(snack_partner_id=partner.id, **payload.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    invalidate_read_cache()
    return meal


@router.patch("/meals/{meal_id}", response_model=MealRead)
def update_meal(
    meal_id: int,
    payload: MealUpdate,
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> Meal:
    meal = own_vendor_meal(db, meal_id, partner)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(meal, field, value)
    db.commit()
    db.refresh(meal)
    invalidate_read_cache()
    return meal


@router.delete("/meals/{meal_id}", status_code=204, response_class=Response)
def delete_meal(
    meal_id: int,
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> Response:
    meal = own_vendor_meal(db, meal_id, partner)
    if db.query(Order).filter(Order.meal_id == meal.id).first():
        raise HTTPException(
            status_code=409,
            detail="Ce plat possède déjà des commandes. Rendez-le indisponible au lieu de le supprimer.",
        )
    db.delete(meal)
    db.commit()
    invalidate_read_cache()
    return Response(status_code=204)


@router.patch("/vendor/partner", response_model=SnackPartnerRead)
def update_partner(
    payload: PartnerUpdate,
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> SnackPartner:
    partner.is_open = payload.is_open
    db.commit()
    db.refresh(partner)
    invalidate_read_cache()
    return partner


@router.post("/orders", response_model=OrderRead, status_code=201)
def create_order(
    payload: OrderCreate,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
) -> Order:
    meal = db.get(Meal, payload.meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Plat introuvable.")
    if not meal.is_available or meal.stock_quantity < payload.quantity or not meal.snack_partner.is_open:
        raise HTTPException(status_code=409, detail="Ce plat n'est pas disponible pour cette quantité.")

    order = Order(
        order_reference=build_order_reference(db),
        student_id=student.id,
        snack_partner_id=meal.snack_partner_id,
        meal_id=meal.id,
        student_department=payload.student_department,
        quantity=payload.quantity,
        pickup_time=payload.pickup_time,
        status="Pending",
        payment_method="PayOnPickup",
        payment_status="PayOnPickup",
        total_price=round(meal.price * payload.quantity + SERVICE_FEE, 2),
        estimated_waiting_time=estimate_waiting_time(db, meal, payload.quantity),
    )
    meal.stock_quantity -= payload.quantity
    meal.popularity_score = min(meal.popularity_score + 1, 100)
    db.add(order)
    db.commit()
    db.refresh(order)
    invalidate_read_cache()
    return order


@router.get("/orders", response_model=list[OrderRead])
def get_student_orders(
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
) -> list[Order]:
    return db.query(Order).filter(Order.student_id == student.id).order_by(Order.created_at.desc()).all()


@router.post("/orders/{order_id}/cancel", response_model=OrderRead)
def cancel_student_order(
    order_id: int,
    student: User = Depends(require_student),
    db: Session = Depends(get_db),
) -> Order:
    order = db.query(Order).filter(Order.id == order_id, Order.student_id == student.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable.")
    if order.status != "Pending":
        raise HTTPException(status_code=409, detail="Seule une commande en attente peut être annulée.")
    order.status = "Cancelled"
    order.meal.stock_quantity += order.quantity
    db.commit()
    db.refresh(order)
    invalidate_read_cache()
    return order


@router.get("/vendor/orders", response_model=list[OrderRead])
def get_vendor_orders(
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> list[Order]:
    return db.query(Order).filter(Order.snack_partner_id == partner.id).order_by(Order.created_at.desc()).all()


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> Order:
    order = own_vendor_order(db, order_id, partner)
    target = payload.status

    if target == "Cancelled":
        if order.status not in CANCELLABLE_VENDOR_STATUSES:
            raise HTTPException(status_code=409, detail="Cette commande ne peut plus être annulée.")
        order.status = target
        order.meal.stock_quantity += order.quantity
    elif NEXT_STATUS.get(order.status) == target:
        order.status = target
    else:
        raise HTTPException(status_code=409, detail="Transition de statut non autorisée.")

    db.commit()
    db.refresh(order)
    invalidate_read_cache()
    return order


@router.patch("/orders/{order_id}/payment", response_model=OrderRead)
def update_payment_status(
    order_id: int,
    payload: PaymentStatusUpdate,
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> Order:
    order = own_vendor_order(db, order_id, partner)
    if order.status != "Collected" or order.payment_status != "PayOnPickup":
        raise HTTPException(
            status_code=409,
            detail="Le paiement peut être confirmé uniquement après le retrait de la commande.",
        )
    order.payment_status = payload.status
    db.commit()
    db.refresh(order)
    invalidate_read_cache()
    return order


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(
    partner: SnackPartner = Depends(get_vendor_partner),
    db: Session = Depends(get_db),
) -> dict:
    start_of_day = datetime.combine(datetime.now(UTC).date(), time.min)
    today_orders = (
        db.query(Order)
        .filter(Order.snack_partner_id == partner.id, Order.created_at >= start_of_day)
        .all()
    )
    all_orders = db.query(Order).filter(Order.snack_partner_id == partner.id).all()
    active_value_orders = [order for order in today_orders if order.status != "Cancelled"]
    completed_waits = [order.estimated_waiting_time for order in today_orders if order.status != "Cancelled"]
    meal_counts = Counter(order.meal.name for order in all_orders if order.status != "Cancelled")
    state_counts = Counter(order.status for order in today_orders)
    hour_counts = Counter(order.created_at.strftime("%H:00") for order in all_orders)

    hours = [f"{hour:02d}:00" for hour in range(8, 19)]
    orders_per_hour = [{"hour": hour, "orders": hour_counts.get(hour, 0)} for hour in hours]
    popular_meals = [
        {"name": name, "orders": count}
        for name, count in meal_counts.most_common(6)
    ]
    waiting_time_by_hour = [
        {
            "hour": hour,
            "minutes": round(
                sum(order.estimated_waiting_time for order in all_orders if order.created_at.strftime("%H:00") == hour)
                / max(hour_counts.get(hour, 0), 1),
                1,
            ),
        }
        for hour in hours
    ]

    return {
        "total_orders": len(today_orders),
        "estimated_order_value": round(sum(order.total_price for order in active_value_orders), 2),
        "average_waiting_time": round(sum(completed_waits) / len(completed_waits), 1) if completed_waits else 0,
        "popular_meal": meal_counts.most_common(1)[0][0] if meal_counts else "Aucun plat",
        "orders_by_state": [
            {"status": order_status, "orders": state_counts.get(order_status, 0)}
            for order_status in ("Pending", "Preparing", "Ready", "Collected", "Cancelled")
        ],
        "orders_per_hour": orders_per_hour,
        "popular_meals": popular_meals,
        "waiting_time_by_hour": waiting_time_by_hour,
    }


@router.get("/ai/recommendations", response_model=dict)
def smart_recommendations(
    category: Optional[str] = None,
    limit: int = Query(default=4, ge=1, le=8),
    db: Session = Depends(get_db),
) -> dict:
    normalized_category = category or "all"

    def fetch_recommendations() -> dict:
        return {
            "summary": build_insights_summary(db),
            "recommendations": [
                RecommendationItem.model_validate(item).model_dump(mode="json")
                for item in recommend_meals(db, category=category, limit=limit)
            ],
            "method": "operational_rules",
            "note": "Les estimations reposent sur des règles opérationnelles et les données disponibles du MVP.",
        }

    return api_cache.get_or_set(("smart_recommendations", normalized_category, limit), fetch_recommendations)


@router.get("/ai/peak-hours")
def smart_peak_hours(db: Session = Depends(get_db)) -> dict:
    def fetch_peak_hours() -> dict:
        return {
            "campus": "FPK Khouribga",
            "predictions": predict_peak_hours(db),
            "method": "observed_order_trends",
            "message": "Tendance calculée à partir des commandes disponibles dans le MVP.",
        }

    return api_cache.get_or_set(("smart_peak_hours",), fetch_peak_hours)


@router.get("/vendor/profile")
def vendor_profile(
    vendor: User = Depends(require_vendor),
    partner: SnackPartner = Depends(get_vendor_partner),
) -> dict:
    settings = get_settings()
    return {
        "user": UserRead.model_validate(vendor),
        "partner": SnackPartnerRead.model_validate(partner),
        "session_expires_minutes": settings.access_token_expire_minutes,
    }
