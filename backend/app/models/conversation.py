from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    lead_id = Column(Integer, ForeignKey("leads.id"))

    sender = Column(String, nullable=False)  # "lead", "ai", or "agent"
    message = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the lead
    lead = relationship("Lead", back_populates="conversations")