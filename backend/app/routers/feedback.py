from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.models import Feedback, Event, User, RSVP
from app.models.schemas import FeedbackCreate, Feedback
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/feedback",
    tags=["feedback"]
)

@router.post("/{event_id}", response_model=Feedback)
def create_feedback(
    event_id: int,
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if event exists and has ended
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.date <= datetime.now()
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not yet ended")
    
    # Check if user attended the event
    rsvp = db.query(RSVP).filter(
        RSVP.event_id == event_id,
        RSVP.user_id == current_user.id,
        RSVP.attended == True
    ).first()
    if not rsvp:
        raise HTTPException(status_code=403, detail="You did not attend this event")
    
    # Check if feedback already exists
    existing_feedback = db.query(Feedback).filter(
        Feedback.event_id == event_id,
        Feedback.user_id == current_user.id
    ).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this event")
    
    # Create feedback
    db_feedback = Feedback(
        **feedback.dict(),
        event_id=event_id,
        user_id=current_user.id
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    # Update organizer trust score (simplified)
    organizer = db.query(User).filter(User.id == event.organizer_id).first()
    if organizer:
        feedbacks = db.query(Feedback).filter(Feedback.event_id.in_(
            [e.id for e in organizer.events]
        )).all()
        if feedbacks:
            avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)
            organizer.trust_score = avg_rating * 20  # Convert 1-5 to 0-100 scale
            db.commit()
    
    return db_feedback

@router.get("/event/{event_id}", response_model=list[Feedback])
def get_event_feedback(
    event_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Feedback).filter(Feedback.event_id == event_id).all()