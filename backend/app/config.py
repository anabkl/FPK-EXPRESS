from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache


def _as_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    app_env: str
    database_url: str
    allowed_origins: str
    jwt_secret: str
    access_token_expire_minutes: int
    demo_vendor_email: str
    demo_vendor_password: str
    rate_limit_requests: int
    rate_limit_window_seconds: int

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        database_url=os.getenv("DATABASE_URL", "sqlite:///./fpk_express.db"),
        allowed_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173"),
        jwt_secret=os.getenv(
            "JWT_SECRET",
            "development-only-secret-change-before-production-please",
        ),
        access_token_expire_minutes=_as_int("ACCESS_TOKEN_EXPIRE_MINUTES", 480),
        demo_vendor_email=os.getenv("DEMO_VENDOR_EMAIL", "").strip().lower(),
        demo_vendor_password=os.getenv("DEMO_VENDOR_PASSWORD", ""),
        rate_limit_requests=_as_int("RATE_LIMIT_REQUESTS", 120),
        rate_limit_window_seconds=_as_int("RATE_LIMIT_WINDOW_SECONDS", 60),
    )


def validate_production_settings(settings: Settings) -> None:
    if not settings.is_production:
        return

    if settings.jwt_secret.startswith("replace_") or len(settings.jwt_secret) < 32:
        raise RuntimeError("JWT_SECRET must be a strong secret in production.")

    origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
    if not origins or "*" in origins:
        raise RuntimeError("ALLOWED_ORIGINS must list exact production origins.")
