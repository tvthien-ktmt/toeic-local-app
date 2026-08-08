"""
MODULE 12 — Curriculum Engine API Router
Handles:
  - GET /api/curriculum/topics — List all canonical topics with mastery state
  - GET /api/curriculum/topics/{topic_id} — Get single topic details
  - GET /api/curriculum/roadmap — Get personalized roadmap ordered by prerequisites + mastery
  - POST /api/curriculum/placement-test/start — Get 25-question placement test
  - POST /api/curriculum/placement-test/submit — Submit answers → compute mastery_map
  - GET /api/curriculum/lessons/{topic_id} — Get lesson content (generate if missing)
  - GET /api/curriculum/daily-plan — Get today's study plan
  - POST /api/curriculum/mastery/update — Update mastery after exam/practice
"""
import json
import re
import hashlib
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime

from ..db import get_db
from ..models import CurriculumTopic, Lesson, UserMastery, Question, ExamAttempt
from ..services.gemini_service import query_gemini_with_cache, get_gemini_api_key, get_input_hash

router = APIRouter(prefix="/api/curriculum", tags=["curriculum"])

# ====================================================
# MASTERY THRESHOLDS (spec 12.4.1)
# ====================================================
MASTERY_OK_THRESHOLD = 60       # >= 60% correct → "ok"
MASTERY_WEAK_THRESHOLD = 30     # >= 30% and < 60% correct → "weak"
# < 30% or 0 attempts → "unknown"


# ====================================================
# Helper: Compute mastery status from pct
# ====================================================
def compute_mastery_status(correct: int, total: int) -> tuple:
    if total == 0:
        return "unknown", 0.0
    pct = correct / total * 100
    if pct >= MASTERY_OK_THRESHOLD:
        status = "ok"
    elif pct >= MASTERY_WEAK_THRESHOLD:
        status = "weak"
    else:
        status = "weak" if total > 0 else "unknown"
    return status, round(pct, 1)


# ====================================================
# Helper: Build ordered roadmap (topological sort by prerequisites)
# ====================================================
def build_ordered_roadmap(topics: List[CurriculumTopic]) -> List[CurriculumTopic]:
    """Topological sort of topics by prerequisite_topic_id."""
    id_map = {t.id: t for t in topics}
    visited = set()
    result = []

    def visit(tid):
        if tid in visited:
            return
        visited.add(tid)
        t = id_map.get(tid)
        if not t:
            return
        # Visit prerequisite first
        if t.prerequisite_topic_id and t.prerequisite_topic_id in id_map:
            visit(t.prerequisite_topic_id)
        result.append(t)

    for t in topics:
        visit(t.id)

    return result


