from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, Base
from .routers import documents, questions, vocabulary, ai_generator, quiz, flashcards, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TOEIC Local Study API",
    description="Backend API for TOEIC Local Study Web App",
    version="1.0.0"
)

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
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(questions.router)
app.include_router(vocabulary.router)
app.include_router(ai_generator.router)
app.include_router(quiz.router)
app.include_router(flashcards.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "TOEIC Local Study Backend API is running!"}



