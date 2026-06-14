from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)

    lead_id = Column(Integer, ForeignKey("leads.id"))

    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    message = Column(String, nullable=True)  # planned follow-up message

    status = Column(String, default="PENDING")  # PENDING, SENT, CANCELLED
    is_automated = Column(Boolean, default=True)  # was this created by our scheduler?

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the lead
    lead = relationship("Lead", back_populates="followups")