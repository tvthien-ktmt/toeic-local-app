import random
import re
import json
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
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
    Optimized with SQL ORDER BY RANDOM() LIMIT N to avoid loading full table into RAM.
    """
    query = db.query(Vocabulary)

    if document_id is not None:
        query = query.filter(Vocabulary.source_document_id == document_id)
    if appears_in_part:
        query = query.filter(Vocabulary.appears_in_part.ilike(f"%{appears_in_part}%"))
    if topic_category:
        query = query.filter(Vocabulary.topic_category == topic_category)
    if unmastered_only:
        unmastered_subq = db.query(Flashcard.vocabulary_id).filter(Flashcard.srs_level < 3).subquery()
        query = query.filter(Vocabulary.id.in_(unmastered_subq))

    # Order by random directly in SQLite and limit to required count
    target_words = query.order_by(func.random()).limit(limit * 2).all()
    if not target_words or len(target_words) < 4:
        target_words = db.query(Vocabulary).order_by(func.random()).limit(limit * 2).all()
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

    # Fetch random 30 meanings directly from DB instead of loading all rows
    db_meanings_tuples = db.query(Vocabulary.meaning_vi).filter(
        Vocabulary.meaning_vi != None,
        ~Vocabulary.meaning_vi.startswith("Nghĩa từ vựng"),
        ~Vocabulary.meaning_vi.startswith("từ vựng")
    ).order_by(func.random()).limit(30).all()

    for (m,) in db_meanings_tuples:
        if m and m not in pool_meanings:
            pool_meanings.append(m)

    sampled_targets = target_words[:min(limit, len(target_words))]

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
    Optimized with SQL ORDER BY RANDOM() LIMIT N.
    """
    query = db.query(Vocabulary)
    if document_id is not None:
        query = query.filter(Vocabulary.source_document_id == document_id)

    sampled = query.order_by(func.random()).limit(min(limit, 50)).all()
    if not sampled or len(sampled) < 4:
        sampled = db.query(Vocabulary).order_by(func.random()).limit(min(limit, 50)).all()

    # Fetch random 30 spelling words directly from DB for distractors
    all_spelling_tuples = db.query(Vocabulary.word).order_by(func.random()).limit(30).all()
    all_spelling_words = [w[0] for w in all_spelling_tuples if w[0]]

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
    Optimized with SQL ORDER BY RANDOM() LIMIT N.
    """
    sampled = db.query(Vocabulary).filter(
        Vocabulary.synonyms != None,
        Vocabulary.synonyms != "[]"
    ).order_by(func.random()).limit(min(limit, 50)).all()

    if not sampled:
        sampled = db.query(Vocabulary).order_by(func.random()).limit(min(limit, 50)).all()
        if not sampled:
            raise HTTPException(status_code=400, detail="Không có từ vựng trong CSDL!")

    # Fetch random 20 vocabulary rows with synonyms for distractor pool
    syn_rows = db.query(Vocabulary.synonyms).filter(
        Vocabulary.synonyms != None,
        Vocabulary.synonyms != "[]"
    ).order_by(func.random()).limit(20).all()

    global_syn_pool = []
    for (syn_str,) in syn_rows:
        if syn_str and syn_str != "[]":
            try:
                syns = json.loads(syn_str)
                if isinstance(syns, list):
                    global_syn_pool.extend(syns)
            except Exception:
                pass

    if len(global_syn_pool) < 5:
        global_syn_pool.extend(["suggestion", "inquiry", "reconstruction", "location", "possessions", "initiative", "safe", "outstanding", "thorough"])

    items = []
    for target in sampled:
        correct_syn = None
        if target.synonyms and target.synonyms != "[]":
            try:
                syns = json.loads(target.synonyms)
                if isinstance(syns, list) and len(syns) > 0:
                    correct_syn = syns[0]
            except Exception:
                pass
                
        if not correct_syn:
            if target.word.lower() in REAL_VIETNAMESE_DICTIONARY:
                dict_entry = REAL_VIETNAMESE_DICTIONARY[target.word.lower()]
                if len(dict_entry) >= 5 and dict_entry[4]:
                    correct_syn = dict_entry[4][0]
                    
        if not correct_syn:
            correct_syn = f"synonym_{target.word}"

        distractors = [s for s in global_syn_pool if s != correct_syn and s.lower() != target.word.lower()]
        if len(distractors) < 3:
            distractors = ["suggestion", "location", "possessions", "safe", "thorough"]
        chosen_distractors = random.sample(distractors, 3)

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
