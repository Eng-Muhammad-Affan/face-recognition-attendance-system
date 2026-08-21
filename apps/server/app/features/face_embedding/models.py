# app/models.py
from sqlalchemy import Column, String, Enum, VARCHAR, TIMESTAMP, Date, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from pgvector.sqlalchemy import Vector  # or VECTOR

from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
import uuid
from datetime import datetime, date

# ==================== FACE EMBEDDINGS MODEL ====================
class FaceEmbedding(Base):
    __tablename__ = 'face_embeddings'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    embedding = Column(Vector(512), nullable=False)  # pgvector type
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.now)
    expiry_date = Column(TIMESTAMP, nullable=True, default=lambda: datetime.now() + timedelta(days=30))
    
    # Relationship
    student = relationship("User", back_populates="face_embeddings")

    def __repr__(self):
        return f"<FaceEmbedding student_id={self.student_id}>"


