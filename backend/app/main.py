from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import leads, conversations, followups, ai, auth, public
from app.services.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.database import Base, engine
    from app.models import User, Lead, Conversation, Followup
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="AI Lead Follow-Up System",
    description="Backend API for managing leads, conversations, and AI-powered follow-ups",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(conversations.router)
app.include_router(followups.router)
app.include_router(ai.router)
app.include_router(public.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Lead Follow-Up System API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}