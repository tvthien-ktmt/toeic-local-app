import random
import re
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Vocabulary, Flashcard, PracticeAttempt
from ..services.extraction_service import REAL_VIETNAMESE_DICTIONARY

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class ReverseTypingRequest(BaseModel):
    vocab_id: int
    user_meaning_input: str

@router.get("/vocab/generate")
def generate_vocab_quiz(
    document_id: Optional[int] = None,
    appears_in_part: Optional[str] = None,
    topic_category: Optional[str] = None,
    unmastered_only: bool = False,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Generates standard Vocab Quiz with flexible range selectors (Module 14.4).
    """
    query = db.query(Vocabulary)

    if document_id is not None:
        query = query.filter(Vocabulary.source_document_id == document_id)
    if appears_in_part:
        query = query.filter(Vocabulary.appears_in_part.ilike(f"%{appears_in_part}%"))
    if topic_category:
        query = query.filter(Vocabulary.topic_category == topic_category)
    if unmastered_only:
        unmastered_vids = [f.vocabulary_id for f in db.query(Flashcard.vocabulary_id).filter(Flashcard.srs_level < 3).all()]
        query = query.filter(Vocabulary.id.in_(unmastered_vids))

    target_words = query.all()
    if not target_words or len(target_words) < 4:
        target_words = db.query(Vocabulary).all()
        if not target_words:
            raise HTTPException(
                status_code=400,
                detail="Cơ sở dữ liệu chưa có đủ từ vựng để tạo bài Quiz!"
            )

    pool_meanings = [
        "báo cáo", "công ty", "đề xuất", "phòng ban", "mẫu quảng cáo",
        "năng lực lãnh đạo", "đồ dùng cá nhân", "hiệu suất làm việc",
        "hội nghị", "thỏa thuận", "cuộc điều tra", "hợp đồng",
        "lịch trình", "ứng viên", "giấy bảo hành", "ngân sách", "phúc lợi"
    ]

    db_meanings = [v.meaning_vi for v in db.query(Vocabulary.meaning_vi).all() if v.meaning_vi and not v.meaning_vi.startswith("Nghĩa từ vựng") and not v.meaning_vi.startswith("từ vựng")]
    for m in db_meanings:
        if m not in pool_meanings:
            pool_meanings.append(m)

    sampled_targets = random.sample(target_words, min(limit, len(target_words)))

    quiz_items = []
    for target in sampled_targets:
        if target.word in REAL_VIETNAMESE_DICTIONARY:
            correct_meaning = REAL_VIETNAMESE_DICTIONARY[target.word][0]
        elif target.meaning_vi and not target.meaning_vi.startswith("Nghĩa từ vựng") and not target.meaning_vi.startswith("từ vựng"):
            correct_meaning = target.meaning_vi
        else:
            correct_meaning = "thông báo / văn bản"

        distractors = [m for m in pool_meanings if m != correct_meaning]
        chosen_distractors = random.sample(distractors, 3) if len(distractors) >= 3 else ["công ty", "báo cáo", "lịch trình"][:3]

        options = [correct_meaning] + chosen_distractors
        random.shuffle(options)
        correct_idx = options.index(correct_meaning)

        quiz_items.append({
            "vocab_id": target.id,
            "word": target.word,
            "ipa": target.ipa,
            "part_of_speech": target.part_of_speech,
            "example_sentence": target.example_sentence,
            "options": options,
            "correct_answer_index": correct_idx,
            "correct_meaning": correct_meaning
        })

    return {
        "total_quiz": len(quiz_items),
        "items": quiz_items
    }

@router.get("/listening")
def generate_listening_quiz(
    document_id: Optional[int] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Module 14.1: Listening Quiz mode (TTS pronounced).
    """
    query = db.query(Vocabulary)
    if document_id is not None:
        query = query.filter(Vocabulary.source_document_id == document_id)

    words = query.all()
    if not words or len(words) < 4:
        words = db.query(Vocabulary).all()

    sampled = random.sample(words, min(limit, len(words)))
    all_spelling_words = [w.word for w in words]

    items = []
    for target in sampled:
        distractors = [w for w in all_spelling_words if w != target.word]
        if len(distractors) < 3:
            distractors = ["affect", "effect", "quiet", "quite"]
        chosen_distractors = random.sample(distractors, 3)
        options = [target.word] + chosen_distractors
        random.shuffle(options)

        items.append({
            "vocab_id": target.id,
            "word": target.word,
            "ipa": target.ipa,
            "options": options,
            "correct_word": target.word,
            "meaning_vi": target.meaning_vi
        })

    return {"total_quiz": len(items), "items": items}

@router.post("/reverse_typing")
def check_reverse_typing(
    req: ReverseTypingRequest,
    db: Session = Depends(get_db)
):
    """
    Module 14.2: Reverse Typing Practice (English word -> Vietnamese meaning with flexible keyword matching).
    """
    v = db.query(Vocabulary).filter(Vocabulary.id == req.vocab_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Không tìm thấy từ vựng")

    target_meaning = (v.meaning_vi or "").lower().strip()
    user_input = req.user_meaning_input.lower().strip()

    # Extract keywords from target meaning (length >= 2)
    target_keywords = [w for w in re.split(r'[\s,/()\-]+', target_meaning) if len(w) >= 2]
    user_keywords = [w for w in re.split(r'[\s,/()\-]+', user_input) if len(w) >= 2]

    # Flexible matching rule: if user enters at least 1 key keyword or similarity > 0.4
    matched = any(kw in user_input for kw in target_keywords) or any(ukw in target_meaning for ukw in user_keywords)

    attempt = PracticeAttempt(
        vocabulary_id=v.id,
        attempt_type="reverse_typing",
        is_correct=matched
    )
    db.add(attempt)
    db.commit()

    return {
        "is_correct": matched,
        "user_input": req.user_meaning_input,
        "target_meaning": v.meaning_vi,
        "vocab_id": v.id
    }

@router.get("/synonyms")
def generate_synonyms_quiz(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Module 14.3: Synonyms & Antonyms Quiz Mode.
    """
    DEFAULT_SYNONYMS = {
        "proposal": "suggestion",
        "investigation": "inquiry",
        "renovation": "reconstruction",
        "venue": "location",
        "belongings": "possessions",
        "campaign": "initiative",
        "secure": "safe",
        "exceptional": "outstanding",
        "comprehensive": "thorough"
    }

    words = db.query(Vocabulary).all()
    if not words:
        raise HTTPException(status_code=400, detail="Không có từ vựng")

    sampled = random.sample(words, min(limit, len(words)))
    all_syn_pool = list(set(list(DEFAULT_SYNONYMS.values()) + [w.word for w in words]))

    items = []
    for target in sampled:
        correct_syn = DEFAULT_SYNONYMS.get(target.word.lower(), "equivalent")
        distractors = [s for s in all_syn_pool if s != correct_syn and s != target.word]
        chosen_distractors = random.sample(distractors, 3) if len(distractors) >= 3 else ["option_a", "option_b", "option_c"]

        options = [correct_syn] + chosen_distractors
        random.shuffle(options)

        items.append({
            "vocab_id": target.id,
            "word": target.word,
            "part_of_speech": target.part_of_speech,
            "meaning_vi": target.meaning_vi,
            "correct_synonym": correct_syn,
            "options": options
        })

    return {"total_quiz": len(items), "items": items}

@router.post("/vocab/attempt")
def record_quiz_attempt(
    vocab_id: int,
    is_correct: bool,
    db: Session = Depends(get_db)
):
    attempt = PracticeAttempt(
        vocabulary_id=vocab_id,
        attempt_type="quiz",
        is_correct=is_correct
    )
    db.add(attempt)
    db.commit()
    return {"message": "Đã ghi nhận kết quả bài quiz!", "attempt_id": attempt.id}
