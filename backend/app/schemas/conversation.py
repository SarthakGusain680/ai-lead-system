from pydantic import BaseModel
from datetime import datetime


class ConversationBase(BaseModel):
    sender: str
    message: str


class ConversationCreate(ConversationBase):
    lead_id: int


class ConversationResponse(ConversationBase):
    id: int
    lead_id: int
    created_at: datetime

    class Config:
        from_attributes = True