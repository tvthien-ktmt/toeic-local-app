import json
import logging
from typing import Dict, Any, List, Optional, Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..db import get_db
from ..models import Question, PracticeAttempt, ExamAttempt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/errors", tags=["Error Notebook & Retest"])


class RetestAttemptRequest(BaseModel):
    question_id: int
    selected_option: str
    time_spent_seconds: int = 0


@router.get("/notebook")
def get_error_notebook(
    part: Optional[int] = Query(None, description="Filter by Part (5, 6, 7)"),
    grammar_topic: Optional[str] = Query(None, description="Filter by grammar topic"),
    status_filter: Optional[str] = Query("all", description="all | needs_review | mastered"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Annotated[Session, Depends(get_db)] = None  # type: ignore
) -> Dict[str, Any]:
    """
    Module 31 & 32: Centralized Error Notebook aggregator.
    Aggregates mistakes from both Practice sessions and Full Exam attempts.
    Tracks error recurrence count, mastery status, and allows structured retesting.
    """
    # 1. Collect wrong question IDs and counts from PracticeAttempt
    practice_wrongs = (
        db.query(
            PracticeAttempt.question_id,
            func.count(PracticeAttempt.id).label("wrong_count"),
            func.max(PracticeAttempt.attempted_at).label("last_attempted")
        )
        .filter(
            PracticeAttempt.question_id.isnot(None),
            PracticeAttempt.is_correct == False
        )
        .group_by(PracticeAttempt.question_id)
        .all()
    )

    mistakes_map: Dict[int, Dict[str, Any]] = {}
    for question_id, wrong_count, last_attempted in practice_wrongs:
        if question_id not in mistakes_map:
            mistakes_map[question_id] = {
                "wrong_count": 0,
                "correct_count": 0,
                "last_attempted": last_attempted
            }
        mistakes_map[question_id]["wrong_count"] += wrong_count

    # 2. Collect wrong questions from ExamAttempt
    exam_attempts = db.query(ExamAttempt).all()
    for attempt in exam_attempts:
        if not attempt.answers_json:
            continue
        try:
            user_answers = json.loads(attempt.answers_json)
        except Exception:
            continue

        exam_questions = db.query(Question).filter(Question.document_id == attempt.document_id).all()
        for q_item in exam_questions:
            user_ans = user_answers.get(str(q_item.id))
            corr_ans = (q_item.correct_answer or "").strip().upper()
            if not corr_ans:
                continue

            if user_ans and user_ans.strip().upper() != corr_ans:
                if q_item.id not in mistakes_map:
                    mistakes_map[q_item.id] = {
                        "wrong_count": 0,
                        "correct_count": 0,
                        "last_attempted": attempt.completed_at
                    }
                mistakes_map[q_item.id]["wrong_count"] += 1
                if attempt.completed_at and (
                    not mistakes_map[q_item.id]["last_attempted"]
                    or attempt.completed_at > mistakes_map[q_item.id]["last_attempted"]
                ):
                    mistakes_map[q_item.id]["last_attempted"] = attempt.completed_at

    # 3. Check correct attempts for each mistake question to evaluate mastery
    question_ids = list(mistakes_map.keys())
    if question_ids:
        correct_records = (
            db.query(
                PracticeAttempt.question_id,
                func.count(PracticeAttempt.id).label("correct_count"),
                func.max(PracticeAttempt.attempted_at).label("last_correct")
            )
            .filter(
                PracticeAttempt.question_id.in_(question_ids),
                PracticeAttempt.is_correct == True
            )
            .group_by(PracticeAttempt.question_id)
            .all()
        )
        for question_id, correct_count, last_correct in correct_records:
            if question_id in mistakes_map:
                mistakes_map[question_id]["correct_count"] = correct_count
                if last_correct and (
                    not mistakes_map[question_id]["last_attempted"]
                    or last_correct > mistakes_map[question_id]["last_attempted"]
                ):
                    mistakes_map[question_id]["last_attempted"] = last_correct

    # 4. Fetch Question objects and apply filters
    if not question_ids:
        return {
            "status": "success",
            "total_mistakes": 0,
            "mastered_count": 0,
            "needs_review_count": 0,
            "topics_breakdown": [],
            "items": []
        }

    query = db.query(Question).filter(Question.id.in_(question_ids))

    if part is not None:
        query = query.filter(Question.part == part)
    if grammar_topic:
        query = query.filter(Question.grammar_topic == grammar_topic)

    all_matched_questions = query.all()

    # Topic breakdown aggregator
    topic_counts: Dict[str, int] = {}
    mastered_count = 0
    needs_review_count = 0
    all_items = []

    for question_item in all_matched_questions:
        q_stats = mistakes_map.get(question_item.id, {"wrong_count": 1, "correct_count": 0, "last_attempted": None})
        wrong_count = q_stats["wrong_count"]
        correct_count = q_stats["correct_count"]

        # If user has answered correctly at least 2 times after mistake -> mastered
        is_mastered = correct_count >= 2 and correct_count >= wrong_count
        item_status = "mastered" if is_mastered else "needs_review"

        if is_mastered:
            mastered_count += 1
        else:
            needs_review_count += 1

        topic = question_item.grammar_topic or f"Part {question_item.part}"
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

        # Check status filter
        if status_filter == "needs_review" and is_mastered:
            continue
        if status_filter == "mastered" and not is_mastered:
            continue

        try:
            options = json.loads(question_item.options_json) if question_item.options_json else []
        except Exception as parse_options_err:
            logger.debug(f"Could not parse options_json for question #{question_item.id}: {parse_options_err}")
            options = []

        try:
            opt_exps = json.loads(question_item.option_explanations_json) if question_item.option_explanations_json else {}
        except Exception as parse_exps_err:
            logger.debug(f"Could not parse option_explanations_json for question #{question_item.id}: {parse_exps_err}")
            opt_exps = {}

        last_attempt_iso = q_stats["last_attempted"].isoformat() if q_stats["last_attempted"] else None

        all_items.append({
            "id": question_item.id,
            "part": question_item.part,
            "question_text": question_item.question_text,
            "options": options,
            "correct_answer": question_item.correct_answer,
            "explanation": question_item.explanation,
            "option_explanations": opt_exps,
            "translated_sentence": question_item.translated_sentence,
            "grammar_topic": question_item.grammar_topic or f"Part {question_item.part}",
            "common_trap": question_item.common_trap,
            "wrong_count": wrong_count,
            "correct_count": correct_count,
            "status": item_status,
            "last_attempted_at": last_attempt_iso
        })

    # Sort items: highest wrong_count first
    all_items.sort(key=lambda x: (x["status"] == "needs_review", x["wrong_count"]), reverse=True)

    # Pagination
    total_items = len(all_items)
    offset = (page - 1) * limit
    paginated_items = all_items[offset : offset + limit]

    topics_breakdown = [
        {"topic": t_name, "count": t_cnt}
        for t_name, t_cnt in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "status": "success",
        "total_mistakes": len(question_ids),
        "filtered_total": total_items,
        "mastered_count": mastered_count,
        "needs_review_count": needs_review_count,
        "topics_breakdown": topics_breakdown,
        "page": page,
        "limit": limit,
        "items": paginated_items
    }


@router.get("/retest-session")
def generate_retest_session(
    limit: int = Query(10, ge=1, le=50),
    part: Optional[int] = None,
    grammar_topic: Optional[str] = None,
    db: Annotated[Session, Depends(get_db)] = None  # type: ignore
) -> Dict[str, Any]:
    """
    Generates a targeted Retest practice session focusing on unmastered mistakes.
    """
    notebook_res = get_error_notebook(
        part=part,
        grammar_topic=grammar_topic,
        status_filter="needs_review",
        page=1,
        limit=50,
        db=db
    )
    items = notebook_res.get("items", [])
    if not items:
        # Fallback to all mistakes if no needs_review items left
        notebook_res_all = get_error_notebook(
            part=part,
            grammar_topic=grammar_topic,
            status_filter="all",
            page=1,
            limit=50,
            db=db
        )
        items = notebook_res_all.get("items", [])

    sampled_items = items[:limit]

    return {
        "status": "success",
        "session_type": "error_retest",
        "total_questions": len(sampled_items),
        "questions": sampled_items
    }


@router.post("/retest-attempt")
def submit_retest_attempt(
    req: RetestAttemptRequest,
    db: Annotated[Session, Depends(get_db)] = None  # type: ignore
) -> Dict[str, Any]:
    """
    Submits an answer for a question in Retest mode, updates mastery tracking.
    """
    question_item = db.query(Question).filter(Question.id == req.question_id).first()
    if not question_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi.")

    correct_ans = (question_item.correct_answer or "").strip().upper()
    user_choice = (req.selected_option or "").strip().upper()
    is_correct = bool(correct_ans and user_choice == correct_ans)

    attempt = PracticeAttempt(
        question_id=question_item.id,
        attempt_type="retest",
        is_correct=is_correct,
        time_spent_seconds=max(0, req.time_spent_seconds),
        part=question_item.part
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Check updated total correct attempts for this question
    correct_count = (
        db.query(func.count(PracticeAttempt.id))
        .filter(PracticeAttempt.question_id == question_item.id, PracticeAttempt.is_correct == True)
        .scalar()
        or 0
    )
    wrong_count = (
        db.query(func.count(PracticeAttempt.id))
        .filter(PracticeAttempt.question_id == question_item.id, PracticeAttempt.is_correct == False)
        .scalar()
        or 0
    )
    is_mastered = correct_count >= 2 and correct_count >= wrong_count

    try:
        opt_exps = json.loads(question_item.option_explanations_json) if question_item.option_explanations_json else {}
    except Exception as parse_exps_err:
        logger.debug(f"Could not parse option_explanations_json for question #{question_item.id}: {parse_exps_err}")
        opt_exps = {}

    return {
        "status": "success",
        "is_correct": is_correct,
        "correct_answer": correct_ans,
        "user_answer": user_choice,
        "explanation": question_item.explanation,
        "option_explanations": opt_exps,
        "translated_sentence": question_item.translated_sentence,
        "common_trap": question_item.common_trap,
        "grammar_topic": question_item.grammar_topic,
        "total_correct": correct_count,
        "total_wrong": wrong_count,
        "is_mastered": is_mastered
    }
