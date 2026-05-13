from datetime import datetime, timedelta, timezone
from typing import cast
from jose import jwt, JWTError
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    JWT_ISSUER,
    JWT_AUDIENCE,
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

def create_access_token(
    *,
    subject: str,
    role: str
) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": subject,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "jti": str(uuid.uuid4())
    }

    token = jwt.encode(
        payload,
        SECRET_KEY, # pyright: ignore[reportArgumentType]
        algorithm=cast(str, ALGORITHM)
    )

    return token

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY, # type: ignore
            algorithms=[cast(str, ALGORITHM)],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER
        )
        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = decode_access_token(token)

    user_id: str = payload.get("sub") # type: ignore
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return payload

def require_role(required_roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")

        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    return role_checker

def create_refresh_token(*, user_id: int) -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    jti = str(uuid.uuid4())

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "jti": jti,
        "type": "refresh",
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,  # type: ignore
        algorithm=cast(str, ALGORITHM),
    )

    return token, jti


def decode_refresh_token(token: str) -> dict:
    """Decode and validate a refresh token (no issuer/audience)."""
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,  # type: ignore
            algorithms=[cast(str, ALGORITHM)],
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )