from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from ..db import get_db
from ..models import Flashcard, Vocabulary
from ..services.srs_service import process_flashcard_review

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])

@router.get("/due")
def get_due_flashcards(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    due_cards = db.query(Flashcard, Vocabulary).join(
        Vocabulary, Flashcard.vocabulary_id == Vocabulary.id
    ).filter(Flashcard.next_review_at <= now).order_by(Flashcard.next_review_at.asc()).all()

    items = []
    for fc, v in due_cards:
        items.append({
            "flashcard_id": fc.id,
            "vocabulary_id": v.id,
            "word": v.word,
            "ipa": v.ipa,
            "part_of_speech": v.part_of_speech,
            "meaning_vi": v.meaning_vi,
            "example_sentence": v.example_sentence,
            "srs_level": fc.srs_level,
            "ease_factor": fc.ease_factor,
            "next_review_at": fc.next_review_at.isoformat()
        })

    return {"total_due": len(items), "items": items}

@router.post("/{flashcard_id}/review")
def review_flashcard(
    flashcard_id: int,
    remembered: bool = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    try:
        res = process_flashcard_review(db, flashcard_id, remembered)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
