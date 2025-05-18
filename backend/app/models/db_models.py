from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    phone = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    trust_score = Column(Float, default=50.0)
    created_at = Column(DateTime, server_default='now()')
    
    events = relationship("Event", back_populates="organizer")
    rsvps = relationship("RSVP", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    date = Column(DateTime)
    is_approved = Column(Boolean, default=False)
    is_cancelled = Column(Boolean, default=False)
    max_attendees = Column(Integer)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default='now()')
    
    organizer = relationship("User", back_populates="events")
    rsvps = relationship("RSVP", back_populates="event")
    feedbacks = relationship("Feedback", back_populates="event")

class RSVP(Base):
    __tablename__ = "rsvps"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    attendee_count = Column(Integer, default=1)
    attended = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default='now()')
    
    event = relationship("Event", back_populates="rsvps")
    user = relationship("User", back_populates="rsvps")

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(String)
    created_at = Column(DateTime, server_default='now()')
    
    event = relationship("Event", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")

class Poll(Base):
    __tablename__ = "polls"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    options = Column(String)  # JSON string
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default='now()')

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    option = Column(String)
    created_at = Column(DateTime, server_default='now()')

class Whisper(Base):
    __tablename__ = "whispers"
    
    id = Column(String, primary_key=True, index=True)
    text = Column(String)
    location = Column(String)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default='now()')