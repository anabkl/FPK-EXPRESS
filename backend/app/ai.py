from __future__ import annotations

from collections import Counter
from datetime import UTC, datetime
from typing import Optional

from sqlalchemy.orm import Session

from .models import Meal, Order


ACTIVE_STATUSES = ("Pending", "Preparing")


def estimate_waiting_time(db: Session, meal: Meal, quantity: int = 1) -> int:
    active_orders = (
        db.query(Order)
        .filter(
            Order.snack_partner_id == meal.snack_partner_id,
            Order.status.in_(ACTIVE_STATUSES),
        )
        .count()
    )
    queue_minutes = active_orders * 3
    prep_minutes = meal.preparation_time + max(quantity - 1, 0) * 2
    return min(max(prep_minutes + queue_minutes, 4), 60)


def recommendation_reason(meal: Meal) -> str:
    if meal.category == "Healthy":
        return "Option équilibrée avec une préparation rapide."
    if meal.category == "Budget etudiant":
        return "Bon rapport qualité-prix pour une pause courte."
    if meal.popularity_score >= 90:
        return "Choix souvent consulté dans le menu du MVP."
    return "Choix disponible avec un temps de préparation prévisible."


def recommend_meals(db: Session, category: Optional[str] = None, limit: int = 4) -> list[dict]:
    query = (
        db.query(Meal)
        .filter(
            Meal.is_available.is_(True),
            Meal.stock_quantity > 0,
        )
    )
    if category:
        query = query.filter(Meal.category == category)

    meals = query.order_by(Meal.popularity_score.desc(), Meal.preparation_time.asc()).limit(limit).all()
    return [{"meal": meal, "reason": recommendation_reason(meal)} for meal in meals]


def predict_peak_hours(db: Session, partner_id: int | None = None) -> list[dict]:
    query = db.query(Order)
    if partner_id is not None:
        query = query.filter(Order.snack_partner_id == partner_id)

    counts = Counter(order.created_at.strftime("%H:00") for order in query.all())
    if not counts:
        return []

    maximum = max(counts.values())
    predictions = []
    for hour, count in sorted(counts.items()):
        demand_score = round((count / maximum) * 100)
        predictions.append(
            {
                "hour": hour,
                "demand_score": demand_score,
                "level": "High" if demand_score >= 75 else "Medium" if demand_score >= 45 else "Low",
                "recommendation": "Précommander 20 min avant" if demand_score >= 75 else "Précommander 10 min avant",
            }
        )
    return predictions


def build_insights_summary(db: Session) -> dict:
    active_orders = db.query(Order).filter(Order.status.in_(ACTIVE_STATUSES)).count()
    top_meal = (
        db.query(Meal)
        .filter(Meal.is_available.is_(True))
        .order_by(Meal.popularity_score.desc(), Meal.preparation_time.asc())
        .first()
    )
    current_hour = datetime.now(UTC).hour
    return {
        "active_orders": active_orders,
        "top_recommendation": top_meal.name if top_meal else "Aucun plat disponible",
        "campus_load": "Élevée" if active_orders >= 5 else "Normale",
        "insight": (
            f"Tendance calculée à {current_hour:02d}:00 à partir des commandes et disponibilités du MVP."
        ),
    }
