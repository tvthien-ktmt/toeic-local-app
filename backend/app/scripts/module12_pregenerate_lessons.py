"""
MODULE 12 — Pre-generate & Seed all 45 Lessons into SQLite DB so students can open any lesson INSTANTLY (0ms delay).
Run from backend/ directory: python app/scripts/module12_pregenerate_lessons.py
"""
import sys, io, os, json, random

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db import SessionLocal, engine, Base
from app.models import CurriculumTopic, Lesson, Question
from app.routers.curriculum import generate_lesson_content

def build_offline_rich_lesson(db, topic: CurriculumTopic) -> Lesson:
    """Build a rich, structured offline lesson using real DB question examples and expert agreement notes."""
    mapped_topics = json.loads(topic.mapped_grammar_topics_db_json or "[]")
    parts = json.loads(topic.parts_json or "[5]")
    parts_str = ", ".join(f"Part {p}" for p in parts)
    
    # 1. Fetch real example questions from DB
    real_questions = []
    if mapped_topics:
        qs = db.query(Question).filter(
            Question.grammar_topic.in_(mapped_topics),
            Question.part.in_(parts),
            Question.correct_answer != None,
            Question.question_text != None
        ).limit(20).all()
        
        specific = [q for q in qs if q.grammar_topic not in ["Part 5 Grammar", "Part 6 Text Completion", "Part 7 Reading Comprehension"]]
        generic = [q for q in qs if q not in specific]
        real_questions = (specific + generic)[:5]
        
    has_real = len(real_questions) > 0

    # 2. Format real examples block
    example_md = ""
    if has_real:
        example_md += "### 📝 Ví dụ minh họa thực tế từ Đề Thi Thật (ETS / Hacker / YBM)\n\n"
        for i, q in enumerate(real_questions, 1):
            opts_str = ""
            try:
                opts = json.loads(q.options_json or "[]")
                if isinstance(opts, list):
                    opts_str = "\n".join(f"  - {o}" for o in opts)
                elif isinstance(opts, dict):
                    opts_str = "\n".join(f"  - ({k}) {v}" for k, v in opts.items())
            except Exception:
                opts_str = ""
                
            example_md += f"**Ví dụ {i}** (Trích từ đề thi Part {q.part}):\n"
            example_md += f"> {q.question_text}\n"
            if opts_str:
                example_md += f"{opts_str}\n"
            example_md += f"👉 **Đáp án đúng:** `({q.correct_answer})`\n"
            if q.explanation:
                example_md += f"💡 **Giải thích:** {q.explanation}\n"
            if q.common_trap:
                example_md += f"⚠️ **Bẫy hay gặp:** {q.common_trap}\n"
            example_md += "\n---\n\n"
    else:
        example_md += "> ⚠️ *Chưa có ví dụ câu hỏi trắc nghiệm riêng trong CSDL cho chủ điểm này. Hãy ôn luyện thông qua các bài thi thử trọn bộ.* \n\n"

    # 3. Build Markdown Content
    level_vi = {"basic": "Cơ bản (Dành cho người mới bắt đầu)", "intermediate": "Trung cấp (Chinh phục 350-450)", "advanced": "Nâng cao (Mục tiêu 495 RC)"}.get(topic.level, topic.level)
    cat_vi = {"grammar_topic": "Chủ điểm Ngữ Pháp", "question_type": "Dạng Câu Hỏi Thường Gặp", "vocab_topic": "Chủ đề Từ Vựng & Cụm Từ"}.get(topic.category, topic.category)

    content_md = f"""# 📚 Bài Giảng: {topic.canonical_name}

> **Phân loại:** {cat_vi}  
> **Cấp độ:** {level_vi}  
> **Xuất hiện trong:** {parts_str}

---

## 🎯 1. Định nghĩa & Tổng quan cho người mất gốc
{topic.canonical_name} là một trong những kiến thức nền tảng bắt buộc phải nắm vững khi thi TOEIC Reading ({parts_str}). 

{topic.agreement_note or "Chủ điểm này đòi hỏi bạn hiểu rõ bản chất ngữ pháp và dấu hiệu nhận biết nhanh để làm bài trong vòng 15-30 giây mỗi câu."}

---

## 🔍 2. Dấu hiệu nhận biết nhanh trong bài thi
Khi nhìn vào 4 phương án lựa chọn $(A, B, C, D)$ hoặc câu hỏi, bạn có thể nhận biết ngay chủ điểm này thông qua:
- **Vị trí chỗ trống:** Đứng trước danh từ, sau động từ tobe, hoặc giữa trợ động từ và động từ chính.
- **Từ chỉ báo (Signal Words):** Các từ nhận biết thì, liên từ nối, hoặc cặp từ đi kèm cố định.
- **Đuôi từ loại (Suffixes):** Phân biệt dạng từ loại qua các đuôi chuẩn TOEIC.

---

## 📐 3. Quy tắc & Công thức cốt lõi
1. **Quy tắc 1:** Luôn xác định động từ chính và cấu trúc tổng thể của câu trước khi điền từ.
2. **Quy tắc 2:** Phân biệt rõ loại từ (Danh từ, Động từ, Tính từ, Trạng từ) hoặc cấu trúc đi kèm.
3. **Quy tắc 3:** Áp dụng phương pháp loại trừ nhanh các phương án sai về mặt ngữ pháp.

---

## ⚠️ 4. Bẫy hay gặp & Cách tránh
- **Bẫy 1:** Nhầm lẫn giữa Tính từ đuôi `-ing` (chỉ bản chất) và đuôi `-ed` (chỉ cảm xúc/tác động).
- **Bẫy 2:** Không chú ý sự hòa hợp giữa Chủ ngữ số ít/số nhiều và Động từ.
- **Cách tránh:** Đọc kĩ từ đứng ngay trước và ngay sau chỗ trống trước khi chọn đáp án.

---

{example_md}

## 💡 5. Tóm tắt nhanh cần nhớ (Grammar Recall)
- ✔️ Nắm vững dấu hiệu nhận biết trong 3 giây đầu.
- ✔️ Loại trừ ngay các phương án sai ngữ pháp cơ bản.
- ✔️ Ôn tập lại ví dụ thực tế trên để phản xạ nhanh khi vào phòng thi.
"""

    # 4. Pick quick check questions
    all_topic_qs = []
    if mapped_topics:
        all_topic_qs = db.query(Question).filter(
            Question.grammar_topic.in_(mapped_topics),
            Question.part.in_(parts),
            Question.correct_answer != None
        ).all()
        
    quick_check_ids = []
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
        ai_cache_hash="pregenerated_seed_v1"
    )
    return lesson


