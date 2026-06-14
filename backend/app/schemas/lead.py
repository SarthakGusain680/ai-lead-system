from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Shared base fields - used as foundation for other schemas
class LeadBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None


# Schema for CREATING a lead (what the client sends in POST request)
class LeadCreate(LeadBase):
    pass


# Schema for UPDATING a lead (all fields optional - update only what's provided)
class LeadUpdate(BaseModel):
    priority: Optional[int] = None  
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    score: Optional[str] = None
    score_value: Optional[float] = None


# Schema for RESPONDING with a lead (what the API sends back)
class LeadResponse(LeadBase):
    priority: Optional[int] = 0
    id: int
    status: str
    score: str
    score_value: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: int

    class Config:
        from_attributes = True  # allows Pydantic to read data from SQLAlchemy objects