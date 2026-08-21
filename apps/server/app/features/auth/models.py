# app/models.py
from sqlalchemy import Column, String, Enum, VARCHAR, TIMESTAMP, Date, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from pgvector.sqlalchemy import Vector  # or VECTOR

from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid
from datetime import datetime, date

# ==================== ENUMS ====================
class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

# class AttendanceStatusEnum(str, enum.Enum):
#     present = "present"
#     absent = "absent"
#     late = "late"
#     leave = "leave"

# ==================== USER MODEL ====================
class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    registration_number = Column(VARCHAR(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user)
    department = Column(VARCHAR(100))
    joined_at = Column(TIMESTAMP, default=datetime.now)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    face_embeddings = relationship("FaceEmbedding", back_populates="student", cascade="all, delete-orphan")
    attendance_logs = relationship("AttendanceLog", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.name} ({self.registration_number})>"