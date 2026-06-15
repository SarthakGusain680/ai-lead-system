from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import leads, conversations, followups, ai, auth
from app.services.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup
    start_scheduler()
    yield
    # Runs on shutdown
    stop_scheduler()


app = FastAPI(
    title="AI Lead Follow-Up System",
    description="Backend API for managing leads, conversations, and AI-powered follow-ups",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["allow_origins=[
    "http://localhost:3000",
    "https://npx plugins add vercel/vercel-plugin"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(conversations.router)
app.include_router(followups.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Lead Follow-Up System API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}