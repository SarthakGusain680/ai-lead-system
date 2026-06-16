from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.lead import Lead
from app.models.conversation import Conversation
from app.services.ai_service import generate_ai_reply

router = APIRouter(
    prefix="/public",
    tags=["Public Chat"]
)


class ChatMessage(BaseModel):
    name: str
    email: Optional[str] = None
    message: str
    session_id: Optional[str] = None  # tracks the conversation thread


class ChatResponse(BaseModel):
    ai_reply: str
    lead_id: int
    session_id: str


@router.post("/chat", response_model=ChatResponse)
def public_chat(chat: ChatMessage, db: Session = Depends(get_db)):
    """
    Public endpoint - no authentication required.
    Anyone can send a message here.
    Creates a lead if they don't exist, then generates AI reply.
    """

    # Step 1 - Find existing lead by email, or create new one
    lead = None

    if chat.email:
        lead = db.query(Lead).filter(Lead.email == chat.email).first()

    if not lead:
        # Create a new lead automatically
        lead = Lead(
            name=chat.name,
            email=chat.email,
            source="chat_widget",
            status="NEW",
            score="COLD",
            score_value=0.0,
            owner_id=1  # default owner
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)

    # Step 2 - Save the customer's message
    customer_message = Conversation(
        lead_id=lead.id,
        sender="lead",
        message=chat.message
    )
    db.add(customer_message)
    db.commit()

    # Step 3 - Get full conversation history for AI context
    history = db.query(Conversation)\
        .filter(Conversation.lead_id == lead.id)\
        .order_by(Conversation.created_at.asc())\
        .all()

    history_list = [
        {"sender": msg.sender, "message": msg.message}
        for msg in history
    ]

    # Step 4 - Generate AI reply
    ai_reply = generate_ai_reply(lead.name, history_list)

    # Step 5 - Save AI reply
    ai_message = Conversation(
        lead_id=lead.id,
        sender="ai",
        message=ai_reply
    )
    db.add(ai_message)
    db.commit()

    return {
        "ai_reply": ai_reply,
        "lead_id": lead.id,
        "session_id": str(lead.id)
    }


@router.get("/chat/{lead_id}/history")
def get_chat_history(lead_id: int, db: Session = Depends(get_db)):
    """Get conversation history for a returning visitor."""
    conversations = db.query(Conversation)\
        .filter(Conversation.lead_id == lead_id)\
        .order_by(Conversation.created_at.asc())\
        .all()

    return [
        {
            "sender": msg.sender,
            "message": msg.message,
            "created_at": str(msg.created_at)
        }
        for msg in conversations
    ]