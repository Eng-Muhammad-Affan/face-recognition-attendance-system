# app/api/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, Form , UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.auth.models import User
from app.auth.models import FaceEmbedding

from app.auth.generate_random import generate_registration_number 

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

from app.core.logger import logger

from app.services.face_service import FaceExtractor 

from rich import print

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

face_service = FaceExtractor()


# ============ PUBLIC ROUTES (No auth required) ============

@router.post("/signup", status_code=201)
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    department: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Check existing user
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    try:
        # ✅ Use the new embedding method
        result = await face_service.extract_single_face_with_embedding(image)
        
        if result is None:
            raise HTTPException(400, "No face detected")
        
        embedding = result['embedding']  # This is the 1D vector (512,)
        
        print(f"✅ Embedding shape: {embedding.shape}")  # (512,)
        print(f"✅ Embedding dtype: {embedding.dtype}")  # float32
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    
    # Create user
    new_user = User(
        registration_number=generate_registration_number(),
        name=name,
        email=email,
        department=department,  # ✅ Added missing field
    )
    db.add(new_user)
    db.flush()
    
    # Save embedding
    face_embedding = FaceEmbedding(
        student_id=new_user.id,
        embedding=embedding.tolist()  # ✅ Convert to list for pgvector
    )
    db.add(face_embedding)
    
    db.commit()
    db.refresh(new_user)
    
    return {
        "status": "success",
        "student_id": new_user.id,
        "registration_number": new_user.registration_number,
        "name": new_user.name,
        "embedding_dimension": len(embedding)
    }


    # ----
    # new_user = User(
    #     name=user_data.name,
    #     email=user_data.email,
    #     role="user"
    # )
    # db.add(new_user)
    # db.commit()
    # db.refresh(new_user)
    
    # # 2. GENERATE TOKEN & SET COOKIE (Add these lines)
    # token = create_access_token(user_id=new_user.id , role=new_user.role)
    # set_token_cookie(response, token)
    
    # logger.info(f"New signup and auto-login: {user_data.email}")
    
    # return new_user


# ### sign in route 
# @router.post("/signin", status_code=200)
# def signin(
#     user_cred: UserSignin,
#     response: Response,
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.email == user_cred.email).first()

#     # Verification now uses the pure bcrypt implementation in utils
#     if not user or not verify_password(user_cred.password, user.hashed_password):
#         logger.warning(f"Failed login attempt for {user_cred.email}")
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     # Create access token and set in HTTP-only cookie
#     token = create_access_token(user_id=user.id , role=user.role)
#     set_token_cookie(response, token)

#     logger.info(f"User logged in: {user.email}")
    
#     # Return ONLY user info, NEVER the token
#     return {
#         "message": "Login successful",
#         "user": {
#             "id": user.id,
#             "name": user.name,
#             "email": user.email,
#             "role": user.role
#         }
#     }