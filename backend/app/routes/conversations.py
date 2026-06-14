from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.lead import Lead
from app.schemas.conversation import ConversationCreate, ConversationResponse

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


# CREATE a new conversation message
@router.post("/", response_model=ConversationResponse)
def create_conversation(convo: ConversationCreate, db: Session = Depends(get_db)):
    # Verify the lead exists before adding a message to it
    lead = db.query(Lead).filter(Lead.id == convo.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    new_convo = Conversation(**convo.dict())
    db.add(new_convo)
    db.commit()
    db.refresh(new_convo)

    return new_convo


# GET all messages for a specific lead
@router.get("/lead/{lead_id}", response_model=List[ConversationResponse])
def get_conversations_for_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    conversations = (
        db.query(Conversation)
        .filter(Conversation.lead_id == lead_id)
        .order_by(Conversation.created_at.asc())
        .all()
    )
    return conversations


# DELETE a single conversation message
@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    convo = db.query(Conversation).filter(Conversation.id == conversation_id).first()

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(convo)
    db.commit()

    return {"message": f"Conversation {conversation_id} deleted successfully"}