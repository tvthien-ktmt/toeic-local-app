from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from ..models import Flashcard, PracticeAttempt

INTERVAL_MAP = {
    1: 1,   # Day 1
    2: 3,   # Day 3
    3: 7,   # Day 7
    4: 14,  # Day 14
    5: 30,  # Day 30
}

def process_flashcard_review(db: Session, flashcard_id: int, remembered: bool) -> Dict[str, Any]:
    fc = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if not fc:
        raise ValueError(f"Flashcard #{flashcard_id} không tồn tại")

    now = datetime.utcnow()
    prev_level = fc.srs_level
    prev_next_review = fc.next_review_at

    if remembered:
        fc.srs_level += 1
        fc.ease_factor = min(fc.ease_factor + 0.1, 3.0)
        days_to_add = INTERVAL_MAP.get(fc.srs_level, fc.srs_level * 15)
    else:
        fc.srs_level = 0
        fc.ease_factor = max(fc.ease_factor - 0.2, 1.3)
        days_to_add = 1  # Review again tomorrow

    fc.last_reviewed_at = now
    fc.next_review_at = now + timedelta(days=days_to_add)

    # Record attempt
    attempt = PracticeAttempt(
        vocabulary_id=fc.vocabulary_id,
        attempt_type="flashcard",
        is_correct=remembered,
        attempted_at=now
    )
    db.add(attempt)
    db.commit()
    db.refresh(fc)

    return {
        "flashcard_id": fc.id,
        "vocabulary_id": fc.vocabulary_id,
        "remembered": remembered,
        "previous_level": prev_level,
        "new_level": fc.srs_level,
        "interval_days": days_to_add,
        "last_reviewed_at": fc.last_reviewed_at.isoformat(),
        "next_review_at": fc.next_review_at.isoformat(),
        "ease_factor": round(fc.ease_factor, 2)
    }
