from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings, validate_production_settings
from .database import SessionLocal
from .routes import router
from .security import SECURITY_HEADERS, build_rate_limiter, get_allowed_origins
from .seed import seed_database


logger = logging.getLogger("uvicorn.error")
logging.getLogger("uvicorn.access").disabled = True
rate_limiter = build_rate_limiter()


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    validate_production_settings(settings)
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(
    title="FPK-EXPRESS API",
    description="API de précommande et retrait chez les snacks partenaires autour de la FPK Khouribga.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_and_timing_middleware(request: Request, call_next):
    started_at = perf_counter()
    client_ip = request.client.host if request.client else "unknown"

    if not rate_limiter.allow(client_ip):
        response = JSONResponse(
            status_code=429,
            content={"detail": "Trop de requêtes. Veuillez réessayer dans quelques instants."},
        )
    else:
        response = await call_next(request)

    duration_ms = (perf_counter() - started_at) * 1000
    response.headers["X-Response-Time-ms"] = f"{duration_ms:.2f}"
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value

    logger.info(
        "%s %s completed with %s in %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for error in exc.errors():
        location = ".".join(str(part) for part in error.get("loc", [])[1:])
        errors.append({"field": location or "request", "message": error.get("msg", "Valeur invalide")})

    return JSONResponse(
        status_code=422,
        content={"detail": "Les données envoyées ne sont pas valides.", "errors": errors},
    )


@app.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "service": "FPK-EXPRESS",
        "timestamp": datetime.now(UTC).isoformat(),
    }


app.include_router(router)
