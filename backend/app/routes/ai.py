from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.lead import Lead
from app.models.conversation import Conversation
from app.services.ai_service import generate_ai_reply, qualify_and_score_lead

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


class AIReplyRequest(BaseModel):
    lead_id: int


@router.post("/reply")
def generate_reply(request: AIReplyRequest, db: Session = Depends(get_db)):
    """
    Generate an AI reply for a lead based on their conversation history.
    Saves the AI reply as a new conversation message.
    """

    # Get the lead
    lead = db.query(Lead).filter(Lead.id == request.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Get full conversation history
    history = db.query(Conversation)\
        .filter(Conversation.lead_id == request.lead_id)\
        .order_by(Conversation.created_at.asc())\
        .all()

    # Convert to list of dicts for AI service
    history_list = [{"sender": msg.sender, "message": msg.message} for msg in history]

    if not history_list:
        raise HTTPException(
            status_code=400,
            detail="No conversation history found. Add a message from the lead first."
        )

    # Generate AI reply
    ai_reply = generate_ai_reply(lead.name, history_list)

    # Save AI reply to database
    new_message = Conversation(
        lead_id=lead.id,
        sender="ai",
        message=ai_reply
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {
        "message": ai_reply,
        "conversation_id": new_message.id,
        "lead_id": lead.id
    }


@router.post("/qualify/{lead_id}")
def qualify_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    Analyze conversation and update lead score (HOT/MEDIUM/COLD).
    """

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Get conversation history
    history = db.query(Conversation)\
        .filter(Conversation.lead_id == lead_id)\
        .order_by(Conversation.created_at.asc())\
        .all()

    history_list = [{"sender": msg.sender, "message": msg.message} for msg in history]

    # Get AI qualification
    result = qualify_and_score_lead(lead.name, history_list)

    # Update lead score in database
    lead.score = result["score"]
    lead.score_value = float(result["score_value"])
    db.commit()
    db.refresh(lead)

    return {
        "lead_id": lead_id,
        "score": result["score"],
        "score_value": result["score_value"],
        "reason": result.get("reason", ""),
        "lead_name": lead.name
    }