from app.core.logger import logger

from app.services.face_service import FaceService 
from app.services.file_upload import SupabaseBlobUpload 

from app.features.auth import UserSignup

class AuthService: 
    def __init__(self, db):
        self.db = db

    async def signup(self, payload:dict):
    name: str = Form(...),
    email: str = Form(...),
    department: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
    # ✅ 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(409, "Email already registered")
    
    uploaded_filedata = blob_upload.upload_file_to_supabase(image)

    # ✅ 2. Create user in database
    new_user = User(
        registration_number=generate_registration_number(),
        name=name,
        email=email,
        department=department
    )
    db.add(new_user)
    db.flush()  # Get user.id without committing

    # ✅ 3. Extract embedding from uploaded image
    try:
        embedding = await face_service.extract_embedding(image)
        # This already validates: exactly 1 face, no multiple faces
    except ValueError as e:
        raise HTTPException(400, str(e))
    
    # ✅ 4. Convert embedding to list for pgvector
    embedding_list = face_service.get_embedding_for_storage(embedding)
    
    # ✅ 5. Store embedding in database
    face_embedding = FaceEmbedding(
        student_id=new_user.id,
        embedding=embedding_list
    )
    db.add(face_embedding)
    
    # ✅ 6. Commit everything
    db.commit()
    db.refresh(new_user)
    
    # ✅ 7. Return response
    return {
        "status": "success",
        "student_id": new_user.id,
        "registration_number": new_user.registration_number,
        "name": new_user.name
    }

    

# app/api/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, Form , UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.auth.models import User
from app.auth.models import FaceEmbedding
from app.logs.models import AttendanceLog
from datetime import datetime
from dateutil import parser 

import numpy as np
from app.auth.generate_random import generate_registration_number 

# from app.auth.utils import (
#     verify_password,
#     create_access_token,
#     hash_password,
#     set_token_cookie,
#     remove_token_cookie,
#     require_auth,
#     create_reset_token,
#     verify_reset_token,
#     send_reset_email,
# )

# ============ PUBLIC ROUTES (No auth required) ============
