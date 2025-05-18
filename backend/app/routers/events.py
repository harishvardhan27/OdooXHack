from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.models import Event, User
from app.models.schemas import EventCreate, Event
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.get("/", response_model=List[Event])
def get_events(
    category: str = None,
    location: str = None,
    upcoming: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Event).filter(Event.is_approved == True)
    
    if category:
        query = query.filter(Event.category == category)
    
    if location:
        query = query.filter(Event.location.ilike(f"%{location}%"))
    
    if upcoming:
        query = query.filter(Event.date >= datetime.now())
    
    return query.order_by(Event.date).all()

@router.post("/", response_model=Event)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_event = Event(
        **event.dict(),
        organizer_id=current_user.id,
        is_approved=current_user.is_admin  # Auto-approve for admins
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/{event_id}", response_model=Event)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}", response_model=Event)
def update_event(
    event_id: int,
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.organizer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this event")
    
    for field, value in event.dict().items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.organizer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}