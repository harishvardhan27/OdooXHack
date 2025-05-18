from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from sqlalchemy import func
from app.models import Event, User, Feedback, RSVP
from app.models.schemas import Event, User, Feedback
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

@router.get("/pending-events", response_model=List[Event])
def get_pending_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(Event).filter(Event.is_approved == False).all()

@router.post("/approve-event/{event_id}", response_model=Event)
def approve_event(
    event_id: int,
    approve: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.is_approved = approve
    db.commit()
    db.refresh(event)
    return event

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Event stats
    total_events = db.query(Event).count()
    upcoming_events = db.query(Event).filter(Event.date >= datetime.now()).count()
    
    # User stats
    total_users = db.query(User).count()
    new_users = db.query(User).filter(
        User.created_at >= datetime.now() - timedelta(days=7)
    ).count()
    
    # Feedback stats
    feedbacks = db.query(Feedback).all()
    avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks) if feedbacks else 0
    
    # Category distribution
    categories = db.query(Event.category, func.count(Event.id)).group_by(Event.category).all()
    category_dist = {cat: count for cat, count in categories}
    
    # Popular events
    popular_events = db.query(
        Event.id,
        Event.title,
        func.count(RSVP.id).label('rsvp_count')
    ).join(RSVP).group_by(Event.id).order_by(func.count(RSVP.id).desc()).limit(5).all()
    
    return {
        "events": {
            "total": total_events,
            "upcoming": upcoming_events,
            "categories": category_dist,
            "popular": [{"id": e.id, "title": e.title, "rsvp_count": e.rsvp_count} for e in popular_events]
        },
        "users": {
            "total": total_users,
            "new_last_week": new_users
        },
        "feedback": {
            "average_rating": round(avg_rating, 2),
            "total": len(feedbacks)
        }
    }

@router.get("/trust-scores")
def get_trust_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    organizers = db.query(User).join(Event).group_by(User.id).having(func.count(Event.id) >= 3).all()
    
    scores = []
    for user in organizers:
        events = db.query(Event).filter(Event.organizer_id == user.id).all()
        event_ids = [e.id for e in events]
        
        # Calculate attendance rate
        total_rsvps = db.query(RSVP).filter(RSVP.event_id.in_(event_ids)).count()
        attended_rsvps = db.query(RSVP).filter(
            RSVP.event_id.in_(event_ids),
            RSVP.attended == True
        ).count()
        attendance_rate = attended_rsvps / total_rsvps if total_rsvps > 0 else 0
        
        # Calculate average rating
        avg_rating = db.query(func.avg(Feedback.rating)).filter(
            Feedback.event_id.in_(event_ids)
        ).scalar() or 0
        
        # Calculate cancellation rate
        cancelled_events = db.query(Event).filter(
            Event.organizer_id == user.id,
            Event.is_cancelled == True
        ).count()
        cancellation_rate = cancelled_events / len(events) if len(events) > 0 else 0
        
        # Composite trust score
        trust_score = (
            (0.4 * attendance_rate) + 
            (0.4 * (avg_rating / 5)) - 
            (0.2 * cancellation_rate)
        ) * 100
        
        scores.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "events_hosted": len(events),
            "attendance_rate": round(attendance_rate, 2),
            "avg_rating": round(avg_rating, 2),
            "cancellation_rate": round(cancellation_rate, 2),
            "trust_score": round(trust_score, 2)
        })
    
    return sorted(scores, key=lambda x: x["trust_score"], reverse=True)