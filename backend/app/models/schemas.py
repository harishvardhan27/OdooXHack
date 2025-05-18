from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    trust_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class EventBase(BaseModel):
    title: str
    description: str
    category: str
    location: str
    latitude: float
    longitude: float
    date: datetime
    max_attendees: int

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    is_approved: bool
    is_cancelled: bool
    organizer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class RSVPBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    attendee_count: int = 1

class RSVPCreate(RSVPBase):
    pass

class RSVP(RSVPBase):
    id: int
    event_id: int
    user_id: Optional[int] = None
    attended: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    rating: int
    comment: str

class FeedbackCreate(FeedbackBase):
    pass

class Feedback(FeedbackBase):
    id: int
    event_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PollBase(BaseModel):
    question: str
    options: List[str]
    is_active: bool = True

class PollCreate(PollBase):
    pass

class Poll(PollBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class VoteBase(BaseModel):
    option: str

class VoteCreate(VoteBase):
    pass

class Vote(VoteBase):
    id: int
    poll_id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class WhisperBase(BaseModel):
    text: str
    location: str

class WhisperCreate(WhisperBase):
    pass

class Whisper(WhisperBase):
    id: str
    is_approved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True