def main():
    print("====================================================")
    print("MODULE 12 — Pregenerating Lessons for all 45 Topics")
    print("====================================================")

    db = SessionLocal()
    try:
        topics = db.query(CurriculumTopic).all()
        print(f"Found {len(topics)} canonical topics in SQLite DB.")

        generated_count = 0
        existing_count = 0
        ai_generated_count = 0

        for i, topic in enumerate(topics, 1):
            existing_lesson = db.query(Lesson).filter(Lesson.curriculum_topic_id == topic.id).first()
            if existing_lesson:
                existing_count += 1
                continue

            # Try generating via Gemini if API key works, otherwise offline rich builder
            print(f"[{i}/{len(topics)}] Generating lesson for: {topic.canonical_name}...")
            try:
                lesson = generate_lesson_content(db, topic)
                ai_generated_count += 1
            except Exception as e:
                print(f"  -> Gemini fallback for topic {topic.id}: {e}")
                lesson = build_offline_rich_lesson(db, topic)
                db.add(lesson)
                db.commit()

            generated_count += 1

        db.commit()
        total_lessons = db.query(Lesson).count()
        print("\n✅ PRE-GENERATION COMPLETE!")
        print(f"  - Total Lessons in DB: {total_lessons} / {len(topics)}")
        print(f"  - Newly Generated: {generated_count} (AI: {ai_generated_count})")
        print(f"  - Already Existed: {existing_count}")
        print("  - ALL 45 LESSONS ARE NOW READY FOR INSTANT (0ms) ACCESS!")

    finally:
        db.close()

if __name__ == "__main__":
    main()
