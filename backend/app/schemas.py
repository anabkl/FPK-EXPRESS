from datetime import datetime
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator


Department = Literal["GI", "MIP", "SMA", "BCG", "PC", "SVI"]
MealCategory = Literal["Sandwichs", "Tacos", "Healthy", "Budget etudiant", "Boissons"]
OrderStatus = Literal["Pending", "Preparing", "Ready", "Completed"]


def clean_text(value: str) -> str:
    return " ".join(str(value).replace("\x00", " ").split()).strip()


class StrictBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class MealBase(StrictBaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    category: MealCategory
    price: float = Field(..., ge=5, le=35)
    description: str = Field(..., min_length=10, max_length=240)
    image_url: str = Field(..., min_length=8, max_length=500)
    preparation_time: int = Field(..., ge=1, le=30)
    is_available: bool = True
    popularity_score: int = Field(default=50, ge=0, le=100)

    @field_validator("name", "description", "image_url", mode="before")
    @classmethod
    def normalize_text_fields(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Must be text.")
        return clean_text(value)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Image URL must use http or https.")
        return value


class MealCreate(MealBase):
    pass


class MealRead(MealBase):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)

    id: int


class OrderCreate(StrictBaseModel):
    student_name: str = Field(..., min_length=2, max_length=80)
    student_department: Department
    meal_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, ge=1, le=10)
    pickup_time: str = Field(..., pattern=r"^([01]\d|2[0-3]):[0-5]\d$")

    @field_validator("student_name", mode="before")
    @classmethod
    def normalize_student_name(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Student name must be text.")
        return clean_text(value)

    @field_validator("student_name")
    @classmethod
    def validate_student_name(cls, value: str) -> str:
        if not any(character.isalpha() for character in value):
            raise ValueError("Student name must contain letters.")
        return value


class OrderStatusUpdate(StrictBaseModel):
    status: OrderStatus


class OrderRead(StrictBaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_name: str
    student_department: Department
    meal_id: int
    quantity: int
    pickup_time: str
    status: OrderStatus
    total_price: float
    estimated_waiting_time: int
    created_at: datetime
    meal: MealRead


class RecommendationItem(StrictBaseModel):
    meal: MealRead
    reason: str
    confidence: float


class DashboardStats(StrictBaseModel):
    total_orders: int
    revenue_today: float
    average_waiting_time: float
    popular_meal: str
    orders_per_hour: list[dict]
    popular_meals: list[dict]
    waiting_time_by_hour: list[dict]
