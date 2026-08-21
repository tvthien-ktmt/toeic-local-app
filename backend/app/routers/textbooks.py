import json
import re
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import Document, Question, ExamAttempt, PracticeAttempt
from ..services.textbook_service import scan_and_seed_textbooks, calculate_toeic_rc_score, ensure_db_schema

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Textbooks & Built-in Exams"])

class ExamSubmitRequest(BaseModel):
    document_id: int
    mode: str  # "full_exam" (75m) or "practice" (unlimited)
    time_spent_seconds: int = 0
    answers: Dict[str, str]  # {question_id_str: selected_option ("A","B","C","D")}


@router.post("/init")
def init_builtin_textbooks(db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    r"""Triggers scan and seed of textbook directory."""
    try:
        seed_result = scan_and_seed_textbooks(db)
        if seed_result.get("status") == "error":
            raise HTTPException(status_code=500, detail=seed_result.get("message", "Seed failed"))
        return seed_result
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Textbook seeding error: {str(e)}")


@router.get("/catalog")
def get_textbook_catalog(db: Annotated[Session, Depends(get_db)]) -> List[Dict[str, Any]]:
    """
    Returns structured catalog of built-in textbooks grouped by Category (ETS, HACKER, YBM, XANH CAM).
    Includes test count, total questions, highest score achieved.
    """
    ensure_db_schema(db)

    # Auto seed if empty or no questions exist
    builtin_count = db.query(Document).filter(Document.is_builtin == True).count()
    total_q_count = db.query(Question).count()
    if builtin_count == 0 or total_q_count == 0:
        try:
            scan_and_seed_textbooks(db)
        except Exception as e:
            logger.warning(f"[TEXTBOOK CATALOG] Auto-seed warning: {e}")

    docs = db.query(Document).filter(Document.is_builtin == True).order_by(Document.category, Document.series, Document.test_number).all()

    # Single GROUP BY query to get question counts per document — avoids N+1
    q_count_rows = db.query(Question.document_id, func.count(Question.id)).group_by(Question.document_id).all()
    q_count_map = {doc_id: cnt for doc_id, cnt in q_count_rows}

    # Get user attempts mapped by document_id
    attempts = db.query(ExamAttempt).all()
    attempts_map = {}
    for att in attempts:
        if att.document_id not in attempts_map:
            attempts_map[att.document_id] = []
        attempts_map[att.document_id].append(att)

    # Group by category -> series
    categories_dict = {}
    for d in docs:
        cat = d.category or "ETS"
        ser = d.series or d.filename

        if cat not in categories_dict:
            categories_dict[cat] = {}

        if ser not in categories_dict[cat]:
            categories_dict[cat][ser] = []

        q_count = q_count_map.get(d.id, 0)
        doc_attempts = attempts_map.get(d.id, [])
        highest_score = max([a.toeic_score for a in doc_attempts], default=None)
        highest_raw = max([a.raw_score for a in doc_attempts], default=None)
        attempt_count = len(doc_attempts)
        average_score = round(sum([a.toeic_score for a in doc_attempts]) / attempt_count) if attempt_count > 0 else None
        last_completed = max([a.completed_at.isoformat() for a in doc_attempts], default=None)

        # Calculate standard difficulty & format similarity per Category
        difficulty_map = {
            "ETS": "Chuẩn ETS (Trung Bình)",
            "HACKER": "Nâng Cao (Khó)",
            "YBM": "Thực Chiến (Khá Khó)",
            "XANH CAM": "Luyện Đề (Trung Bình Khá)"
        }
        diff_rating = difficulty_map.get(cat.upper(), "Chuẩn Format Mới")
        status_tag = "completed" if attempt_count > 0 else "not_started"

        categories_dict[cat][ser].append({
            "id": d.id,
            "filename": d.filename,
            "test_number": d.test_number or 1,
            "question_count": q_count,
            "is_seeded": q_count > 0,
            "highest_score": highest_score,
            "highest_raw": highest_raw,
            "average_score": average_score,
            "attempt_count": attempt_count,
            "difficulty_rating": diff_rating,
            "format_similarity": "100% Format TOEIC Mới",
            "status": status_tag,
            "last_completed": last_completed
        })

    # Transform into clean list structure
    catalog = []
    for cat_name, series_map in categories_dict.items():
        series_list = []
        for ser_name, tests_list in series_map.items():
            series_list.append({
                "series_title": ser_name,
                "total_tests": len(tests_list),
                "tests": tests_list
            })
        catalog.append({
            "category_name": cat_name,
            "series": series_list
        })

    return catalog


@router.get("/exam/{doc_id}")
def get_exam_questions(
    doc_id: int, 
    mode: Optional[str] = Query(None),
    db: Annotated[Session, Depends(get_db)] = None
) -> Dict[str, Any]:
    """
    Returns full structured test payload (Part 5 questions, Part 6 passages with inline blanks,
    Part 7 Single/Double/Triple passage sets with semantic documents and questions).
    In full_exam mode, correct_answer and explanations are omitted to prevent F12 inspection.
    """
    from ..services.content_normalizer import get_normalized_exam_payload
    
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Đề thi không tồn tại.")

    qs = db.query(Question).filter(Question.document_id == doc_id).all()
    return get_normalized_exam_payload(doc, qs, mode=mode)


@router.post("/exam/submit")
def submit_exam(req: ExamSubmitRequest, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Grades exam submission, calculates TOEIC RC scaled score (5-495), stores attempt in DB.
    """
    doc = db.query(Document).filter(Document.id == req.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Đề thi không tồn tại.")

    qs = db.query(Question).filter(Question.document_id == req.document_id).all()
    if not qs:
        raise HTTPException(status_code=400, detail="Đề thi chưa có câu hỏi nào.")

    raw_score = 0
    part5_correct = 0
    part6_correct = 0
    part7_correct = 0
    no_answer_key_count = 0

    detailed_results = []

    for q in qs:
        m_num = re.search(r'^\s*(\d{3})\b', q.question_text)
        match = re.search(r'\d+', q.question_text)
        q_num = int(m_num.group(1)) if m_num else (int(match.group(0)) if match else q.id)

        # req.answers maps question number or question.id -> user's option ("A","B","C","D")
        user_ans = req.answers.get(str(q.id)) or req.answers.get(str(q_num))
        corr_ans = (q.correct_answer or "").strip().upper()

        is_correct = False
        if not corr_ans:
            # No answer key stored — cannot grade this question
            no_answer_key_count += 1
        elif user_ans and user_ans.strip().upper() == corr_ans:
            is_correct = True
            raw_score += 1
            if q.part == 5:
                part5_correct += 1
            elif q.part == 6:
                part6_correct += 1
            else:
                part7_correct += 1

        try:
            options = json.loads(q.options_json) if q.options_json else []
        except Exception:
            options = []

        try:
            opt_exps = json.loads(q.option_explanations_json) if q.option_explanations_json else {}
        except Exception:
            opt_exps = {}

        detailed_results.append({
            "id": q.id,
            "question_text": q.question_text,
            "part": q.part,
            "options": options,
            "correct_answer": corr_ans,
            "user_answer": user_ans,
            "is_correct": is_correct,
            "explanation": q.explanation,
            "option_explanations": opt_exps,
            "translated_sentence": q.translated_sentence,
            "grammar_topic": q.grammar_topic,
            "common_trap": q.common_trap
        })

    total_qs = len(qs)
    # Calculate scaled TOEIC RC score (5..495)
    toeic_score = calculate_toeic_rc_score(raw_score)

    # Save to ExamAttempt database
    attempt = ExamAttempt(
        document_id=doc.id,
        exam_title=doc.filename,
        mode=req.mode,
        raw_score=raw_score,
        total_questions=total_qs,
        toeic_score=toeic_score,
        time_spent_seconds=req.time_spent_seconds,
        part5_correct=part5_correct,
        part6_correct=part6_correct,
        part7_correct=part7_correct,
        completed_at=datetime.utcnow(),
        answers_json=json.dumps(req.answers, ensure_ascii=False)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Time & Pacing Analytics (Module XIV & XV)
    avg_sec_per_q = round(req.time_spent_seconds / max(1, total_qs), 1)
    
    # Estimate pacing distribution
    part5_est_time = round(req.time_spent_seconds * 0.16) # ~16%
    part6_est_time = round(req.time_spent_seconds * 0.14) # ~14%
    part7_est_time = req.time_spent_seconds - part5_est_time - part6_est_time

    pacing_verdict = "Tốc độ làm bài chuẩn! Phân bổ thời gian đồng đều giữa các Part."
    if req.time_spent_seconds > 4200: # > 70 mins
        pacing_verdict = "Cảnh báo tốc độ: Bạn hoàn thành sát nút hoặc thiếu giờ. Cần tăng tốc Part 5 (mục tiêu 15-20s/câu) để dành tối thiểu 50 phút cho Part 7."
    elif req.time_spent_seconds < 2400 and req.time_spent_seconds > 0: # < 40 mins
        pacing_verdict = "Bạn làm bài rất nhanh. Hãy kiểm tra lại độ cẩn thận để tránh bẫy từ loại và bẫy suy luận ở Part 7."

    time_analysis = {
        "total_seconds": req.time_spent_seconds,
        "avg_seconds_per_question": avg_sec_per_q,
        "part5_avg_seconds": round(part5_est_time / 30, 1),
        "part6_avg_seconds": round(part6_est_time / 16, 1),
        "part7_avg_seconds": round(part7_est_time / 54, 1),
        "part5_est_seconds": part5_est_time,
        "part6_est_seconds": part6_est_time,
        "part7_est_seconds": part7_est_time,
        "pacing_verdict": pacing_verdict,
        "late_part7_warning": req.time_spent_seconds > 4000
    }

    return {
        "status": "success",
        "attempt_id": attempt.id,
        "exam_title": doc.filename,
        "mode": req.mode,
        "raw_score": raw_score,
        "total_questions": total_qs,
        "gradeable_questions": total_qs - no_answer_key_count,
        "no_answer_key_count": no_answer_key_count,
        "toeic_score": toeic_score,
        "scaled_score": toeic_score,
        "time_spent_seconds": req.time_spent_seconds,
        "part5_correct": part5_correct,
        "part5_total": 30,
        "part6_correct": part6_correct,
        "part6_total": 16,
        "part7_correct": part7_correct,
        "part7_total": 54,
        "completed_at": (attempt.completed_at or datetime.utcnow()).isoformat(),
        "time_analysis": time_analysis,
        "detailed_results": detailed_results
    }


@router.get("/history")
def get_exam_history(db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """Returns list of past exam attempts for dashboard analytics."""
    attempts = db.query(ExamAttempt).order_by(ExamAttempt.completed_at.desc()).all()

    history = []
    for a in attempts:
        history.append({
            "id": a.id,
            "document_id": a.document_id,
            "exam_title": a.exam_title,
            "mode": a.mode,
            "raw_score": a.raw_score,
            "total_questions": a.total_questions,
            "toeic_score": a.toeic_score,
            "time_spent_seconds": a.time_spent_seconds,
            "part5_correct": a.part5_correct,
            "part6_correct": a.part6_correct,
            "part7_correct": a.part7_correct,
            "completed_at": a.completed_at.isoformat()
        })

    return {
        "status": "success",
        "attempts_count": len(history),
        "history": history
    }


@router.get("/history/{doc_id}")
def get_doc_exam_history(doc_id: int, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """Returns all exam attempts for a specific document, newest first."""
    attempts = db.query(ExamAttempt).filter(
        ExamAttempt.document_id == doc_id
    ).order_by(ExamAttempt.completed_at.desc()).all()

    history = []
    for a in attempts:
        history.append({
            "id": a.id,
            "mode": a.mode,
            "raw_score": a.raw_score,
            "total_questions": a.total_questions,
            "toeic_score": a.toeic_score,
            "time_spent_seconds": a.time_spent_seconds,
            "part5_correct": a.part5_correct,
            "part6_correct": a.part6_correct,
            "part7_correct": a.part7_correct,
            "completed_at": a.completed_at.isoformat()
        })

    return {
        "status": "success",
        "document_id": doc_id,
        "attempts_count": len(history),
        "history": history
    }


@router.get("/weakness-report")
def get_weakness_report(db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Aggregates grammar topics from all exam attempts to identify weak spots.
    Returns top weak grammar_topics based on missed questions across all exams.
    """
    attempts = db.query(ExamAttempt).order_by(ExamAttempt.completed_at.desc()).limit(50).all()

    topic_stats: dict = {}

    for attempt in attempts:
        try:
            answers = json.loads(attempt.answers_json) if attempt.answers_json else {}
        except Exception:
            continue

        qs = db.query(Question).filter(Question.document_id == attempt.document_id).all()
        for q in qs:
            topic = q.grammar_topic or f"Part {q.part}"
            user_ans = answers.get(str(q.id), "").strip().upper()
            corr_ans = (q.correct_answer or "").strip().upper()

            if topic not in topic_stats:
                topic_stats[topic] = {"correct": 0, "wrong": 0, "skipped": 0, "total": 0}

            topic_stats[topic]["total"] += 1
            if not corr_ans:
                pass
            elif not user_ans:
                topic_stats[topic]["skipped"] += 1
            elif user_ans == corr_ans:
                topic_stats[topic]["correct"] += 1
            else:
                topic_stats[topic]["wrong"] += 1

    weakness_list = []
    for topic, stats in topic_stats.items():
        total_graded = stats["correct"] + stats["wrong"] + stats["skipped"]
        if total_graded == 0:
            continue
        error_rate = round((stats["wrong"] + stats["skipped"]) / total_graded * 100, 1)
        weakness_list.append({
            "grammar_topic": topic,
            "total_questions": total_graded,
            "correct": stats["correct"],
            "wrong": stats["wrong"],
            "skipped": stats["skipped"],
            "error_rate": error_rate
        })

    weakness_list.sort(key=lambda x: x["error_rate"] * x["total_questions"], reverse=True)

    return {
        "status": "success",
        "topics_analyzed": len(weakness_list),
        "weakest_topics": weakness_list[:15]
    }
