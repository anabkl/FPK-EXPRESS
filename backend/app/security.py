from __future__ import annotations

import os
from threading import RLock
from time import monotonic


DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
}


def get_app_environment() -> str:
    return os.getenv("APP_ENV", "development").strip().lower() or "development"


def get_allowed_origins() -> list[str]:
    raw_origins = os.getenv("ALLOWED_ORIGINS", ",".join(DEFAULT_ALLOWED_ORIGINS))
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    if not origins:
        origins = list(DEFAULT_ALLOWED_ORIGINS)

    if get_app_environment() == "production" and "*" in origins:
        raise RuntimeError("ALLOWED_ORIGINS cannot contain '*' when APP_ENV=production")

    return origins


def get_int_env(name: str, default: int, minimum: int = 1) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return max(value, minimum)


class RateLimiter:
    """Tiny IP-based sliding-window limiter for the MVP API process."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = {}
        self._lock = RLock()

    def allow(self, client_ip: str) -> bool:
        now = monotonic()
        window_start = now - self.window_seconds

        with self._lock:
            recent_requests = [
                timestamp
                for timestamp in self._requests.get(client_ip, [])
                if timestamp >= window_start
            ]
            if len(recent_requests) >= self.max_requests:
                self._requests[client_ip] = recent_requests
                return False

            recent_requests.append(now)
            self._requests[client_ip] = recent_requests
            return True


def build_rate_limiter() -> RateLimiter:
    return RateLimiter(
        max_requests=get_int_env("RATE_LIMIT_REQUESTS", 120),
        window_seconds=get_int_env("RATE_LIMIT_WINDOW_SECONDS", 60),
    )
