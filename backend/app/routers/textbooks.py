import json
import re
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import Document, Question, ExamAttempt, PracticeAttempt
from ..services.textbook_service import scan_and_seed_textbooks, calculate_toeic_rc_score, ensure_db_schema

router = APIRouter(prefix="/api/textbooks", tags=["Textbooks & Built-in Exams"])

class ExamSubmitRequest(BaseModel):
    document_id: int
    mode: str  # "full_exam" (75m) or "practice" (unlimited)
    time_spent_seconds: int = 0
    answers: Dict[str, str]  # {question_id_str: selected_option ("A","B","C","D")}


@router.post("/init")
def init_builtin_textbooks(db: Session = Depends(get_db)):
    r"""Triggers scan and seed of textbook directory."""
    try:
        res = scan_and_seed_textbooks(db)
        if res.get("status") == "error":
            raise HTTPException(status_code=500, detail=res.get("message", "Seed failed"))
        return res
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Textbook seeding error: {str(e)}")


@router.get("/catalog")
def get_textbook_catalog(db: Session = Depends(get_db)):
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
            print(f"[TEXTBOOK CATALOG] Auto-seed warning: {e}")

    docs = db.query(Document).filter(Document.is_builtin == True).order_by(Document.category, Document.series, Document.test_number).all()

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

        # Find q_count and attempts
        q_count = db.query(Question).filter(Question.document_id == d.id).count()
        doc_attempts = attempts_map.get(d.id, [])
        highest_score = max([a.toeic_score for a in doc_attempts], default=None)
        highest_raw = max([a.raw_score for a in doc_attempts], default=None)
        attempt_count = len(doc_attempts)
        last_completed = max([a.completed_at.isoformat() for a in doc_attempts], default=None)

        categories_dict[cat][ser].append({
            "id": d.id,
            "filename": d.filename,
            "test_number": d.test_number or 1,
            "question_count": q_count,
            "is_seeded": q_count > 0,
            "highest_score": highest_score,
            "highest_raw": highest_raw,
            "attempt_count": attempt_count,
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

    return {
        "status": "success",
        "total_builtin_tests": len(docs),
        "catalog": catalog
    }


@router.get("/exam/{doc_id}")
def get_exam_questions(doc_id: int, db: Session = Depends(get_db)):
    """
    Returns full test payload (questions 101-200, passages, options) for exam taking.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Đề thi không tồn tại.")

    qs = db.query(Question).filter(Question.document_id == doc_id).all()
    
    # Sort questions by integer extracted from question_text e.g. "101. Former..."
    def get_q_num(q):
        m = re.search(r'\d+', q.question_text)
        return int(m.group(0)) if m else q.id

    sorted_qs = sorted(qs, key=get_q_num)

    formatted_qs = []
    for q in sorted_qs:
        try:
            options = json.loads(q.options_json) if q.options_json else []
        except Exception:
            options = []

        try:
            opt_exps = json.loads(q.option_explanations_json) if q.option_explanations_json else {}
        except Exception:
            opt_exps = {}

        m_num = re.search(r'^\s*(\d{3})\b', q.question_text)
        q_num = int(m_num.group(1)) if m_num else get_q_num(q)

        formatted_qs.append({
            "id": q.id,
            "q_num": q_num,
            "part": q.part or (5 if q_num <= 130 else (6 if q_num <= 146 else 7)),
            "question_text": q.question_text,
            "options": options,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "option_explanations": opt_exps,
            "translated_sentence": q.translated_sentence,
            "grammar_topic": q.grammar_topic or f"Part {q.part}"
        })

    return {
        "status": "success",
        "document": {
            "id": doc.id,
            "filename": doc.filename,
            "category": doc.category,
            "series": doc.series,
            "test_number": doc.test_number,
            "markdown_content": doc.markdown_content,
            "is_builtin": doc.is_builtin
        },
        "total_questions": len(formatted_qs),
        "questions": formatted_qs
    }


@router.post("/exam/submit")
def submit_exam(req: ExamSubmitRequest, db: Session = Depends(get_db)):
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

    detailed_results = []

    for q in qs:
        # req.answers maps question.id or question_num string -> user's option ("A","B","C","D")
        user_ans = req.answers.get(str(q.id)) or req.answers.get(str(q.question_text[:3])) or req.answers.get(str(q.id))
        corr_ans = (q.correct_answer or "A").strip().upper()

        is_correct = False
        if user_ans and user_ans.strip().upper() == corr_ans:
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
            "grammar_topic": q.grammar_topic
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
        answers_json=json.dumps(req.answers, ensure_ascii=False)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "status": "success",
        "attempt_id": attempt.id,
        "exam_title": doc.filename,
        "mode": req.mode,
        "raw_score": raw_score,
        "total_questions": total_qs,
        "toeic_score": toeic_score,
        "time_spent_seconds": req.time_spent_seconds,
        "part5_correct": part5_correct,
        "part6_correct": part6_correct,
        "part7_correct": part7_correct,
        "completed_at": attempt.completed_at.isoformat(),
        "detailed_results": detailed_results
    }


@router.get("/history")
def get_exam_history(db: Session = Depends(get_db)):
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
