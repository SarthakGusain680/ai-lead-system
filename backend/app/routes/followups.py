from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.followup import Followup
from app.models.lead import Lead
from app.schemas.followup import FollowupCreate, FollowupUpdate, FollowupResponse

router = APIRouter(
    prefix="/followups",
    tags=["Followups"]
)


# CREATE a new followup
@router.post("/", response_model=FollowupResponse)
def create_followup(followup: FollowupCreate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == followup.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    new_followup = Followup(**followup.dict())
    db.add(new_followup)
    db.commit()
    db.refresh(new_followup)

    return new_followup


# GET all followups (across all leads) - useful for a dashboard view
@router.get("/", response_model=List[FollowupResponse])
def get_all_followups(db: Session = Depends(get_db)):
    return db.query(Followup).order_by(Followup.scheduled_at.asc()).all()


# GET all followups for a specific lead
@router.get("/lead/{lead_id}", response_model=List[FollowupResponse])
def get_followups_for_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return (
        db.query(Followup)
        .filter(Followup.lead_id == lead_id)
        .order_by(Followup.scheduled_at.asc())
        .all()
    )


# UPDATE a followup (e.g., mark as SENT, reschedule)
@router.put("/{followup_id}", response_model=FollowupResponse)
def update_followup(followup_id: int, update: FollowupUpdate, db: Session = Depends(get_db)):
    followup = db.query(Followup).filter(Followup.id == followup_id).first()

    if not followup:
        raise HTTPException(status_code=404, detail="Followup not found")

    update_data = update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(followup, key, value)

    db.commit()
    db.refresh(followup)

    return followup


# DELETE a followup
@router.delete("/{followup_id}")
def delete_followup(followup_id: int, db: Session = Depends(get_db)):
    followup = db.query(Followup).filter(Followup.id == followup_id).first()

    if not followup:
        raise HTTPException(status_code=404, detail="Followup not found")

    db.delete(followup)
    db.commit()

    return {"message": f"Followup {followup_id} deleted successfully"}
from app.services.scheduler import check_inactive_leads

@router.post("/trigger-scheduler")
def trigger_scheduler():
    """
    Manually trigger the follow-up scheduler.
    Useful for testing without waiting 24 hours.
    """
    check_inactive_leads()
    return {"message": "Scheduler triggered successfully. Check followups for results."}