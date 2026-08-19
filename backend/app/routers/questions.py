import json
from typing import List, Optional, Dict, Any, Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..db import get_db
from pydantic import BaseModel
from ..models import Question, PracticeAttempt

router = APIRouter(prefix="/api/questions", tags=["questions"])

@router.get("")
def list_questions(
    document_id: Optional[int] = None,
    part: Optional[int] = None,
    grammar_topic: Optional[str] = None,
    topic_tag: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Annotated[Session, Depends(get_db)] = None # type: ignore
) -> Dict[str, Any]:
    """Retrieves paginated practice questions filtered by document, Part, or grammar topic."""
    query = db.query(Question)

    if document_id is not None:
        query = query.filter(Question.document_id == document_id)
    if part is not None:
        query = query.filter(Question.part == part)
    if grammar_topic:
        query = query.filter(Question.grammar_topic == grammar_topic)
    if topic_tag:
        query = query.filter(Question.topic_tag == topic_tag)

    total_count = query.count()
    offset = (page - 1) * limit
    questions = query.order_by(Question.id.asc()).offset(offset).limit(limit).all()

    items = []
    for q in questions:
        try:
            opts = json.loads(q.options_json)
        except Exception:
            opts = []

        items.append({
            "id": q.id,
            "document_id": q.document_id,
            "part": q.part,
            "question_text": q.question_text,
            "options": opts,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "grammar_topic": q.grammar_topic or "unclassified",
            "topic_tag": q.topic_tag,
            "is_generated": q.is_generated,
            "created_at": q.created_at
        })

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "items": items
    }

@router.get("/topics/summary")
def get_topics_summary(db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """Aggregates question counts grouped by grammar topic and passage topic tags."""
    grammar_topics = db.query(
        Question.grammar_topic, func.count(Question.id)
    ).filter(Question.grammar_topic.isnot(None)).group_by(Question.grammar_topic).all()

    topic_tags = db.query(
        Question.topic_tag, func.count(Question.id)
    ).filter(Question.topic_tag.isnot(None)).group_by(Question.topic_tag).all()

    return {
        "grammar_topics": [{"topic": gt[0], "count": gt[1]} for gt in grammar_topics],
        "topic_tags": [{"tag": tt[0], "count": tt[1]} for tt in topic_tags]
    }

@router.get("/{question_id}")
def get_question_detail(question_id: int, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """Fetches full question details including option explanations, translations, and common traps."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")

    try:
        opts = json.loads(q.options_json)
    except Exception:
        opts = []

    return {
        "id": q.id,
        "document_id": q.document_id,
        "part": q.part,
        "question_text": q.question_text,
        "options": opts,
        "correct_answer": q.correct_answer,
        "explanation": q.explanation,
        "option_explanations_json": q.option_explanations_json,
        "translated_sentence": q.translated_sentence,
        "grammar_topic": q.grammar_topic or "unclassified",
        "topic_tag": q.topic_tag,
        "is_generated": q.is_generated,
        "created_at": q.created_at
    }


class QuestionAttemptRequest(BaseModel):
    question_id: int
    is_correct: bool
    time_spent_seconds: int = 0
    part: Optional[int] = None
    session_id: Optional[str] = None


@router.post("/attempt")
def record_question_attempt(req: QuestionAttemptRequest, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Module 19.3: Records practice attempt with timing and Part info for speed analytics.
    """
    attempt = PracticeAttempt(
        question_id=req.question_id,
        attempt_type="question",
        is_correct=req.is_correct,
        time_spent_seconds=max(0, req.time_spent_seconds),
        part=req.part,
        session_id=req.session_id
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return {"status": "ok", "attempt_id": attempt.id}
