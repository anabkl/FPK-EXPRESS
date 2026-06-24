from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from .auth import decode_access_token
from .database import get_db
from .models import SnackPartner, User


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session absente ou expirée.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub", ""))
    except (InvalidTokenError, TypeError, ValueError):
        raise unauthorized from None

    user = db.get(User, user_id)
    if not user or not user.is_active or payload.get("role") != user.role:
        raise unauthorized
    return user


def require_student(user: User = Depends(get_current_user)) -> User:
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Accès réservé aux étudiants.")
    return user


def require_vendor(user: User = Depends(get_current_user)) -> User:
    if user.role != "vendor":
        raise HTTPException(status_code=403, detail="Accès réservé aux vendeurs.")
    return user


def get_vendor_partner(
    vendor: User = Depends(require_vendor),
    db: Session = Depends(get_db),
) -> SnackPartner:
    partner = db.query(SnackPartner).filter(SnackPartner.owner_id == vendor.id).first()
    if not partner:
        raise HTTPException(status_code=403, detail="Aucun snack partenaire associé à ce compte.")
    return partner
