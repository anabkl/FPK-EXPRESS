from __future__ import annotations

import os
from pathlib import Path


TEST_DATABASE = Path("/tmp/fpk_express_test.db")
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DATABASE}"
os.environ["JWT_SECRET"] = "test-secret-that-is-long-enough-for-signed-access-tokens"
os.environ["DEMO_VENDOR_EMAIL"] = "vendor@example.com"
os.environ["DEMO_VENDOR_PASSWORD"] = "VendorPass123!"
os.environ["RATE_LIMIT_REQUESTS"] = "10000"
os.environ["RATE_LIMIT_WINDOW_SECONDS"] = "60"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.seed import seed_database


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db():
    with SessionLocal() as session:
        yield session


def auth_headers(client: TestClient, email: str, password: str) -> dict[str, str]:
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture
def vendor_headers(client):
    return auth_headers(client, "vendor@example.com", "VendorPass123!")


@pytest.fixture
def student_headers(client):
    response = client.post(
        "/auth/register",
        json={"full_name": "Hiba Mansouri", "email": "hiba@example.com", "password": "StudentPass123!"},
    )
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
