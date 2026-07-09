# app/api/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, Form , UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.auth.models import User
from app.auth.models import FaceEmbedding
from app.logs.models import AttendanceLog
from datetime import datetime
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

from app.core.logger import logger

from app.services.face_service import FaceService 

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

face_service = FaceService()


# ============ PUBLIC ROUTES (No auth required) ============

@router.post("/signup", status_code=201)
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    department: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # ✅ 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(409, "Email already registered")
    
    # ✅ 2. Extract embedding from uploaded image
    try:
        embedding = await face_service.extract_embedding(image)
        # This already validates: exactly 1 face, no multiple faces
    except ValueError as e:
        raise HTTPException(400, str(e))
    
    # ✅ 3. Create user in database
    new_user = User(
        registration_number=generate_registration_number(),
        name=name,
        email=email,
        department=department
    )
    db.add(new_user)
    db.flush()  # Get user.id without committing
    
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

@router.post("/mark-attendance")
async def mark_attendance(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # ✅ 1. Extract embedding from attendance image
    try:
        new_embedding = await face_service.extract_embedding(image)
        
        # FIXED: Check shape and log correctly
        logger.info(f"New embedding shape: {new_embedding.shape}")
        logger.info(f"New embedding type: {type(new_embedding)}")
        
        # Handle both 1D and 2D arrays
        if new_embedding.ndim == 1:
            logger.info(f"New embedding sample (first 5): {new_embedding[:5]}")
            logger.info(f"New embedding min/max: {new_embedding.min():.4f}/{new_embedding.max():.4f}")
            logger.info(f"New embedding norm: {np.linalg.norm(new_embedding):.4f}")
        else:  # 2D array
            logger.info(f"New embedding sample (first 5): {new_embedding[0][:5]}")
            logger.info(f"New embedding min/max: {new_embedding.min():.4f}/{new_embedding.max():.4f}")
            
    except ValueError as e:
        raise HTTPException(400, str(e))
    
    # ✅ 2. Get all stored embeddings from database
    stored_faces = db.query(FaceEmbedding).all()
    
    if not stored_faces:
        raise HTTPException(404, "No registered users found")
    
    # ✅ 3. Compare with all stored embeddings
    best_match = None
    best_score = 0.0
    THRESHOLD = 0.65
    
    logger.info(f"Comparing with {len(stored_faces)} stored faces")
    
    for i, stored_face in enumerate(stored_faces):
        try:
            # Convert stored list back to numpy array
            stored_embedding = face_service.get_embedding_from_storage(
                stored_face.embedding
            )
            
            # Log stored embedding info
            logger.info(f"Stored face {i}: shape={stored_embedding.shape}, dtype={stored_embedding.dtype}")
            
            # Compare embeddings
            similarity = face_service.compare_embeddings(
                new_embedding,
                stored_embedding
            )
            
            logger.debug(f"Face {i} (student_id={stored_face.student_id}): similarity = {similarity:.4f}")
            
            if similarity > best_score:
                best_score = similarity
                best_match = stored_face.student_id
                
        except Exception as e:
            logger.error(f"Error comparing with face {stored_face.id}: {e}", exc_info=True)
            continue
    
    # ✅ 4. Check if match is good enough
    logger.info(f"Best match: student_id={best_match}, score={best_score:.4f}")
    
    if best_match is None or best_score < THRESHOLD:
        raise HTTPException(
            401,
            detail=f"No matching face found. Best score: {best_score:.3f}"
        )
    
    # ✅ 5. Check if already marked attendance today
    today = datetime.now().date()
    existing_attendance = db.query(AttendanceLog).filter(
        AttendanceLog.student_id == best_match,
        AttendanceLog.date == today
    ).first()
    
    if existing_attendance:
        return {
            "status": "already_marked",
            "student_id": best_match,
            "check_in_time": existing_attendance.check_in_time.isoformat() if existing_attendance.check_in_time else None
        }
    
    now = datetime.now()

    # ✅ 6. Mark attendance
    attendance = AttendanceLog(
        student_id=best_match,
        check_in_time=now,
        date=now.date(),
        status="present"
    )
    db.add(attendance)
    db.commit()
    
    # ✅ 7. Get student details
    student = db.query(User).filter(User.id == best_match).first()
    
    logger.info(f"Attendance marked for {student.name} (ID: {best_match})")
    
    return {
        "status": "present",
        "student_id": best_match,
        "name": student.name,
        "registration_number": student.registration_number,
        "confidence": round(best_score, 3)
    }