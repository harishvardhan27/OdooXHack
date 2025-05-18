from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline
from app.models import User, Event, RSVP
from app.database import get_db
import numpy as np
import json

router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)

# Initialize ML models
classifier = pipeline("text-classification", model="bert-base-uncased")
summarizer = pipeline("summarization", model="t5-small")
vectorizer = TfidfVectorizer(stop_words='english')

@router.get("/recommend/{user_id}")
def recommend_events(user_id: int, limit: int = 5, db: Session = Depends(get_db)):
    # Get user's past RSVPs
    user_rsvps = db.query(RSVP).filter(RSVP.user_id == user_id).all()
    if not user_rsvps:
        # If no RSVPs, return popular events
        popular_events = db.query(Event).filter(
            Event.is_approved == True,
            Event.is_cancelled == False
        ).order_by(Event.date).limit(limit).all()
        return popular_events
    
    # Get categories of past RSVPs
    user_categories = [rsvp.event.category for rsvp in user_rsvps]
    
    # Get all approved events
    all_events = db.query(Event).filter(
        Event.is_approved == True,
        Event.is_cancelled == False,
        Event.date >= datetime.now()
    ).all()
    
    if not all_events:
        return []
    
    # Vectorize categories
    category_texts = [" ".join(user_categories)] + [event.category for event in all_events]
    tfidf_matrix = vectorizer.fit_transform(category_texts)
    
    # Calculate similarity
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    # Get top recommended events
    top_indices = np.argsort(cosine_similarities)[-limit:][::-1]
    recommended_events = [all_events[i] for i in top_indices]
    
    return recommended_events

@router.post("/generate-description")
def generate_description(prompt: str):
    if len(prompt) < 10:
        raise HTTPException(status_code=400, detail="Prompt too short")
    
    summary = summarizer(prompt, max_length=130, min_length=30, do_sample=False)
    return {"description": summary[0]['summary_text']}

@router.post("/classify-category")
def classify_category(text: str):
    if len(text) < 5:
        raise HTTPException(status_code=400, detail="Text too short")
    
    result = classifier(text)
    return {"category": result[0]['label'], "confidence": result[0]['score']}