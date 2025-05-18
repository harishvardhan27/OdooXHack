from fastapi import APIRouter, BackgroundTasks
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from app.models import Event, RSVP
from app.database import get_db
from sqlalchemy.orm import Session
from app.utils.notifications import send_email, send_sms
import os

router = APIRouter(
    prefix="/notify",
    tags=["notify"]
)

scheduler = BackgroundScheduler()
scheduler.start()

@router.post("/schedule-reminders")
def schedule_reminders(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    now = datetime.now()
    tomorrow = now + timedelta(days=1)
    
    upcoming_events = db.query(Event).filter(
        Event.date >= now,
        Event.date <= tomorrow,
        Event.is_approved == True,
        Event.is_cancelled == False
    ).all()
    
    for event in upcoming_events:
        # Schedule 24-hour reminder
        scheduler.add_job(
            send_event_reminder,
            'date',
            run_date=event.date - timedelta(hours=24),
            args=[event.id, "24-hour"],
            id=f"reminder_24h_{event.id}"
        )
        
        # Schedule 1-hour reminder
        scheduler.add_job(
            send_event_reminder,
            'date',
            run_date=event.date - timedelta(hours=1),
            args=[event.id, "1-hour"],
            id=f"reminder_1h_{event.id}"
        )
    
    return {"message": f"Scheduled reminders for {len(upcoming_events)} events"}

def send_event_reminder(event_id: int, reminder_type: str, db: Session = next(get_db())):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return
    
    rsvps = db.query(RSVP).filter(RSVP.event_id == event_id).all()
    
    subject = f"Reminder: {event.title} starting soon!"
    message = f"""
    <h2>{event.title}</h2>
    <p>This is a {reminder_type} reminder for your upcoming event:</p>
    <p><strong>When:</strong> {event.date.strftime('%A, %B %d at %I:%M %p')}</p>
    <p><strong>Where:</strong> {event.location}</p>
    <p><strong>Description:</strong> {event.description}</p>
    """
    
    for rsvp in rsvps:
        if rsvp.email:
            send_email(rsvp.email, subject, message)
        if rsvp.phone:
            send_sms(rsvp.phone, f"Reminder: {event.title} starts in {reminder_type}")

@router.post("/send-rsvp-confirmation/{rsvp_id}")
def send_rsvp_confirmation(
    rsvp_id: int,
    db: Session = Depends(get_db)
):
    rsvp = db.query(RSVP).filter(RSVP.id == rsvp_id).first()
    if not rsvp:
        raise HTTPException(status_code=404, detail="RSVP not found")
    
    event = db.query(Event).filter(Event.id == rsvp.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    subject = f"RSVP Confirmation: {event.title}"
    message = f"""
    <h2>Thank you for RSVPing!</h2>
    <p>You're confirmed for <strong>{event.title}</strong></p>
    <p><strong>When:</strong> {event.date.strftime('%A, %B %d at %I:%M %p')}</p>
    <p><strong>Where:</strong> {event.location}</p>
    <p><strong>Attendees:</strong> {rsvp.attendee_count}</p>
    """
    
    if rsvp.email:
        send_email(rsvp.email, subject, message)
    if rsvp.phone:
        send_sms(rsvp.phone, f"RSVP confirmed for {event.title} on {event.date.strftime('%m/%d')}")
    
    return {"message": "Confirmation sent"}