from __future__ import annotations

from datetime import datetime
from typing import Literal
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


Role = Literal["student", "vendor"]
Department = Literal["GI", "MIP", "SMA", "BCG", "PC", "SVI"]
MealCategory = Literal["Sandwichs", "Tacos", "Healthy", "Budget etudiant", "Boissons"]
OrderStatus = Literal["Pending", "Preparing", "Ready", "Collected", "Cancelled"]
PaymentStatus = Literal["PayOnPickup", "PaidOnPickup"]


def clean_text(value: str) -> str:
    return " ".join(str(value).replace("\x00", " ").split()).strip()


class StrictBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class UserRead(StrictBaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: Role
    is_active: bool


class RegisterRequest(StrictBaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Le nom doit être du texte.")
        return clean_text(value)

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not any(character.isalpha() for character in value):
            raise ValueError("Le nom doit contenir des lettres.")
        return value

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class LoginRequest(StrictBaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class AuthResponse(StrictBaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserRead


class SnackPartnerRead(StrictBaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    is_open: bool


class PartnerUpdate(StrictBaseModel):
    is_open: bool


class MealBase(StrictBaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    category: MealCategory
    price: float = Field(..., ge=1, le=100)
    description: str = Field(..., min_length=10, max_length=300)
    image_url: str = Field(default="", max_length=500)
    preparation_time: int = Field(..., ge=1, le=60)
    is_available: bool = True
    popularity_score: int = Field(default=50, ge=0, le=100)
    stock_quantity: int = Field(default=100, ge=0, le=1000)

    @field_validator("name", "description", "image_url", mode="before")
    @classmethod
    def normalize_text_fields(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Cette valeur doit être du texte.")
        return clean_text(value)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        if not value:
            return value
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("L'URL de l'image doit utiliser http ou https.")
        return value


class MealCreate(MealBase):
    pass


class MealUpdate(StrictBaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    category: MealCategory | None = None
    price: float | None = Field(default=None, ge=1, le=100)
    description: str | None = Field(default=None, min_length=10, max_length=300)
    image_url: str | None = Field(default=None, max_length=500)
    preparation_time: int | None = Field(default=None, ge=1, le=60)
    is_available: bool | None = None
    popularity_score: int | None = Field(default=None, ge=0, le=100)
    stock_quantity: int | None = Field(default=None, ge=0, le=1000)

    @field_validator("name", "description", "image_url", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not isinstance(value, str):
            raise ValueError("Cette valeur doit être du texte.")
        return clean_text(value)

    @field_validator("image_url")
    @classmethod
    def validate_optional_image_url(cls, value: str | None) -> str | None:
        if value in {None, ""}:
            return value
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("L'URL de l'image doit utiliser http ou https.")
        return value

    @model_validator(mode="after")
    def require_update(self) -> "MealUpdate":
        if not self.model_fields_set:
            raise ValueError("Au moins un champ doit être modifié.")
        return self


class MealRead(MealBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    snack_partner_id: int
    snack_partner: SnackPartnerRead
    created_at: datetime
    updated_at: datetime


class OrderCreate(StrictBaseModel):
    student_department: Department
    meal_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, ge=1, le=10)
    pickup_time: str = Field(..., pattern=r"^([01]\d|2[0-3]):[0-5]\d$")

    @field_validator("pickup_time")
    @classmethod
    def validate_future_pickup_time(cls, value: str) -> str:
        hours, minutes = (int(part) for part in value.split(":"))
        now = datetime.now(ZoneInfo("Africa/Casablanca"))
        current_minutes = now.hour * 60 + now.minute
        pickup_minutes = hours * 60 + minutes
        minutes_until_pickup = (pickup_minutes - current_minutes) % (24 * 60)
        if minutes_until_pickup < 5 or minutes_until_pickup > 8 * 60:
            raise ValueError("L'heure de retrait doit être comprise entre 5 minutes et 8 heures à venir.")
        return value


class OrderStatusUpdate(StrictBaseModel):
    status: OrderStatus


class PaymentStatusUpdate(StrictBaseModel):
    status: Literal["PaidOnPickup"]


class OrderRead(StrictBaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_reference: str
    student_id: int
    student_name: str
    student_department: Department
    snack_partner_id: int
    meal_id: int
    quantity: int
    pickup_time: str
    status: OrderStatus
    payment_method: Literal["PayOnPickup"]
    payment_status: PaymentStatus
    total_price: float
    estimated_waiting_time: int
    created_at: datetime
    updated_at: datetime
    meal: MealRead
    snack_partner: SnackPartnerRead


class RecommendationItem(StrictBaseModel):
    meal: MealRead
    reason: str


class DashboardStats(StrictBaseModel):
    total_orders: int
    estimated_order_value: float
    average_waiting_time: float
    popular_meal: str
    orders_by_state: list[dict]
    orders_per_hour: list[dict]
    popular_meals: list[dict]
    waiting_time_by_hour: list[dict]
