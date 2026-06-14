from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    source = Column(String, nullable=True)  # e.g., "website", "facebook ad", "referral"

    status = Column(String, default="NEW")  # NEW, CONTACTED, QUALIFIED, CLOSED
    score = Column(String, default="COLD")  # HOT, MEDIUM, COLD
    score_value = Column(Float, default=0.0)  # numeric score from AI (0-100)

    notes = Column(String, nullable=True)
    priority = Column(Integer, default=0)  # 0 = normal, higher = more urgent

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign key linking this lead to the user who owns it
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="leads")
    conversations = relationship("Conversation", back_populates="lead", cascade="all, delete-orphan")
    followups = relationship("Followup", back_populates="lead", cascade="all, delete-orphan")
    