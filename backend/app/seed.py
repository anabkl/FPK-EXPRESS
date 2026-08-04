from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from .auth import hash_password
from .config import get_settings
from .models import Meal, SnackPartner, User


logger = logging.getLogger("uvicorn.error")

MEALS = [
    {
        "name": "Sandwich Poulet",
        "category": "Sandwichs",
        "price": 18,
        "description": "Poulet grillé, salade, tomate, sauce maison et pain frais.",
        "image_url": "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 8,
        "is_available": True,
        "popularity_score": 94,
        "stock_quantity": 40,
    },
    {
        "name": "Tacos Mixte",
        "category": "Tacos",
        "price": 32,
        "description": "Tacos poulet et viande hachée avec frites et sauce fromagère.",
        "image_url": "https://images.unsplash.com/photo-1624300629298-e9de39c13be8?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 14,
        "is_available": True,
        "popularity_score": 91,
        "stock_quantity": 30,
    },
    {
        "name": "Panini Thon",
        "category": "Sandwichs",
        "price": 16,
        "description": "Panini chaud au thon, fromage, olives et maïs.",
        "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 7,
        "is_available": True,
        "popularity_score": 78,
        "stock_quantity": 35,
    },
    {
        "name": "Salade Healthy",
        "category": "Healthy",
        "price": 24,
        "description": "Riz, légumes frais, oeuf, thon, maïs et vinaigrette légère.",
        "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 6,
        "is_available": True,
        "popularity_score": 86,
        "stock_quantity": 25,
    },
    {
        "name": "Jus d'orange",
        "category": "Boissons",
        "price": 10,
        "description": "Jus d'orange frais, parfait avant un cours du matin.",
        "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 4,
        "is_available": True,
        "popularity_score": 84,
        "stock_quantity": 50,
    },
    {
        "name": "Café",
        "category": "Boissons",
        "price": 5,
        "description": "Café noir préparé rapidement pour les pauses courtes.",
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 3,
        "is_available": True,
        "popularity_score": 88,
        "stock_quantity": 100,
    },
    {
        "name": "Bol Couscous du Vendredi",
        "category": "Healthy",
        "price": 35,
        "description": "Bol couscous revisité avec légumes, pois chiches et poulet.",
        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 12,
        "is_available": True,
        "popularity_score": 89,
        "stock_quantity": 20,
    },
    {
        "name": "Menu Budget Étudiant",
        "category": "Budget etudiant",
        "price": 20,
        "description": "Mini sandwich, boisson et fruit pour un repas simple et abordable.",
        "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
        "preparation_time": 6,
        "is_available": True,
        "popularity_score": 93,
        "stock_quantity": 40,
    },
]


def _is_configured_vendor(email: str, password: str) -> bool:
    return bool(
        email
        and password
        and len(password) >= 8
        and not password.startswith("replace_")
        and "@" in email
    )


def seed_database(db: Session) -> None:
    settings = get_settings()
    vendor = None
    if _is_configured_vendor(settings.demo_vendor_email, settings.demo_vendor_password):
        vendor = db.query(User).filter(User.email == settings.demo_vendor_email).first()
        if not vendor:
            vendor = User(
                full_name="Partenaire FPK-EXPRESS",
                email=settings.demo_vendor_email,
                password_hash=hash_password(settings.demo_vendor_password),
                role="vendor",
                is_active=True,
            )
            db.add(vendor)
            db.flush()

    partner = db.query(SnackPartner).order_by(SnackPartner.id).first()
    if not partner:
        partner = SnackPartner(
            name="Snack Campus Atlas",
            address="À proximité de la FPK Khouribga",
            is_open=True,
            owner_id=vendor.id if vendor else None,
        )
        db.add(partner)
        db.flush()
    elif vendor and partner.owner_id is None:
        partner.owner_id = vendor.id

    if db.query(Meal).count() == 0:
        db.add_all([Meal(snack_partner_id=partner.id, **item) for item in MEALS])

    db.commit()

    if not vendor:
        logger.info("Demo vendor was not seeded because secure vendor environment values are not configured.")
