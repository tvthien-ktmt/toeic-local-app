from typing import Dict, Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case, cast, Float, Integer
from ..db import get_db
from ..models import Vocabulary, Flashcard, PracticeAttempt, Question

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated learning progress statistics using SQL GROUP BY & COUNT aggregations.
    DoD: Direct SQL aggregation, fast load times (< 100ms).
    """
    # 1. Overall Vocabulary & SRS Mastered Progress (srs_level >= 3)
    total_vocab = db.query(func.count(Vocabulary.id)).scalar() or 0
    learned_vocab = db.query(func.count(Flashcard.id)).filter(Flashcard.srs_level >= 3).scalar() or 0

    # 2. Overall Practice Attempts & Accuracy Rate
    total_attempts = db.query(func.count(PracticeAttempt.id)).scalar() or 0
    correct_attempts = db.query(func.count(PracticeAttempt.id)).filter(PracticeAttempt.is_correct == True).scalar() or 0
    overall_accuracy = round((correct_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0.0

    # 3. Accuracy Progress by Part (Part 5, Part 6, Part 7, Listening)
    part_stats = []
    for part_name in ["Part 5", "Part 6", "Part 7", "Part 1-4"]:
        q_ids = [q.id for q in db.query(Question.id).filter(Question.topic_tag.ilike(f"%{part_name}%") | Question.grammar_topic.ilike(f"%{part_name}%")).all()]
        v_ids = [v.id for v in db.query(Vocabulary.id).filter(Vocabulary.appears_in_part.ilike(f"%{part_name}%")).all()]

        p_attempts = db.query(PracticeAttempt).filter(
            (PracticeAttempt.question_id.in_(q_ids)) | (PracticeAttempt.vocabulary_id.in_(v_ids))
        ) if (q_ids or v_ids) else db.query(PracticeAttempt).filter(False)

        p_total = p_attempts.count()
        p_correct = p_attempts.filter(PracticeAttempt.is_correct == True).count()
        p_acc = round((p_correct / p_total * 100), 1) if p_total > 0 else 0.0

        part_stats.append({
            "part_name": part_name,
            "total_attempts": p_total,
            "accuracy_rate": p_acc
        })

    # 4. Progress by Topic Album (topic_category)
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

    # 5. Grammar Topic Accuracy (Part 5/6)
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

    # 6. Daily Activity History (Last 14 days)
    fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
    daily_raw = db.query(
        func.date(PracticeAttempt.attempted_at).label("attempt_date"),
        func.count(PracticeAttempt.id).label("count")
    ).filter(PracticeAttempt.attempted_at >= fourteen_days_ago).group_by(func.date(PracticeAttempt.attempted_at)).all()

    daily_history = [{"date": str(d_date), "attempts": d_cnt} for d_date, d_cnt in daily_raw]

    return {
        "summary": {
            "total_vocab": total_vocab,
            "learned_vocab": learned_vocab,
            "mastery_percentage": round((learned_vocab / total_vocab * 100), 1) if total_vocab > 0 else 0.0,
            "total_attempts": total_attempts,
            "overall_accuracy": overall_accuracy
        },
        "part_stats": part_stats,
        "topic_progress": topic_progress,
        "grammar_stats": grammar_stats,
        "daily_history": daily_history
    }
