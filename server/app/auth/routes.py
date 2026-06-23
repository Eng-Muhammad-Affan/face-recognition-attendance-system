# app/api/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, Response, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from . import schemas, models, utils
from .schemas import UserSignin
from app.auth.models import User

from app.auth.utils import (
    verify_password,
    create_access_token,
    hash_password,
    set_token_cookie,
    remove_token_cookie,
    require_auth,
    create_reset_token,
    verify_reset_token,
    send_reset_email,
)
from app.core.config import settings
from .schemas import ForgotPasswordRequest, ResetPasswordRequest
from app.core.logger import logger
from uuid import UUID
from datetime import datetime 
from typing import Annotated
from pydantic import BaseModel, StringConstraints
import secrets

from rich import print

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============ PUBLIC ROUTES (No auth required) ============

@router.post("/signup", response_model=schemas.UserOut, status_code=201)
def signup(
    user_data: schemas.UserSignup, 
    response: Response,  # 1. Add the response object here
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.info(f"User Already Exists During Signup: {user_data.email}")
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 2. GENERATE TOKEN & SET COOKIE (Add these lines)
    token = create_access_token(user_id=new_user.id , role=new_user.role)
    set_token_cookie(response, token)
    
    logger.info(f"New signup and auto-login: {user_data.email}")
    
    return new_user


### sign in route 
@router.post("/signin", status_code=200)
def signin(
    user_cred: UserSignin,
    response: Response,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == user_cred.email).first()

    # Verification now uses the pure bcrypt implementation in utils
    if not user or not verify_password(user_cred.password, user.hashed_password):
        logger.warning(f"Failed login attempt for {user_cred.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create access token and set in HTTP-only cookie
    token = create_access_token(user_id=user.id , role=user.role)
    set_token_cookie(response, token)

    logger.info(f"User logged in: {user.email}")
    
    # Return ONLY user info, NEVER the token
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@router.get("/signout", status_code=200)
def signout(response: Response):
    """Logout by removing the HTTP-only cookie"""
    remove_token_cookie(response)
    logger.info("User logged out")
    return {"message": "Logout successful"}




@router.get("/profile", status_code=200)
def get_my_profile(
    user_id:UUID = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get user profile from HTTP-only cookie"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }