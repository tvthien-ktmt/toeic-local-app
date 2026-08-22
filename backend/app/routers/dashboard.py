from typing import Dict, Any, List, Annotated
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case, cast, Float, Integer
from ..db import get_db
from ..models import Vocabulary, Flashcard, PracticeAttempt, Question, StudySession, ExamAttempt
from ..schemas import StudySessionCreate

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.post("/study-session")
def record_study_session(req: StudySessionCreate, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Module 20.1: Records a study session duration (in seconds) from frontend.
    """
    clamped_duration_seconds = max(1, req.duration_seconds)
    now = datetime.now(timezone.utc)
    start_time = now - timedelta(seconds=clamped_duration_seconds)

    session = StudySession(
        session_type=req.session_type,
        duration_seconds=clamped_duration_seconds,
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
    Optimized with direct consolidated SQL aggregations.
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

    # Consolidated duration queries
    study_duration_aggregates = db.query(
        func.sum(case((StudySession.started_at >= seven_days_ago, StudySession.duration_seconds), else_=0)).label("sessions_7d"),
        func.sum(case((StudySession.started_at >= thirty_days_ago, StudySession.duration_seconds), else_=0)).label("sessions_30d"),
        func.count(func.distinct(case((StudySession.started_at >= seven_days_ago, func.date(StudySession.started_at)), else_=None))).label("active_days_7d"),
        func.count(func.distinct(case((StudySession.started_at >= thirty_days_ago, func.date(StudySession.started_at)), else_=None))).label("active_days_30d"),
    ).first()

    sessions_7d_dur = study_duration_aggregates[0] or 0 if study_duration_aggregates else 0
    sessions_30d_dur = study_duration_aggregates[1] or 0 if study_duration_aggregates else 0
    active_days_7d = study_duration_aggregates[2] or 0 if study_duration_aggregates else 0
    active_days_30d = study_duration_aggregates[3] or 0 if study_duration_aggregates else 0

    attempt_duration_aggregates = db.query(
        func.sum(case((PracticeAttempt.attempted_at >= seven_days_ago, PracticeAttempt.time_spent_seconds), else_=0)).label("attempts_7d"),
        func.sum(case((PracticeAttempt.attempted_at >= thirty_days_ago, PracticeAttempt.time_spent_seconds), else_=0)).label("attempts_30d"),
    ).first()

    attempts_7d_dur = attempt_duration_aggregates[0] or 0 if attempt_duration_aggregates else 0
    attempts_30d_dur = attempt_duration_aggregates[1] or 0 if attempt_duration_aggregates else 0

    total_study_min_7d = round((sessions_7d_dur + attempts_7d_dur) / 60.0, 1)
    total_study_min_30d = round((sessions_30d_dur + attempts_30d_dur) / 60.0, 1)

    # 5. Speed Analytics by Part (Part 5, 6, 7) — consolidated single query
    speed_rows = db.query(
        Question.part,
        func.avg(PracticeAttempt.time_spent_seconds).label("average_seconds")
    ).join(
        Question, PracticeAttempt.question_id == Question.id
    ).filter(
        Question.part.in_([5, 6, 7]),
        PracticeAttempt.time_spent_seconds > 0
    ).group_by(Question.part).all()

    speed_by_part = {part_num: round(avg_val, 1) for part_num, avg_val in speed_rows if avg_val is not None}
    part_speeds = {
        "part5_avg_sec": speed_by_part.get(5, 0.0),
        "part6_avg_sec": speed_by_part.get(6, 0.0),
        "part7_avg_sec": speed_by_part.get(7, 0.0),
    }

    # 6. Accuracy Progress by Part (Part 5, Part 6, Part 7, Listening) — consolidated query
    part_attempt_rows = db.query(
        Question.part,
        func.count(PracticeAttempt.id).label("total_attempts"),
        func.sum(case((PracticeAttempt.is_correct == True, 1), else_=0)).label("correct_attempts")
    ).join(
        Question, PracticeAttempt.question_id == Question.id
    ).group_by(Question.part).all()

    part_map = {
        row[0]: {
            "total": row[1] or 0,
            "correct": row[2] or 0,
            "accuracy": round(((row[2] or 0) / row[1] * 100), 1) if row[1] > 0 else 0.0
        }
        for row in part_attempt_rows
    }

    # Also include vocab attempts for Part 1-4
    vocab_listening_subquery = db.query(Vocabulary.id).filter(
        Vocabulary.appears_in_part.in_(["Part 1", "Part 2", "Part 3", "Part 4"])
    ).subquery()
    listening_vocab_stats = db.query(
        func.count(PracticeAttempt.id).label("total_attempts"),
        func.sum(case((PracticeAttempt.is_correct == True, 1), else_=0)).label("correct_attempts")
    ).filter(PracticeAttempt.vocabulary_id.in_(vocab_listening_subquery)).first()

    listening_total = listening_vocab_stats[0] or 0 if listening_vocab_stats else 0
    listening_correct = listening_vocab_stats[1] or 0 if listening_vocab_stats else 0
    listening_acc = round((listening_correct / listening_total * 100), 1) if listening_total > 0 else 0.0

    part_stats = [
        {"part_name": "Part 5", "total_attempts": part_map.get(5, {}).get("total", 0), "accuracy_rate": part_map.get(5, {}).get("accuracy", 0.0)},
        {"part_name": "Part 6", "total_attempts": part_map.get(6, {}).get("total", 0), "accuracy_rate": part_map.get(6, {}).get("accuracy", 0.0)},
        {"part_name": "Part 7", "total_attempts": part_map.get(7, {}).get("total", 0), "accuracy_rate": part_map.get(7, {}).get("accuracy", 0.0)},
        {"part_name": "Part 1-4", "total_attempts": listening_total, "accuracy_rate": listening_acc},
    ]

    # 7. Progress by Topic Album (topic_category)
    topic_albums_raw = db.query(
        Vocabulary.topic_category,
        func.count(Vocabulary.id).label("total_words"),
        func.sum(case((Flashcard.srs_level >= 3, 1), else_=0)).label("learned_words")
    ).outerjoin(Flashcard, Vocabulary.id == Flashcard.vocabulary_id).group_by(Vocabulary.topic_category).all()

    topic_progress = []
    for topic_category, total_words, learned_words in topic_albums_raw:
        if topic_category:
            learned_words_val = learned_words or 0
            topic_progress.append({
                "topic_category": topic_category,
                "total_words": total_words,
                "learned_words": learned_words_val,
                "mastery_rate": round((learned_words_val / total_words * 100), 1) if total_words > 0 else 0.0
            })

    # 8. Grammar Topic Accuracy (Part 5/6)
    grammar_raw = db.query(
        Question.grammar_topic,
        func.count(PracticeAttempt.id).label("total_att"),
        func.sum(case((PracticeAttempt.is_correct == True, 1), else_=0)).label("correct_att")
    ).join(PracticeAttempt, Question.id == PracticeAttempt.question_id).group_by(Question.grammar_topic).all()

    grammar_stats = []
    for grammar_topic, total_grammar_attempts, correct_grammar_attempts in grammar_raw:
        if grammar_topic:
            correct_val = correct_grammar_attempts or 0
            grammar_stats.append({
                "grammar_topic": grammar_topic,
                "total_attempts": total_grammar_attempts,
                "accuracy_rate": round((correct_val / total_grammar_attempts * 100), 1) if total_grammar_attempts > 0 else 0.0
            })

    # 9. Daily Activity History (Last 14 days)
    fourteen_days_ago = now - timedelta(days=14)
    daily_raw = db.query(
        func.date(PracticeAttempt.attempted_at).label("attempt_date"),
        func.count(PracticeAttempt.id).label("count")
    ).filter(PracticeAttempt.attempted_at >= fourteen_days_ago).group_by(func.date(PracticeAttempt.attempted_at)).all()

    daily_history = [{"date": str(attempt_date), "attempts": attempt_count} for attempt_date, attempt_count in daily_raw]

    # 10. Module 18, 19, 36, 37: Estimated Score Range & Target Gap & 5-Step Daily Plan
    recent_exams = db.query(ExamAttempt).order_by(ExamAttempt.completed_at.desc()).limit(5).all()
    if recent_exams:
        exam_scores = [attempt.toeic_score for attempt in recent_exams]
        avg_exam = sum(exam_scores) / len(exam_scores)
        min_est = max(5, int(round(avg_exam - 25)))
        max_est = min(495, int(round(avg_exam + 25)))
        mid_est = int(round(avg_exam))
        confidence = "High (Độ tin cậy cao)" if len(recent_exams) >= 3 else "Medium (Độ tin cậy trung bình)"
    elif total_attempts > 20:
        # Estimate from practice accuracy scaled to 5-495
        base_score = int(50 + (overall_accuracy / 100.0) * 400)
        min_est = max(5, base_score - 35)
        max_est = min(495, base_score + 35)
        mid_est = base_score
        confidence = "Preliminary (Dựa trên luyện tập)"
    else:
        min_est = 250
        max_est = 320
        mid_est = 285
        confidence = "Initial (Cần làm bài thi thử)"

    target_score = 420  # RC Target default (tương đương 800+ overall)
    score_gap = max(0, target_score - mid_est)
    target_progress_pct = min(100, round((mid_est / target_score) * 100, 1))

    # Identify Primary Weaknesses
    sorted_weak_grammar = sorted(
        [g for g in grammar_stats if g["total_attempts"] >= 3],
        key=lambda x: x["accuracy_rate"]
    )
    primary_weakness_topics = [g["grammar_topic"] for g in sorted_weak_grammar[:3]]
    if not primary_weakness_topics:
        primary_weakness_topics = ["Word Form (Từ loại)", "Prepositions (Giới từ)", "Part 7 Inference (Suy luận)"]

    weakest_focus = primary_weakness_topics[0]

    # Today's 5-Step Adaptive Action Plan (Section XIX)
    today_adaptive_plan = [
        {
            "step": 1,
            "title": "Ôn lại lỗi sai",
            "description": f"Giải quyết các câu sai gần đây trong Sổ tay lỗi sai",
            "target_time": "10 phút",
            "action_tab": "errors",
            "badge": "Ưu tiên cao"
        },
        {
            "step": 2,
            "title": f"Học chủ điểm: {weakest_focus}",
            "description": "Xem tóm tắt lý thuyết, bẫy thường gặp và ví dụ thực tế",
            "target_time": "15 phút",
            "action_tab": "roadmap",
            "badge": "Lý thuyết"
        },
        {
            "step": 3,
            "title": f"Luyện tập Part 5 ({weakest_focus})",
            "description": "Luyện 10 câu áp dụng chế độ Guided Mode có hướng dẫn từng bước",
            "target_time": "10 phút",
            "action_tab": "practice",
            "badge": "Thực hành"
        },
        {
            "step": 4,
            "title": "Luyện đọc hiểu Part 7",
            "description": "Rèn luyện kỹ năng định vị thông tin và tránh bẫy suy luận",
            "target_time": "15 phút",
            "action_tab": "practice",
            "badge": "Đọc hiểu"
        },
        {
            "step": 5,
            "title": "Luyện tốc độ (Speed Sprint)",
            "description": "Part 5 Sprint: 10 câu trong 3 phút để tự động hóa phản xạ",
            "target_time": "5 phút",
            "action_tab": "speed",
            "badge": "Tốc độ"
        }
    ]

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
            "part7_avg_speed_sec": part_speeds["part7_avg_speed_sec"],
            "estimated_rc_range": {
                "min_score": min_est,
                "max_score": max_est,
                "mid_score": mid_est,
                "confidence": confidence
            },
            "target_tracker": {
                "target_score": target_score,
                "current_estimated": mid_est,
                "gap": score_gap,
                "progress_pct": target_progress_pct
            },
            "primary_weaknesses": primary_weakness_topics
        },
        "today_adaptive_plan": today_adaptive_plan,
        "part_stats": part_stats,
        "topic_progress": topic_progress,
        "grammar_stats": grammar_stats,
        "daily_history": daily_history
    }


def _matches_taxonomy(topic_str: str, skill_key: str, subskills: List[str]) -> bool:
    """Helper to check if a question grammar topic matches a taxonomy category."""
    norm = topic_str.lower().replace("_", " ").strip()
    skill_words = skill_key.lower().replace("_", " ").split()
    if any(w in norm for w in skill_words):
        return True
    for sub in subskills:
        sub_norm = sub.lower().replace("_", " ").replace("p5", "").replace("p6", "").replace("p7", "").strip()
        if sub_norm and (sub_norm in norm or norm in sub_norm):
            return True
    return False


@router.get("/coverage-matrix")
def get_coverage_matrix(db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Computes TOEIC RC Coverage Matrix and Mastery levels across Part 5, 6, 7 taxonomy (RC_Format.md Section 25-27).
    Accurately maps practice attempts to corresponding taxonomy categories.
    """
    from ..constants.taxonomy import PART5_TAXONOMY, PART6_TAXONOMY, PART7_TAXONOMY

    # Query all attempts by part and topic
    topic_attempts = db.query(
        Question.part,
        Question.grammar_topic,
        func.count(PracticeAttempt.id).label("total_att"),
        func.sum(case((PracticeAttempt.is_correct == True, 1), else_=0)).label("corr_att")
    ).join(PracticeAttempt, Question.id == PracticeAttempt.question_id).group_by(Question.part, Question.grammar_topic).all()

    stats_by_part: Dict[int, List[Dict[str, Any]]] = {5: [], 6: [], 7: []}
    for part_number, grammar_topic_name, total_attempts_cnt, correct_attempts_cnt in topic_attempts:
        if part_number in stats_by_part:
            stats_by_part[part_number].append({
                "topic": (grammar_topic_name or "").strip(),
                "total": total_attempts_cnt or 0,
                "correct": correct_attempts_cnt or 0
            })

    matrix_rows = []

    # 1. Part 5 Rows
    for skill_name, subskills in PART5_TAXONOMY.items():
        matched_items = [item for item in stats_by_part[5] if _matches_taxonomy(item["topic"], skill_name, subskills)]
        tot = sum(item["total"] for item in matched_items)
        corr = sum(item["correct"] for item in matched_items)
        acc = round((corr / tot * 100), 1) if tot > 0 else 0.0

        if tot >= 20 and acc >= 85:
            item_status = "MASTERED"
        elif tot >= 10 and acc >= 70:
            item_status = "PROFICIENT"
        elif tot > 0:
            item_status = "PRACTICING"
        else:
            item_status = "NOT_STARTED"

        matrix_rows.append({
            "part": 5,
            "skill": "Grammar" if skill_name != "VOCABULARY" else "Vocabulary",
            "subskill": skill_name.replace("_", " ").title(),
            "sample_patterns": ", ".join(subskills[:3]),
            "attempts": tot,
            "mastery_rate": acc if tot > 0 else 0.0,
            "status": item_status
        })

    # 2. Part 6 Rows
    for skill_name, subskills in PART6_TAXONOMY.items():
        matched_items = [item for item in stats_by_part[6] if _matches_taxonomy(item["topic"], skill_name, subskills)]
        tot = sum(item["total"] for item in matched_items)
        corr = sum(item["correct"] for item in matched_items)
        acc = round((corr / tot * 100), 1) if tot > 0 else 0.0

        if tot >= 15 and acc >= 80:
            item_status = "MASTERED"
        elif tot >= 8 and acc >= 65:
            item_status = "PROFICIENT"
        elif tot > 0:
            item_status = "PRACTICING"
        else:
            item_status = "NOT_STARTED"

        matrix_rows.append({
            "part": 6,
            "skill": "Context & Coherence" if skill_name in ["CONTEXT", "SENTENCE_INSERTION"] else "Grammar/Vocab",
            "subskill": skill_name.replace("_", " ").title(),
            "sample_patterns": ", ".join(subskills[:3]),
            "attempts": tot,
            "mastery_rate": acc if tot > 0 else 0.0,
            "status": item_status
        })

    # 3. Part 7 Rows
    for skill_name, subskills in PART7_TAXONOMY.items():
        matched_items = [item for item in stats_by_part[7] if _matches_taxonomy(item["topic"], skill_name, subskills)]
        tot = sum(item["total"] for item in matched_items)
        corr = sum(item["correct"] for item in matched_items)
        acc = round((corr / tot * 100), 1) if tot > 0 else 0.0

        if tot >= 20 and acc >= 80:
            item_status = "MASTERED"
        elif tot >= 10 and acc >= 65:
            item_status = "PROFICIENT"
        elif tot > 0:
            item_status = "PRACTICING"
        else:
            item_status = "NOT_STARTED"

        matrix_rows.append({
            "part": 7,
            "skill": "Reading Comprehension",
            "subskill": skill_name.replace("_", " ").title(),
            "sample_patterns": ", ".join(subskills[:3]),
            "attempts": tot,
            "mastery_rate": acc if tot > 0 else 0.0,
            "status": item_status
        })

    covered_count = sum(1 for row in matrix_rows if row["status"] in ["PROFICIENT", "MASTERED"])
    overall_coverage_pct = round((covered_count / len(matrix_rows) * 100), 1) if matrix_rows else 0.0

    return {
        "status": "success",
        "total_categories": len(matrix_rows),
        "covered_categories": covered_count,
        "overall_coverage_pct": overall_coverage_pct,
        "rows": matrix_rows
    }
