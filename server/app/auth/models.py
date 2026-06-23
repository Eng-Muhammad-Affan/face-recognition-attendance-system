# app/models.py
from sqlalchemy import Column, String, Enum, VARCHAR, TIMESTAMP, Date, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, VECTOR  # IMPORTANT: Use VECTOR from pgvector
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid
from datetime import datetime, date

# ==================== ENUMS ====================
class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

class AttendanceStatusEnum(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    leave = "leave"

# ==================== USER MODEL ====================
class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    registration_number = Column(VARCHAR(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user)
    department = Column(VARCHAR(100))
    joined_at = Column(TIMESTAMP, default=datetime.now)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    face_embeddings = relationship("FaceEmbedding", back_populates="student", cascade="all, delete-orphan")
    attendance_logs = relationship("AttendanceLog", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.name} ({self.registration_number})>"


# ==================== FACE EMBEDDINGS MODEL ====================
class FaceEmbedding(Base):
    __tablename__ = 'face_embeddings'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    embedding = Column(VECTOR(512), nullable=False)  # pgvector type
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.now)
    
    # Relationship
    student = relationship("User", back_populates="face_embeddings")

    def __repr__(self):
        return f"<FaceEmbedding student_id={self.student_id}>"


# ==================== ATTENDANCE LOGS MODEL ====================
class AttendanceLog(Base):
    __tablename__ = 'attendance_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    check_in_time = Column(TIMESTAMP, default=datetime.now)
    date = Column(Date, default=date.today, nullable=False)
    status = Column(Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.present)
    
    # Unique constraint: One attendance per student per day
    __table_args__ = (
        UniqueConstraint('student_id', 'date', name='unique_student_attendance_per_day'),
    )
    
    # Relationship
    student = relationship("User", back_populates="attendance_logs")

    def __repr__(self):
        return f"<AttendanceLog {self.student_id} - {self.date}>"