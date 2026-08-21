#  ______ libraries ...
from fastapi import APIRouter, Depends, HTTPException, Form , UploadFile, File, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import numpy as np

#  ______ Config ...
from app.core.database import SessionLocal

#  ______ Utils  ...
from app.core.logger import logger

#  ______ Modules ...
from app.logs.models import AttendanceLog, AttendanceStatusEnum

#  ______ startup ...

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/attendance", tags=["Attendance logs"])


# ============ LOGS ROUTES ============


@router.get("/", status_code=status.HTTP_200_OK)
async def get_attendance_logs(
    db: Session = Depends(get_db)
):
    """Get attendance logs with student details"""
    try:
        # Use joinedload to eagerly load the student relationship
        logs = db.query(AttendanceLog).options(
            joinedload(AttendanceLog.student)
        ).filter()
        
        # Convert to list of dictionaries for JSON serialization
        logs_list = [
            {
                "id": str(log.id),
                "name": f"{log.student.name}" if log.student else None,
                "registration_number": log.student.registration_number if log.student else None,
                "role": log.student.role if log.student else None,
                "department": log.student.department if log.student else None,
                "check_in_time": log.check_in_time.isoformat() if log.check_in_time else None,
                "date": log.date.isoformat() if log.date else None,
                "status": log.status.value if log.status else None,
            }
            for log in logs
        ]
        
        return logs_list
    except Exception as e:
        logger.error(f"Error fetching logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch logs"
        )


@router.post("/mark-attendance")
async def mark_attendance(
    image: UploadFile = File(...),
    timestamp:str = Form(...),
    db: Session = Depends(get_db)
):
    current_time = parser.parse(timestamp)
    current_hour = current_time.hour
    
    if current_hour == 18 and current_time.minute > 0:
            return {
        "message":"Sorry you're late"
        }
        
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
    today = parser.parse(timestamp)

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