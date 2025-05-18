from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.models import RSVP, Event, User
from app.models.schemas import RSVPCreate, RSVP
from app.database import get_db
from app.utils.auth import get_current_user
from app.utils.notifications import send_rsvp_confirmation

router = APIRouter(
    prefix="/rsvp",
    tags=["rsvp"]
)

@router.post("/{event_id}", response_model=RSVP)
def create_rsVP(
    event_id: int,
    rsvp: RSVPCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if event exists and is approved
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_approved == True,
        Event.is_cancelled == False
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or not available for RSVP")
    
    # Check if user is already RSVP'd
    existing_rsvp = db.query(RSVP).filter(
        RSVP.event_id == event_id,
        RSVP.email == rsvp.email
    ).first()
    if existing_rsvp:
        raise HTTPException(status_code=400, detail="You have already RSVP'd for this event")
    
    # Create RSVP
    db_rsvp = RSVP(
        **rsvp.dict(),
        event_id=event_id,
        user_id=current_user.id if current_user else None
    )
    db.add(db_rsvp)
    db.commit()
    db.refresh(db_rsvp)
    
    # Send confirmation
    send_rsvp_confirmation(db_rsvp, event)
    
    return db_rsvp

@router.get("/event/{event_id}", response_model=list[RSVP])
def get_event_rsvps(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.organizer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view RSVPs for this event")
    
    return db.query(RSVP).filter(RSVP.event_id == event_id).all()

@router.post("/{rsvp_id}/attend")
def mark_attendance(
    rsvp_id: int,
    attended: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rsvp = db.query(RSVP).filter(RSVP.id == rsvp_id).first()
    if not rsvp:
        raise HTTPException(status_code=404, detail="RSVP not found")
    
    event = db.query(Event).filter(Event.id == rsvp.event_id).first()
    if event.organizer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update attendance")
    
    rsvp.attended = attended
    db.commit()
    return {"message": "Attendance updated successfully"}