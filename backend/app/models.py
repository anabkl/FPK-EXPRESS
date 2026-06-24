from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    snack_partners: Mapped[list[SnackPartner]] = relationship(back_populates="owner")
    orders: Mapped[list[Order]] = relationship(back_populates="student")


class SnackPartner(Base):
    __tablename__ = "snack_partners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    address: Mapped[str] = mapped_column(String(240))
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    owner: Mapped[User | None] = relationship(back_populates="snack_partners")
    meals: Mapped[list[Meal]] = relationship(back_populates="snack_partner")
    orders: Mapped[list[Order]] = relationship(back_populates="snack_partner")


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    snack_partner_id: Mapped[int] = mapped_column(ForeignKey("snack_partners.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    category: Mapped[str] = mapped_column(String(60), index=True)
    price: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    preparation_time: Mapped[int] = mapped_column(Integer)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    popularity_score: Mapped[int] = mapped_column(Integer, default=50)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    snack_partner: Mapped[SnackPartner] = relationship(back_populates="meals")
    orders: Mapped[list[Order]] = relationship(back_populates="meal")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_reference: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    snack_partner_id: Mapped[int] = mapped_column(ForeignKey("snack_partners.id"), index=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id"), index=True)
    student_department: Mapped[str] = mapped_column(String(40), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    pickup_time: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(30), default="Pending", index=True)
    payment_method: Mapped[str] = mapped_column(String(30), default="PayOnPickup")
    payment_status: Mapped[str] = mapped_column(String(30), default="PayOnPickup", index=True)
    total_price: Mapped[float] = mapped_column(Float)
    estimated_waiting_time: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    student: Mapped[User] = relationship(back_populates="orders")
    snack_partner: Mapped[SnackPartner] = relationship(back_populates="orders")
    meal: Mapped[Meal] = relationship(back_populates="orders")

    @property
    def student_name(self) -> str:
        return self.student.full_name
