from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from app.models import Whisper
from app.models.schemas import WhisperCreate, Whisper
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/whispers",
    tags=["whispers"]
)

@router.post("/", response_model=Whisper)
def create_whisper(
    whisper: WhisperCreate,
    db: Session = Depends(get_db)
):
    db_whisper = Whisper(
        id=str(uuid.uuid4()),
        text=whisper.text,
        location=whisper.location,
        is_approved=False
    )
    db.add(db_whisper)
    db.commit()
    db.refresh(db_whisper)
    return db_whisper

@router.get("/", response_model=list[Whisper])
def get_whispers(
    location: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Whisper).filter(Whisper.is_approved == True)
    if location:
        query = query.filter(Whisper.location == location)
    return query.order_by(Whisper.created_at.desc()).limit(limit).all()

@router.post("/moderate/{whisper_id}", response_model=Whisper)
def moderate_whisper(
    whisper_id: str,
    approve: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    whisper = db.query(Whisper).filter(Whisper.id == whisper_id).first()
    if not whisper:
        raise HTTPException(status_code=404, detail="Whisper not found")
    
    whisper.is_approved = approve
    db.commit()
    db.refresh(whisper)
    return whisper