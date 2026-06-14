from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse

# Create a router - this groups all lead-related endpoints together
router = APIRouter(
    prefix="/leads",
    tags=["Leads"]
)


# CREATE a new lead
@router.post("/", response_model=LeadResponse)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    # Convert Pydantic schema to a dict, then unpack into the SQLAlchemy model
    new_lead = Lead(**lead.dict(), owner_id=1)  # owner_id=1 hardcoded for now (no auth yet)

    db.add(new_lead)       # stage the new row
    db.commit()             # save it to the database
    db.refresh(new_lead)    # reload it (to get the auto-generated id, created_at, etc.)

    return new_lead


# GET all leads
@router.get("/", response_model=List[LeadResponse])
def get_leads(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    return leads


# GET a single lead by ID
@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return lead


# UPDATE a lead
@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, lead_update: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Only update fields that were actually provided (not None)
    update_data = lead_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)

    db.commit()
    db.refresh(lead)

    return lead


# DELETE a lead
@router.delete("/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(lead)
    db.commit()

    return {"message": f"Lead {lead_id} deleted successfully"}