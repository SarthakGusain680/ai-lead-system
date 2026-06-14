from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from app.core.database import SessionLocal
from app.models.lead import Lead
from app.models.conversation import Conversation
from app.models.followup import Followup
from app.services.ai_service import generate_followup_message

# Set up logging so we can see scheduler activity in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the scheduler instance
scheduler = BackgroundScheduler()


def check_inactive_leads():
    """
    Runs every hour.
    Finds leads with no conversation activity in 24+ hours.
    Creates an AI-generated follow-up message for each.
    """
    logger.info("Scheduler running: checking for inactive leads...")

    # Create a database session for this background job
    db: Session = SessionLocal()

    try:
        # Get all leads that are not closed
        active_leads = db.query(Lead).filter(
            Lead.status != "CLOSED"
        ).all()

        now = datetime.utcnow()
        followup_count = 0

        for lead in active_leads:
            # Get the most recent conversation message for this lead
            last_message = db.query(Conversation)\
                .filter(Conversation.lead_id == lead.id)\
                .order_by(Conversation.created_at.desc())\
                .first()

            # Skip if no conversation history at all
            if not last_message:
                continue

            # Calculate how long since last message
            time_since_last = now - last_message.created_at.replace(tzinfo=None)
            hours_inactive = time_since_last.total_seconds() / 3600

            # Only follow up if inactive for 24+ hours
            if hours_inactive < 24:
                continue

            # Check if we already scheduled a pending followup for this lead
            existing_followup = db.query(Followup).filter(
                Followup.lead_id == lead.id,
                Followup.status == "PENDING"
            ).first()

            if existing_followup:
                continue

            # Generate AI follow-up message
            days_inactive = int(hours_inactive / 24)
            followup_message = generate_followup_message(
                lead_name=lead.name,
                last_message=last_message.message,
                days_inactive=days_inactive
            )

            # Save follow-up to database
            new_followup = Followup(
                lead_id=lead.id,
                scheduled_at=now,
                message=followup_message,
                status="PENDING",
                is_automated=True
            )
            db.add(new_followup)

            # Also save it as a conversation message
            new_convo = Conversation(
                lead_id=lead.id,
                sender="ai",
                message=followup_message
            )
            db.add(new_convo)

            # Mark the followup as sent
            new_followup.status = "SENT"

            followup_count += 1
            logger.info(f"Follow-up created for lead: {lead.name}")

        db.commit()
        logger.info(f"Scheduler done. {followup_count} follow-ups created.")

    except Exception as e:
        logger.error(f"Scheduler error: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler."""
    scheduler.add_job(
        check_inactive_leads,
        trigger=IntervalTrigger(hours=1),
        id="check_inactive_leads",
        name="Check inactive leads every hour",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler started. Will check inactive leads every hour.")


def stop_scheduler():
    """Stop the background scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped.")