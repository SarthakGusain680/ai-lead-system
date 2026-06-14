from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FollowupBase(BaseModel):
    scheduled_at: datetime
    message: Optional[str] = None
    is_automated: Optional[bool] = True


class FollowupCreate(FollowupBase):
    lead_id: int


class FollowupUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    message: Optional[str] = None
    status: Optional[str] = None


class FollowupResponse(FollowupBase):
    id: int
    lead_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True