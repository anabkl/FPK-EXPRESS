from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from app.auth import hash_password
from app.models import Meal, SnackPartner, User


def future_pickup_time(minutes=30):
    pickup = datetime.now(ZoneInfo("Africa/Casablanca")) + timedelta(minutes=minutes)
    return pickup.strftime("%H:%M")


def create_order(client, headers, meal_id, **overrides):
    payload = {
        "student_department": "GI",
        "meal_id": meal_id,
        "quantity": 1,
        "pickup_time": future_pickup_time(),
    }
    payload.update(overrides)
    return client.post("/orders", json=payload, headers=headers)


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_student_registration_and_duplicate_email_rejection(client):
    payload = {"full_name": "Nour Saidi", "email": "NOUR@example.com", "password": "StudentPass123!"}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["user"]["role"] == "student"
    assert response.json()["user"]["email"] == "nour@example.com"
    assert "password_hash" not in response.text

    duplicate = client.post("/auth/register", json={**payload, "email": "nour@example.com"})
    assert duplicate.status_code == 409


def test_login_success_and_incorrect_password_rejection(client, student_headers):
    success = client.post("/auth/login", json={"email": "hiba@example.com", "password": "StudentPass123!"})
    assert success.status_code == 200
    assert success.json()["token_type"] == "bearer"

    rejected = client.post("/auth/login", json={"email": "hiba@example.com", "password": "WrongPass123!"})
    assert rejected.status_code == 401


def test_protected_endpoint_requires_token(client):
    assert client.get("/orders").status_code == 401
    assert client.get("/vendor/orders").status_code == 401


def test_student_is_forbidden_from_vendor_endpoint(client, student_headers):
    response = client.get("/vendor/orders", headers=student_headers)
    assert response.status_code == 403


def test_vendor_can_access_own_scoped_endpoints(client, vendor_headers):
    meals = client.get("/vendor/meals", headers=vendor_headers)
    profile = client.get("/vendor/profile", headers=vendor_headers)
    assert meals.status_code == 200
    assert len(meals.json()) >= 1
    assert profile.status_code == 200
    assert profile.json()["partner"]["name"] == "Snack Campus Atlas"


def test_vendor_cannot_access_another_vendors_order(client, db, student_headers):
    first_meal = db.query(Meal).first()
    order_response = create_order(client, student_headers, first_meal.id)
    assert order_response.status_code == 201

    second_vendor = User(
        full_name="Second Vendor",
        email="vendor2@example.com",
        password_hash=hash_password("VendorTwo123!"),
        role="vendor",
        is_active=True,
    )
    db.add(second_vendor)
    db.flush()
    db.add(SnackPartner(name="Snack Secondaire", address="Khouribga", owner_id=second_vendor.id))
    db.commit()

    login = client.post("/auth/login", json={"email": "vendor2@example.com", "password": "VendorTwo123!"})
    second_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    denied = client.patch(
        f"/orders/{order_response.json()['id']}/status",
        json={"status": "Preparing"},
        headers=second_headers,
    )
    assert denied.status_code == 404


def test_student_creates_order_and_sees_only_own_history(client, student_headers):
    meal_id = client.get("/meals").json()[0]["id"]
    created = create_order(client, student_headers, meal_id)
    assert created.status_code == 201, created.text
    assert created.json()["payment_method"] == "PayOnPickup"
    assert created.json()["payment_status"] == "PayOnPickup"
    assert created.json()["order_reference"].startswith("FPK-")

    second = client.post(
        "/auth/register",
        json={"full_name": "Omar Idrissi", "email": "omar@example.com", "password": "StudentPass123!"},
    )
    second_headers = {"Authorization": f"Bearer {second.json()['access_token']}"}
    assert client.get("/orders", headers=second_headers).json() == []
    assert len(client.get("/orders", headers=student_headers).json()) == 1


def test_invalid_order_and_payment_transitions_are_rejected(client, student_headers, vendor_headers):
    meal_id = client.get("/meals").json()[0]["id"]
    created = create_order(client, student_headers, meal_id).json()

    invalid_status = client.patch(
        f"/orders/{created['id']}/status",
        json={"status": "Ready"},
        headers=vendor_headers,
    )
    assert invalid_status.status_code == 409

    invalid_payment = client.patch(
        f"/orders/{created['id']}/payment",
        json={"status": "PaidOnPickup"},
        headers=vendor_headers,
    )
    assert invalid_payment.status_code == 409

    for next_status in ("Preparing", "Ready", "Collected"):
        response = client.patch(
            f"/orders/{created['id']}/status",
            json={"status": next_status},
            headers=vendor_headers,
        )
        assert response.status_code == 200, response.text

    paid = client.patch(
        f"/orders/{created['id']}/payment",
        json={"status": "PaidOnPickup"},
        headers=vendor_headers,
    )
    assert paid.status_code == 200
    assert paid.json()["payment_status"] == "PaidOnPickup"

    repeated = client.patch(
        f"/orders/{created['id']}/payment",
        json={"status": "PaidOnPickup"},
        headers=vendor_headers,
    )
    assert repeated.status_code == 409


def test_invalid_meal_payload_is_rejected(client, vendor_headers):
    response = client.post(
        "/meals",
        headers=vendor_headers,
        json={
            "name": "X",
            "category": "Unknown",
            "price": -10,
            "description": "short",
            "image_url": "javascript:alert(1)",
            "preparation_time": 0,
            "is_available": True,
            "popularity_score": 101,
            "stock_quantity": -2,
        },
    )
    assert response.status_code == 422


def test_invalid_quantity_and_pickup_time_are_rejected(client, student_headers):
    meal_id = client.get("/meals").json()[0]["id"]
    invalid_quantity = create_order(client, student_headers, meal_id, quantity=0)
    invalid_pickup = create_order(client, student_headers, meal_id, pickup_time="99:99")
    pickup_too_far = create_order(client, student_headers, meal_id, pickup_time=future_pickup_time(10 * 60))
    assert invalid_quantity.status_code == 422
    assert invalid_pickup.status_code == 422
    assert pickup_too_far.status_code == 422
