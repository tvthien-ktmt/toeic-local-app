import sys

# Force UTF-8 encoding for Windows console output to prevent 'charmap' UnicodeEncodeError on Vietnamese characters
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import os
import time
from typing import Dict, Any
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .db import engine, Base, SessionLocal
from .routers import documents, questions, vocabulary, ai_generator, quiz, flashcards, dashboard, grammar, textbooks, curriculum, error_notebook, listening
from .services.textbook_service import ensure_db_schema

# Create database tables
Base.metadata.create_all(bind=engine)

# Auto ensure schema migration on startup
with SessionLocal() as db_session:
    ensure_db_schema(db_session)

app = FastAPI(
    title="TOEIC Local Study API",
    description="Production-grade Backend API for TOEIC Local Study & AI Diagnostic Web App",
    version="1.0.0"
)

# Request Timing & Performance Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Mount book static files directory for Mindmaps & Take Notes images
book_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "book"))
if os.path.exists(book_dir):
    app.mount("/static/books", StaticFiles(directory=book_dir), name="static_books")

# Allow CORS for React frontend (default Vite port: 5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "X-API-Key"],
)

app.include_router(documents.router)
app.include_router(questions.router)
app.include_router(vocabulary.router)
app.include_router(ai_generator.router)
app.include_router(quiz.router)
app.include_router(flashcards.router)
app.include_router(dashboard.router)
app.include_router(grammar.router)
app.include_router(textbooks.router, prefix="/api/textbooks")
app.include_router(curriculum.router)
app.include_router(error_notebook.router)
app.include_router(listening.router)

@app.get("/")
def read_root() -> Dict[str, str]:
    """Root endpoint to verify backend API availability."""
    return {"message": "Welcome to TOEIC Local Study API!"}

@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Detailed health check endpoint for monitoring and uptime probes."""
    return {
        "status": "healthy",
        "database": "sqlite_wal",
        "version": "1.0.0",
        "service": "toeic-local-study-api"
    }
