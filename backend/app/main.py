from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, events, rsvp, feedback, admin, ai, notify, whispers
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Community Pulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(rsvp.router)
app.include_router(feedback.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(notify.router)
app.include_router(whispers.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Community Pulse API"}