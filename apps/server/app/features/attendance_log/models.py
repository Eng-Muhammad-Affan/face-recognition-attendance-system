# app/models.py
from sqlalchemy import Column, String, Enum, VARCHAR, TIMESTAMP, Date, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from pgvector.sqlalchemy import Vector  # or VECTOR

from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid
from datetime import datetime, date

# ==================== ATTENDANCE ENUM ====================
class AttendanceStatusEnum(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    leave = "leave"
    pending = "pending"
    
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