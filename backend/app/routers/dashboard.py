from typing import Dict, Any, List, Annotated
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case, cast, Float, Integer
from ..db import get_db
from ..models import Vocabulary, Flashcard, PracticeAttempt, Question, StudySession
from ..schemas import StudySessionCreate

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.post("/study-session")
def record_study_session(req: StudySessionCreate, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Module 20.1: Records a study session duration (in seconds) from frontend.
    """
    dur = max(1, req.duration_seconds)
    now = datetime.now(timezone.utc)
    start_time = now - timedelta(seconds=dur)

    session = StudySession(
        session_type=req.session_type,
        duration_seconds=dur,
        started_at=start_time,
        ended_at=now
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"status": "ok", "session_id": session.id}


@router.get("/stats")
def get_dashboard_stats(db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Returns aggregated learning progress, Module 19 Part Speed Analytics & Module 20 Study Time Analytics.
    DoD: Direct SQL aggregation, fast load times (< 100ms).
    """
    # 1. Overall Vocabulary & SRS Mastered Progress (srs_level >= 3)
    total_vocab = db.query(func.count(Vocabulary.id)).scalar() or 0
    learned_vocab = db.query(func.count(Flashcard.id)).filter(Flashcard.srs_level >= 3).scalar() or 0
    unlearned_vocab = max(0, total_vocab - learned_vocab)

    # 2. Total Questions & Unpracticed Count
    total_questions = db.query(func.count(Question.id)).scalar() or 0
    attempted_q_count = db.query(func.count(func.distinct(PracticeAttempt.question_id))).filter(
        PracticeAttempt.question_id.isnot(None)
    ).scalar() or 0
    unpracticed_questions = max(0, total_questions - attempted_q_count)

    # 3. Overall Practice Attempts & Accuracy Rate
    total_attempts = db.query(func.count(PracticeAttempt.id)).scalar() or 0
    correct_attempts = db.query(func.count(PracticeAttempt.id)).filter(PracticeAttempt.is_correct == True).scalar() or 0
    overall_accuracy = round((correct_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0.0

    # 4. Module 20 Study Time & Consistency Analytics
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # Study Sessions duration in 7d & 30d
    sessions_7d_dur = db.query(func.sum(StudySession.duration_seconds)).filter(
        StudySession.started_at >= seven_days_ago
    ).scalar() or 0

    sessions_30d_dur = db.query(func.sum(StudySession.duration_seconds)).filter(
        StudySession.started_at >= thirty_days_ago
    ).scalar() or 0

    # Practice attempts time in 7d & 30d
    attempts_7d_dur = db.query(func.sum(PracticeAttempt.time_spent_seconds)).filter(
        PracticeAttempt.attempted_at >= seven_days_ago
    ).scalar() or 0

    attempts_30d_dur = db.query(func.sum(PracticeAttempt.time_spent_seconds)).filter(
        PracticeAttempt.attempted_at >= thirty_days_ago
    ).scalar() or 0

    total_study_min_7d = round((sessions_7d_dur + attempts_7d_dur) / 60.0, 1)
    total_study_min_30d = round((sessions_30d_dur + attempts_30d_dur) / 60.0, 1)

    # Active Days in 7d & 30d
    active_days_7d = db.query(func.count(func.distinct(func.date(StudySession.started_at)))).filter(
        StudySession.started_at >= seven_days_ago
    ).scalar() or 0

    active_days_30d = db.query(func.count(func.distinct(func.date(StudySession.started_at)))).filter(
        StudySession.started_at >= thirty_days_ago
    ).scalar() or 0

    # 5. Module 19 Speed Analytics by Part (Part 5: 20s target, Part 6: 37s target, Part 7: 60s target)
    part_speeds = {}
    for p_num in [5, 6, 7]:
        avg_sec = db.query(func.avg(PracticeAttempt.time_spent_seconds)).join(
            Question, PracticeAttempt.question_id == Question.id
        ).filter(
            Question.part == p_num,
            PracticeAttempt.time_spent_seconds > 0
        ).scalar()
        part_speeds[f"part{p_num}_avg_sec"] = round(avg_sec, 1) if avg_sec else 0.0

    # 6. Accuracy Progress by Part (Part 5, Part 6, Part 7, Listening)
    part_stats = []
    for part_name, part_num in [("Part 5", 5), ("Part 6", 6), ("Part 7", 7), ("Part 1-4", 1)]:
        if part_name == "Part 1-4":
            v_subq = db.query(Vocabulary.id).filter(Vocabulary.appears_in_part.in_(["Part 1", "Part 2", "Part 3", "Part 4"])).subquery()
            p_attempts = db.query(PracticeAttempt).filter(PracticeAttempt.vocabulary_id.in_(v_subq))
        else:
            q_subq = db.query(Question.id).filter(Question.part == part_num).subquery()
            v_subq = db.query(Vocabulary.id).filter(Vocabulary.appears_in_part == f"Part {part_num}").subquery()
            p_attempts = db.query(PracticeAttempt).filter(
                (PracticeAttempt.question_id.in_(q_subq)) | (PracticeAttempt.vocabulary_id.in_(v_subq))
            )

        p_total = p_attempts.count()
        p_correct = p_attempts.filter(PracticeAttempt.is_correct == True).count()
        p_acc = round((p_correct / p_total * 100), 1) if p_total > 0 else 0.0

        part_stats.append({
            "part_name": part_name,
            "total_attempts": p_total,
            "accuracy_rate": p_acc
        })

    # 7. Progress by Topic Album (topic_category)
    topic_albums_raw = db.query(
        Vocabulary.topic_category,
        func.count(Vocabulary.id).label("total_words"),
        func.sum(case((Flashcard.srs_level >= 3, 1), else_=0)).label("learned_words")
    ).outerjoin(Flashcard, Vocabulary.id == Flashcard.vocabulary_id).group_by(Vocabulary.topic_category).all()

    topic_progress = []
    for t_cat, t_tot, t_lrn in topic_albums_raw:
        if t_cat:
            t_lrn_val = t_lrn or 0
            topic_progress.append({
                "topic_category": t_cat,
                "total_words": t_tot,
                "learned_words": t_lrn_val,
                "mastery_rate": round((t_lrn_val / t_tot * 100), 1) if t_tot > 0 else 0.0
            })

    # 8. Grammar Topic Accuracy (Part 5/6)
    grammar_raw = db.query(
        Question.grammar_topic,
        func.count(PracticeAttempt.id).label("total_att"),
        func.sum(case((PracticeAttempt.is_correct == True, 1), else_=0)).label("correct_att")
    ).join(PracticeAttempt, Question.id == PracticeAttempt.question_id).group_by(Question.grammar_topic).all()

    grammar_stats = []
    for g_topic, g_tot, g_corr in grammar_raw:
        if g_topic:
            g_corr_val = g_corr or 0
            grammar_stats.append({
                "grammar_topic": g_topic,
                "total_attempts": g_tot,
                "accuracy_rate": round((g_corr_val / g_tot * 100), 1) if g_tot > 0 else 0.0
            })

    # 9. Daily Activity History (Last 14 days)
    fourteen_days_ago = now - timedelta(days=14)
    daily_raw = db.query(
        func.date(PracticeAttempt.attempted_at).label("attempt_date"),
        func.count(PracticeAttempt.id).label("count")
    ).filter(PracticeAttempt.attempted_at >= fourteen_days_ago).group_by(func.date(PracticeAttempt.attempted_at)).all()

    daily_history = [{"date": str(d_date), "attempts": d_cnt} for d_date, d_cnt in daily_raw]

    return {
        "summary": {
            "total_vocab": total_vocab,
            "learned_vocab": learned_vocab,
            "unlearned_vocab": unlearned_vocab,
            "total_questions": total_questions,
            "unpracticed_questions": unpracticed_questions,
            "mastery_percentage": round((learned_vocab / total_vocab * 100), 1) if total_vocab > 0 else 0.0,
            "total_attempts": total_attempts,
            "overall_accuracy": overall_accuracy,
            "total_study_min_7d": total_study_min_7d,
            "total_study_min_30d": total_study_min_30d,
            "active_days_7d": active_days_7d,
            "active_days_30d": active_days_30d,
            "part5_avg_speed_sec": part_speeds["part5_avg_sec"],
            "part6_avg_speed_sec": part_speeds["part6_avg_sec"],
            "part7_avg_speed_sec": part_speeds["part7_avg_sec"]
        },
        "part_stats": part_stats,
        "topic_progress": topic_progress,
        "grammar_stats": grammar_stats,
        "daily_history": daily_history
    }
