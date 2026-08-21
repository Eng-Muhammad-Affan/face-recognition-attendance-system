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
from app.orders.models import AccountClaimToken
from datetime import datetime 
from typing import Annotated
from pydantic import BaseModel, StringConstraints
import secrets
from app.orders.checkout_routes import send_order_confirmation
from app.orders.models import Order, OrderItem , OrderStatus

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


@router.post("/forgot-password", status_code=200)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if user exists for security
        logger.info(f"Password reset requested for non-existent email: {request.email}")
        return {"message": "If the email exists, a reset link has been sent"}

    token = create_reset_token(user.email)
    send_reset_email(user.email, token)
    logger.info(f"Password reset requested for {request.email}")
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password", status_code=200)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_reset_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hashing now uses the pure bcrypt implementation in utils
    user.hashed_password = hash_password(request.new_password)
    db.commit()
    logger.info(f"Password reset completed for {email}")
    return {"message": "Password reset successful"}


# ============ PROTECTED ROUTES (Cookie auth required) ============

@router.get("/me", status_code=200)
def get_current_user_info(
    user_id: UUID = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get current user info from HTTP-only cookie"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Return ONLY user info, NO token data
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


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

class ClaimAccountRequest(BaseModel):
    token: str
    password: Annotated[str, StringConstraints(min_length=8, max_length=128)]

@router.post("/claim-account")
async def claim_account(payload: ClaimAccountRequest, 
                        response:Response,
                        db: Session = Depends(get_db)):
    # 1. Look up active token details
    db_token = db.query(AccountClaimToken).filter(
        AccountClaimToken.token == payload.token,
        AccountClaimToken.is_used == False,
        AccountClaimToken.expires_at > datetime.utcnow()
    ).first()

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The activation link is invalid or has expired."
        )

    # 2. Check if a real registered user profile already exists with this email
    user = db.query(User).filter(User.email == db_token.email).first()

    if user and user.hashed_password is not None:
        # User already completed registration previously
        db_token.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already setup for this user. Please sign in directly."
        )

    # 3. Create or convert guest user to standard user record
    hashed_pwd = hash_password(payload.password)
    
    if not user:
        # Create brand new user row if checkout didn't automatically instantiate one
        user = User(
            email=db_token.email,
            hashed_password=hashed_pwd,
            role="user",
            name=db_token.name # Fallback, or search from latest order details
        )
        db.add(user)
    else:
        # Convert guest account to fully initialized account
        user.hashed_password = hashed_pwd
    
    # 4. Mark activation token spent
    db_token.is_used = True
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id , role=user.role)
    set_token_cookie(response, token)
    return {
        "message": "Account securely established! Welcome aboard.",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "name": user.name
        }
    }


# Updated request schema to accept explicit email input
class ResendEmailRequest(BaseModel):
    email: str

@router.post("/claim-account/resend")
async def resend_claim_token_by_email(
    payload: ResendEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Look up the most recent order associated with this email address
    order = db.query(Order).filter_by(user_email=payload.email).order_by(Order.created_at.desc()).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No order record found matching this email address."
        )

    # 2. Check if a claim token record already exists for this order, or create a new one
    token_record = db.query(AccountClaimToken).filter_by(order_id=order.id).first()
    
    now = datetime.utcnow()

    # Rate limiting cooldown check (60-second window)
    if token_record:
        time_since_last_action = now - token_record.created_at
        if time_since_last_action.total_seconds() < 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="An activation email was recently sent. Please wait 60 seconds before requesting another."
            )
    
    # 3. Generate a fresh, cryptographically strong token string
    new_secure_token = secrets.token_urlsafe(32)
    
    if token_record:
        # Update existing record layout
        token_record.token = new_secure_token
        token_record.updated_at = now
    else:
        # Fallback if row was dropped or missing: create brand-new record mapping
        token_record = AccountClaimToken(
            email=order.user_email,
            order_id=order.id,
            token=new_secure_token,
            created_at=now,
            updated_at=now
        )
        db.add(token_record)
        
    db.commit()

    # 4. Format line items clean mapping for layout compilation
    order_items_data = [
        {
            'name': item.product.productName,
            'quantity': item.quantity,
            'price': item.price_at_purchase,
            'subtotal': item.price_at_purchase * item.quantity
        }
        for item in order.items
    ]

    # 5. Dispatch confirmation email payload to background runner task
    background_tasks.add_task(
        send_order_confirmation,
        email=order.user_email,
        order_id=str(order.id),
        total=order.total_amount,
        claim_token=new_secure_token,
        user_name=order.user_name,
        phone_number=order.phone_number,
        address=order.address,
        city=order.city,
        province=order.province,
        zipcode=order.zipcode,
        status=order.status,
        created_at=order.created_at.strftime("%B %d, %Y at %I:%M %p"),
        order_note=order.order_note,
        items=order_items_data
    )

    logger.info(f"Fresh account activation link issued successfully for: {order.user_email}")

    return {
        "success": True,
        "message": "A new activation link has been sent to your email inbox!"
    }