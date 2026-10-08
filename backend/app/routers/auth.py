from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    CurrentUserResponse,
)
from app.services import auth_service
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserResponse)
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    return auth_service.register_user(db, user)


@router.post("/login", response_model=TokenResponse)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    return auth_service.login_user(db, user)


@router.get("/me", response_model=CurrentUserResponse)
def get_me(
    current_user=Depends(get_current_user)
):
    return current_user