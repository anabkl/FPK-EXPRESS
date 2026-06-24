from __future__ import annotations

from threading import RLock
from time import monotonic

from .config import get_settings


DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)

PRODUCTION_FRONTEND_ORIGIN = "https://fpk-express.vercel.app"

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
}


def normalize_allowed_origins(raw_origins: str, is_production: bool) -> list[str]:
    origins = [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]
    if not origins:
        origins = list(DEFAULT_ALLOWED_ORIGINS)

    if is_production and "*" in origins:
        raise RuntimeError("ALLOWED_ORIGINS cannot contain '*' when APP_ENV=production")

    if is_production:
        origins = [
            origin
            for origin in origins
            if origin != "https://placeholder.invalid"
            and not origin.startswith("http://localhost")
            and not origin.startswith("http://127.0.0.1")
        ]
        if PRODUCTION_FRONTEND_ORIGIN not in origins:
            origins.append(PRODUCTION_FRONTEND_ORIGIN)

    return list(dict.fromkeys(origins))


def get_allowed_origins() -> list[str]:
    settings = get_settings()
    raw_origins = settings.allowed_origins or ",".join(DEFAULT_ALLOWED_ORIGINS)
    origins = normalize_allowed_origins(raw_origins, settings.is_production)

    return origins


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
    settings = get_settings()
    return RateLimiter(
        max_requests=max(settings.rate_limit_requests, 1),
        window_seconds=max(settings.rate_limit_window_seconds, 1),
    )