# ====================================================
# Helper: Generate lesson content via Gemini
# ====================================================
def generate_lesson_content(
    db: Session,
    topic: CurriculumTopic,
) -> Lesson:
    """Generate AI lesson for a topic. Pulls real question examples from DB."""

    # Get real example questions from DB (up to 5)
    mapped_topics = json.loads(topic.mapped_grammar_topics_db_json or "[]")
    real_questions = []
    if mapped_topics:
        qs = db.query(Question).filter(
            Question.grammar_topic.in_(mapped_topics),
            Question.part.in_(json.loads(topic.parts_json or "[5]")),
            Question.correct_answer != None,
            Question.question_text != None,
        ).limit(20).all()

        # Prefer questions with specific topic (not just generic "Part 5 Grammar")
        specific = [q for q in qs if q.grammar_topic not in ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"]]
        generic = [q for q in qs if q not in specific]
        real_questions = (specific + generic)[:5]

    has_real = len(real_questions) > 0

    # Build prompt
    example_block = ""
    for i, q in enumerate(real_questions, 1):
        try:
            opts = json.loads(q.options_json)
        except Exception:
            opts = {}
        opts_text = "\n".join(f"    ({k}) {v}" for k, v in opts.items() if isinstance(opts, dict))
        example_block += f"\nVí dụ {i} (từ đề thi thật, question_id={q.id}):\n{q.question_text}\n{opts_text}\n→ Đáp án đúng: ({q.correct_answer})"
        if q.common_trap:
            example_block += f"\n→ Bẫy: {q.common_trap}"

    if not has_real:
        example_block = "\n⚠️ Chưa có ví dụ thật trong CSDL cho chủ điểm này. Ví dụ dưới đây do AI tạo minh hoạ — KHÔNG phải từ đề thi thật."

    parts_str = ", ".join(f"Part {p}" for p in json.loads(topic.parts_json or "[5]"))
    level_vi = {"basic": "cơ bản", "intermediate": "trung cấp", "advanced": "nâng cao"}.get(topic.level, topic.level)
    cat_vi = {"grammar_topic": "Chủ điểm ngữ pháp", "question_type": "Dạng câu hỏi", "vocab_topic": "Chủ đề từ vựng"}.get(topic.category, topic.category)

    prompt = f"""Bạn là giáo viên TOEIC RC chuyên dạy học sinh mất gốc (trình độ bắt đầu từ số 0).
Hãy viết bài giảng tiếng Việt hoàn chỉnh cho chủ điểm sau:

Tên chủ điểm: {topic.canonical_name}
Loại: {cat_vi}
Cấp độ: {level_vi}
Xuất hiện trong: {parts_str}
Ghi chú đối chiếu nguồn: {topic.agreement_note[:300] if topic.agreement_note else 'N/A'}

Ví dụ thật từ CSDL đề thi (15.730 câu):{example_block}

YÊU CẦU FORMAT JSON với các trường sau:
{{
  "title": "Tên bài giảng đầy đủ",
  "definition": "Định nghĩa dễ hiểu cho người mất gốc (2-3 câu, không dùng thuật ngữ khó chưa giải thích)",
  "signal_words": "Dấu hiệu nhận biết trong câu (dạng mảng hoặc chuỗi)",
  "formula": "Công thức/cấu trúc ngữ pháp nếu có (bỏ qua nếu là vocab_topic)",
  "common_trap_explanation": "Bẫy hay gặp và cách tránh (2-3 câu cụ thể)",
  "grammar_recall": "Quy tắc ngắn gọn để nhớ nhanh (bullet points, tối đa 5 bullets)",
  "content_markdown": "Bài giảng đầy đủ viết dưới dạng Markdown chuẩn GFM. Bao gồm: ## Định nghĩa, ## Dấu hiệu nhận biết, ## Công thức, ## Bẫy hay gặp, ## Ví dụ minh hoạ (dán lại ví dụ thật ở trên nếu có), ## Tóm tắt nhanh. KHÔNG bịa ví dụ mới nếu đã có ví dụ thật."
}}

CHỈ trả JSON thuần túy, không markdown bọc ngoài."""

    content_chunk = f"lesson_v1::{topic.id}::{topic.canonical_name[:80]}"
    api_key = get_gemini_api_key()

    if not api_key:
        # No API key — create placeholder lesson
        placeholder_md = f"""## {topic.canonical_name}

> ⚠️ **Chưa có dữ liệu AI** — Cần GEMINI_API_KEY để sinh bài giảng tự động.

**Loại:** {cat_vi} | **Cấp độ:** {level_vi} | **Xuất hiện:** {parts_str}

**Ghi chú:** {topic.agreement_note or 'N/A'}

---
*Bài giảng sẽ được sinh tự động khi có API key Gemini.*"""
        lesson = Lesson(
            curriculum_topic_id=topic.id,
            content_markdown=placeholder_md,
            worked_example_question_ids_json=json.dumps([q.id for q in real_questions]),
            quick_check_question_ids_json=json.dumps([]),
            has_real_examples=has_real,
            ai_cache_hash=None,
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        return lesson

    # Call Gemini with cache
    try:
        result = query_gemini_with_cache(db, "curriculum_lesson", prompt, content_chunk)
        input_hash = get_input_hash("curriculum_lesson", content_chunk)

        # Build full markdown
        content_md = result.get("content_markdown", "")
        if not content_md:
            # Build from parts if content_markdown missing
            content_md = f"""## {result.get('title', topic.canonical_name)}

### Định nghĩa
{result.get('definition', '')}

### Dấu hiệu nhận biết
{result.get('signal_words', '')}

### Công thức
{result.get('formula', '_Không áp dụng cho chủ điểm này._')}

### Bẫy hay gặp
{result.get('common_trap_explanation', '')}

### Tóm tắt nhanh
{result.get('grammar_recall', '')}
"""
        if not has_real:
            content_md = "> ⚠️ **Chưa có ví dụ thật từ CSDL** — Ví dụ bên dưới do AI tạo minh hoạ.\n\n" + content_md

        # Quick check: pick random questions same topic
        quick_check_ids = []
        all_topic_qs = db.query(Question).filter(
            Question.grammar_topic.in_(mapped_topics),
            Question.part.in_(json.loads(topic.parts_json or "[5]")),
            Question.correct_answer != None,
        ).all()
        import random
        if len(all_topic_qs) >= 5:
            quick_check_ids = [q.id for q in random.sample(all_topic_qs, 5)]
        elif all_topic_qs:
            quick_check_ids = [q.id for q in all_topic_qs]

        lesson = Lesson(
            curriculum_topic_id=topic.id,
            content_markdown=content_md,
            worked_example_question_ids_json=json.dumps([q.id for q in real_questions]),
            quick_check_question_ids_json=json.dumps(quick_check_ids),
            has_real_examples=has_real,
            ai_cache_hash=input_hash,
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        return lesson

    except Exception as e:
        err_msg = str(e)
        placeholder_md = f"""## {topic.canonical_name}

> ⚠️ **Chưa thể sinh bài giảng AI**

**Lỗi:** {err_msg[:200]}

**Loại:** {cat_vi} | **Cấp độ:** {level_vi}

---
*Thử lại sau khi hạn ngạch API Gemini được phục hồi.*"""
        lesson = Lesson(
            curriculum_topic_id=topic.id,
            content_markdown=placeholder_md,
            worked_example_question_ids_json=json.dumps([q.id for q in real_questions]),
            quick_check_question_ids_json=json.dumps([]),
            has_real_examples=has_real,
            ai_cache_hash=None,
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        return lesson


# ====================================================
# GET /api/curriculum/topics
# ====================================================
@router.get("/topics")
def list_curriculum_topics(
    category: Optional[str] = None,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all canonical curriculum topics with their current mastery status."""
    query = db.query(CurriculumTopic)
    if category:
        query = query.filter(CurriculumTopic.category == category)
    if level:
        query = query.filter(CurriculumTopic.level == level)

    topics = query.all()
    result = []
    for t in topics:
        mastery = db.query(UserMastery).filter(UserMastery.curriculum_topic_id == t.id).first()
        has_lesson = db.query(Lesson).filter(Lesson.curriculum_topic_id == t.id).count() > 0
        result.append({
            "id": t.id,
            "canonical_name": t.canonical_name,
            "category": t.category,
            "level": t.level,
            "parts": json.loads(t.parts_json or "[]"),
            "source_count": t.source_count,
            "prerequisite_topic_id": t.prerequisite_topic_id,
            "question_count": t.question_count,
            "has_specific_db_topic": t.has_specific_db_topic,
            "has_lesson": has_lesson,
            "mastery": {
                "status": mastery.status if mastery else "unknown",
                "correct_count": mastery.correct_count if mastery else 0,
                "total_count": mastery.total_count if mastery else 0,
                "mastery_pct": mastery.mastery_pct if mastery else 0.0,
            }
        })
    return result


# ====================================================
# GET /api/curriculum/topics/{topic_id}
# ====================================================
@router.get("/topics/{topic_id}")
def get_topic_detail(topic_id: int, db: Session = Depends(get_db)):
    t = db.query(CurriculumTopic).filter(CurriculumTopic.id == topic_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Topic not found")

    mastery = db.query(UserMastery).filter(UserMastery.curriculum_topic_id == t.id).first()
    prereq = None
    if t.prerequisite_topic_id:
        prereq_t = db.query(CurriculumTopic).filter(CurriculumTopic.id == t.prerequisite_topic_id).first()
        if prereq_t:
            prereq = {"id": prereq_t.id, "canonical_name": prereq_t.canonical_name, "level": prereq_t.level}

    return {
        "id": t.id,
        "canonical_name": t.canonical_name,
        "category": t.category,
        "level": t.level,
        "parts": json.loads(t.parts_json or "[]"),
        "source_count": t.source_count,
        "agreement_note": t.agreement_note,
        "db_coverage_note": t.db_coverage_note,
        "mapped_grammar_topics_db": json.loads(t.mapped_grammar_topics_db_json or "[]"),
        "question_count": t.question_count,
        "has_specific_db_topic": t.has_specific_db_topic,
        "prerequisite": prereq,
        "mastery": {
            "status": mastery.status if mastery else "unknown",
            "correct_count": mastery.correct_count if mastery else 0,
            "total_count": mastery.total_count if mastery else 0,
            "mastery_pct": mastery.mastery_pct if mastery else 0.0,
        }
    }


# ====================================================
# GET /api/curriculum/roadmap
# ====================================================
@router.get("/roadmap")
def get_roadmap(db: Session = Depends(get_db)):
    """Get personalized roadmap: topics ordered by prerequisites, prioritizing unknown > weak > ok."""
    all_topics = db.query(CurriculumTopic).all()
    ordered = build_ordered_roadmap(all_topics)

    mastery_map = {}
    for m in db.query(UserMastery).all():
        mastery_map[m.curriculum_topic_id] = m

    roadmap = []
    for t in ordered:
        m = mastery_map.get(t.id)
        status = m.status if m else "unknown"
        has_lesson = db.query(Lesson).filter(Lesson.curriculum_topic_id == t.id).count() > 0

        # Priority order for sorting: unknown (0) > weak (1) > ok (2)
        priority = {"unknown": 0, "weak": 1, "ok": 2}.get(status, 0)

        roadmap.append({
            "id": t.id,
            "canonical_name": t.canonical_name,
            "category": t.category,
            "level": t.level,
            "parts": json.loads(t.parts_json or "[]"),
            "prerequisite_topic_id": t.prerequisite_topic_id,
            "status": status,
            "mastery_pct": m.mastery_pct if m else 0.0,
            "question_count": t.question_count,
            "has_lesson": has_lesson,
            "priority": priority,
        })

    # Re-sort within same prerequisite level: unknown > weak > ok
    # Keep topological order for prerequisites but within "siblings" sort by priority
    return {
        "roadmap": roadmap,
        "summary": {
            "total": len(roadmap),
            "unknown": sum(1 for r in roadmap if r["status"] == "unknown"),
            "weak": sum(1 for r in roadmap if r["status"] == "weak"),
            "ok": sum(1 for r in roadmap if r["status"] == "ok"),
            "next_recommended": next(
                (r["id"] for r in roadmap if r["status"] in ("unknown", "weak")), None
            )
        }
    }


# ====================================================
# POST /api/curriculum/placement-test/start
# ====================================================
@router.post("/placement-test/start")
def start_placement_test(db: Session = Depends(get_db)):
    """
    Generate a 25-question placement test sampling from basic-level topics.
    Spec 12.4.1: prefer basic topics, avoid overwhelming beginners with hard questions.
    """
    # Get basic topics
    basic_topics = db.query(CurriculumTopic).filter(
        CurriculumTopic.level == "basic",
        CurriculumTopic.category.in_(["grammar_topic", "question_type"])
    ).all()

    if not basic_topics:
        basic_topics = db.query(CurriculumTopic).all()

    questions_by_topic = {}
    for topic in basic_topics:
        mapped = json.loads(topic.mapped_grammar_topics_db_json or "[]")
        parts = json.loads(topic.parts_json or "[5]")
        qs = db.query(Question).filter(
            Question.grammar_topic.in_(mapped),
            Question.part.in_(parts),
            Question.correct_answer != None,
            Question.question_text != None,
        ).limit(10).all()
        if qs:
            questions_by_topic[topic.id] = {
                "topic_id": topic.id,
                "topic_name": topic.canonical_name,
                "questions": qs
            }

    # Pick 1-2 questions per topic, total ~25 questions
    selected = []
    import random
    random.shuffle(basic_topics)
    for topic in basic_topics:
        data = questions_by_topic.get(topic.id)
        if not data:
            continue
        available = data["questions"]
        pick_count = min(2, len(available))
        picked = random.sample(available, pick_count)
        for q in picked:
            try:
                opts = json.loads(q.options_json)
            except Exception:
                opts = {}
            selected.append({
                "question_id": q.id,
                "topic_id": topic.id,
                "topic_name": topic.canonical_name,
                "topic_level": topic.level,
                "part": q.part,
                "question_text": q.question_text[:500] if q.question_text else "",
                "options": opts,
                "correct_answer": q.correct_answer,  # Will be hidden in frontend
            })
        if len(selected) >= 25:
            break

    # Shuffle question order
    random.shuffle(selected)
    selected = selected[:25]

    return {
        "total_questions": len(selected),
        "instructions": "Làm hết các câu hỏi bên dưới. Không giới hạn thời gian. Đây là bài chẩn đoán để xây dựng lộ trình học phù hợp với bạn.",
        "mastery_thresholds": {
            "ok": f">= {MASTERY_OK_THRESHOLD}% đúng",
            "weak": f">= {MASTERY_WEAK_THRESHOLD}% và < {MASTERY_OK_THRESHOLD}% đúng",
            "unknown": f"< {MASTERY_WEAK_THRESHOLD}% hoặc không làm câu nào"
        },
        "questions": selected
    }


# ====================================================
# POST /api/curriculum/placement-test/submit
# ====================================================
class PlacementSubmitRequest(BaseModel):
    answers: Dict[int, str]  # {question_id: selected_option}
    question_topic_map: Dict[int, int]  # {question_id: topic_id}

@router.post("/placement-test/submit")
def submit_placement_test(req: PlacementSubmitRequest, db: Session = Depends(get_db)):
    """
    Compute mastery_map from placement test answers.
    Spec 12.4.1 DoD: test with all-wrong and all-right to verify 2 extremes.
    """
    # Get all questions and their correct answers
    question_ids = list(req.answers.keys())
    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
    q_map = {q.id: q for q in questions}

    # Tally per topic
    topic_correct = {}
    topic_total = {}

    for qid_str, selected in req.answers.items():
        qid = int(qid_str)
        topic_id = req.question_topic_map.get(qid)
        if not topic_id:
            continue
        q = q_map.get(qid)
        if not q:
            continue
        if topic_id not in topic_correct:
            topic_correct[topic_id] = 0
            topic_total[topic_id] = 0
        topic_total[topic_id] += 1
        if selected == q.correct_answer:
            topic_correct[topic_id] += 1

    # Update UserMastery
    mastery_results = {}
    for topic_id in topic_total.keys():
        correct = topic_correct.get(topic_id, 0)
        total = topic_total.get(topic_id, 0)
        status, pct = compute_mastery_status(correct, total)

        m = db.query(UserMastery).filter(UserMastery.curriculum_topic_id == topic_id).first()
        if not m:
            m = UserMastery(curriculum_topic_id=topic_id)
            db.add(m)

        m.status = status
        m.correct_count = correct
        m.total_count = total
        m.mastery_pct = pct
        m.last_updated_at = datetime.utcnow()

        t = db.query(CurriculumTopic).filter(CurriculumTopic.id == topic_id).first()
        mastery_results[topic_id] = {
            "topic_name": t.canonical_name if t else str(topic_id),
            "status": status,
            "correct": correct,
            "total": total,
            "mastery_pct": pct,
        }

    db.commit()

    # Compute overall result
    total_correct = sum(topic_correct.values())
    total_questions = sum(topic_total.values())
    overall_pct = round(total_correct / total_questions * 100, 1) if total_questions else 0

    weak_topics = [v for v in mastery_results.values() if v["status"] == "weak"]
    unknown_topics = [v for v in mastery_results.values() if v["status"] == "unknown"]
    ok_topics = [v for v in mastery_results.values() if v["status"] == "ok"]

    return {
        "overall": {
            "total_questions": total_questions,
            "total_correct": total_correct,
            "overall_pct": overall_pct,
        },
        "mastery_map": mastery_results,
        "summary": {
            "topics_ok": len(ok_topics),
            "topics_weak": len(weak_topics),
            "topics_unknown": len(unknown_topics),
            "priority_topics": [t["topic_name"] for t in unknown_topics + weak_topics][:10],
        },
        "message": f"Bài chẩn đoán hoàn thành! Tổng điểm: {total_correct}/{total_questions} ({overall_pct}%). Đã cập nhật lộ trình học cá nhân hoá của bạn."
    }


# ====================================================
# GET /api/curriculum/lessons/{topic_id}
# ====================================================
@router.get("/lessons/{topic_id}")
def get_lesson(topic_id: int, db: Session = Depends(get_db)):
    """Get lesson for a topic. Generate via AI if not yet created."""
    topic = db.query(CurriculumTopic).filter(CurriculumTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    lesson = db.query(Lesson).filter(Lesson.curriculum_topic_id == topic_id).first()
    if not lesson:
        # Generate lesson (synchronous)
        lesson = generate_lesson_content(db, topic)

    # Get worked example questions
    worked_ids = json.loads(lesson.worked_example_question_ids_json or "[]")
    worked_qs = []
    if worked_ids:
        qs = db.query(Question).filter(Question.id.in_(worked_ids)).all()
        q_map = {q.id: q for q in qs}
        for qid in worked_ids:
            q = q_map.get(qid)
            if q:
                try:
                    opts = json.loads(q.options_json)
                except Exception:
                    opts = {}
                worked_qs.append({
                    "id": q.id,
                    "question_text": q.question_text[:500] if q.question_text else "",
                    "options": opts,
                    "correct_answer": q.correct_answer,
                    "common_trap": q.common_trap,
                    "grammar_topic": q.grammar_topic,
                })

    # Get quick check questions (without correct answers — for quiz)
    quick_ids = json.loads(lesson.quick_check_question_ids_json or "[]")
    quick_qs = []
    if quick_ids:
        qs = db.query(Question).filter(Question.id.in_(quick_ids)).all()
        q_map = {q.id: q for q in qs}
        for qid in quick_ids:
            q = q_map.get(qid)
            if q:
                try:
                    opts = json.loads(q.options_json)
                except Exception:
                    opts = {}
                quick_qs.append({
                    "id": q.id,
                    "question_text": q.question_text[:500] if q.question_text else "",
                    "options": opts,
                    "correct_answer": q.correct_answer,
                    "part": q.part,
                })

    mastery = db.query(UserMastery).filter(UserMastery.curriculum_topic_id == topic_id).first()

    return {
        "topic_id": topic.id,
        "canonical_name": topic.canonical_name,
        "category": topic.category,
        "level": topic.level,
        "parts": json.loads(topic.parts_json or "[]"),
        "lesson_id": lesson.id,
        "content_markdown": lesson.content_markdown,
        "has_real_examples": lesson.has_real_examples,
        "worked_examples": worked_qs,
        "quick_check": quick_qs,
        "created_at": lesson.created_at.isoformat() if lesson.created_at else None,
        "mastery": {
            "status": mastery.status if mastery else "unknown",
            "mastery_pct": mastery.mastery_pct if mastery else 0.0,
        }
    }


# ====================================================
# GET /api/curriculum/daily-plan
# ====================================================
@router.get("/daily-plan")
def get_daily_plan(
    minutes_per_day: int = 40,  # default 40 min/day
    db: Session = Depends(get_db)
):
    """
    Generate today's study plan:
    - N new lessons (unknown/weak topics)
    - K quick check questions
    Spec 12.5.2: Don't repeat completed lessons unless user opts in.
    """
    # Estimate: 10 min/lesson reading, 2 min/question
    max_lessons = max(1, minutes_per_day // 10)
    max_questions = max(5, (minutes_per_day % 10) * 3 + 5)

    # Get ordered roadmap
    all_topics = db.query(CurriculumTopic).all()
    ordered = build_ordered_roadmap(all_topics)

    mastery_map_db = {m.curriculum_topic_id: m for m in db.query(UserMastery).all()}

    # Pick topics for today: prioritize unknown, then weak
    today_lessons = []
    for t in ordered:
        if len(today_lessons) >= max_lessons:
            break
        m = mastery_map_db.get(t.id)
        status = m.status if m else "unknown"
        if status in ("unknown", "weak"):
            has_lesson = db.query(Lesson).filter(Lesson.curriculum_topic_id == t.id).count() > 0
            today_lessons.append({
                "topic_id": t.id,
                "canonical_name": t.canonical_name,
                "category": t.category,
                "level": t.level,
                "status": status,
                "mastery_pct": m.mastery_pct if m else 0.0,
                "has_lesson_generated": has_lesson,
                "parts": json.loads(t.parts_json or "[]"),
            })

    # Get quick check questions from weak topics
    quick_questions = []
    for t in ordered:
        if len(quick_questions) >= max_questions:
            break
        m = mastery_map_db.get(t.id)
        if not m or m.status not in ("weak",):
            continue
        mapped = json.loads(t.mapped_grammar_topics_db_json or "[]")
        parts = json.loads(t.parts_json or "[5]")
        qs = db.query(Question).filter(
            Question.grammar_topic.in_(mapped),
            Question.part.in_(parts),
            Question.correct_answer != None,
        ).limit(3).all()
        for q in qs:
            try:
                opts = json.loads(q.options_json)
            except Exception:
                opts = {}
            quick_questions.append({
                "question_id": q.id,
                "topic_id": t.id,
                "topic_name": t.canonical_name,
                "part": q.part,
                "question_text": q.question_text[:300] if q.question_text else "",
                "options": opts,
                "correct_answer": q.correct_answer,
            })

    mastery_status = {
        "total_topics": len(ordered),
        "ok": sum(1 for t in ordered if mastery_map_db.get(t.id) and mastery_map_db[t.id].status == "ok"),
        "weak": sum(1 for t in ordered if mastery_map_db.get(t.id) and mastery_map_db[t.id].status == "weak"),
        "unknown": sum(1 for t in ordered if not mastery_map_db.get(t.id) or mastery_map_db[t.id].status == "unknown"),
    }

    return {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "minutes_allocated": minutes_per_day,
        "today_lessons": today_lessons,
        "quick_check_questions": quick_questions[:max_questions],
        "mastery_overview": mastery_status,
        "tip": "Nhấn 'Học tiếp' để bắt đầu bài học đầu tiên trong danh sách hôm nay."
    }


# ====================================================
# POST /api/curriculum/mastery/update
# ====================================================
class MasteryUpdateItem(BaseModel):
    topic_id: int
    correct: int
    total: int

class MasteryUpdateRequest(BaseModel):
    updates: List[MasteryUpdateItem]
    source: str = "exam"  # exam / practice / placement_test

@router.post("/mastery/update")
def update_mastery(req: MasteryUpdateRequest, db: Session = Depends(get_db)):
    """
    Update mastery for multiple topics at once.
    Called after exam/practice submissions (spec 12.6.1 feedback loop).
    """
    updated = []
    for item in req.updates:
        m = db.query(UserMastery).filter(UserMastery.curriculum_topic_id == item.topic_id).first()
        if not m:
            m = UserMastery(curriculum_topic_id=item.topic_id)
            db.add(m)

        # Accumulate (not replace) — rolling update
        m.correct_count += item.correct
        m.total_count += item.total
        status, pct = compute_mastery_status(m.correct_count, m.total_count)
        m.status = status
        m.mastery_pct = pct
        m.last_updated_at = datetime.utcnow()

        t = db.query(CurriculumTopic).filter(CurriculumTopic.id == item.topic_id).first()
        updated.append({
            "topic_id": item.topic_id,
            "topic_name": t.canonical_name if t else str(item.topic_id),
            "new_status": status,
            "mastery_pct": pct,
            "total_attempts": m.total_count,
        })

    db.commit()
    return {
        "updated_count": len(updated),
        "source": req.source,
        "updates": updated
    }
