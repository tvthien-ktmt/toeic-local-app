import os
import re
import json
import hashlib
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import Document, Question, Vocabulary

TEXTBOOK_ROOT_DIR = r"d:\TOIEC Web\textbook"

# Official ETS TOEIC RC Score Conversion Table (Raw score 0-100 -> Scaled score 5-495)
TOEIC_RC_SCORE_TABLE = {
    100: 495, 99: 495, 98: 495, 97: 490, 96: 490, 95: 485, 94: 480, 93: 475, 92: 470, 91: 465,
    90: 460, 89: 455, 88: 450, 87: 445, 86: 440, 85: 435, 84: 430, 83: 420, 82: 415, 81: 410,
    80: 405, 79: 400, 78: 395, 77: 390, 76: 385, 75: 380, 74: 375, 73: 370, 72: 365, 71: 360,
    70: 355, 69: 350, 68: 345, 67: 340, 66: 335, 65: 330, 64: 325, 63: 320, 62: 315, 61: 310,
    60: 305, 59: 300, 58: 295, 57: 290, 56: 285, 55: 280, 54: 275, 53: 270, 52: 265, 51: 260,
    50: 255, 49: 250, 48: 245, 47: 240, 46: 235, 45: 230, 44: 225, 43: 220, 42: 215, 41: 210,
    40: 205, 39: 200, 38: 195, 37: 190, 36: 185, 35: 180, 34: 175, 33: 170, 32: 165, 31: 160,
    30: 155, 29: 150, 28: 145, 27: 140, 26: 135, 25: 130, 24: 125, 23: 120, 22: 115, 21: 110,
    20: 105, 19: 100, 18: 95, 17: 90, 16: 85, 15: 80, 14: 75, 13: 70, 12: 65, 11: 60,
    10: 55, 9: 50, 8: 45, 7: 40, 6: 35, 5: 30, 4: 25, 3: 20, 2: 15, 1: 10, 0: 5
}

def calculate_toeic_rc_score(raw_correct_count: int) -> int:
    """Returns scaled TOEIC RC score (5 to 495) based on correct answers count (0 to 100)."""
    raw_correct_count = max(0, min(100, raw_correct_count))
    return TOEIC_RC_SCORE_TABLE.get(raw_correct_count, 5)


def parse_answer_file(ans_path: Optional[str]) -> Dict[int, Dict[int, str]]:
    """
    Parses answer key file. Returns dict: {test_num: {q_num: "A"|"B"|"C"|"D"}}
    """
    if not ans_path or not os.path.exists(ans_path):
        return {}
    
    try:
        with open(ans_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        test_blocks = re.split(r'(?i)\n(?=##?\s*Test\s*\d+)', text)
        answers_by_test = {}

        for block in test_blocks:
            m = re.search(r'(?i)Test\s*0*(\d+)', block)
            if not m:
                continue
            test_num = int(m.group(1))

            q_ans_matches = re.findall(r'\b(1[0-9]{2}|200)[\.\:]\s*\(?([A-Da-d])\)?', block)
            q_map = {}
            for q_num_str, ans_char in q_ans_matches:
                q_map[int(q_num_str)] = ans_char.upper()

            if q_map:
                answers_by_test[test_num] = q_map

        return answers_by_test
    except Exception as e:
        print(f"[TEXTBOOK SERVICE] Error parsing answer file {ans_path}: {e}")
        return {}


def extract_questions_from_test_text(test_content: str, answer_map: Dict[int, str]) -> List[Dict[str, Any]]:
    """
    Extracts individual questions (101..200) from markdown text.
    Classifies into Part 5 (101-130), Part 6 (131-146), Part 7 (147-200).
    """
    questions = []
    
    # Split text into question blocks based on line starting with question number e.g. "101." or "131."
    # Matches patterns like "\n101. " or "\n### 101. "
    q_blocks = re.split(r'(?m)^\s*(?:###?\s*)?(1[0-9]{2}|200)[\.\:]\s*', test_content)
    
    # q_blocks[0] is header/intro text before Q101
    for idx in range(1, len(q_blocks), 2):
        q_num = int(q_blocks[idx])
        q_body = q_blocks[idx + 1] if idx + 1 < len(q_blocks) else ""
        
        # Stop body at next header or major section if present
        q_body_clean = q_body.strip()
        
        # Extract options (A), (B), (C), (D) or A. B. C. D.
        # Find options text
        opts = []
        opt_matches = re.findall(r'(?:\([A-D]\)|[A-D]\.)\s*([^\n]+)', q_body_clean)
        if len(opt_matches) >= 4:
            opts = [f"A. {opt_matches[0].strip()}", f"B. {opt_matches[1].strip()}", f"C. {opt_matches[2].strip()}", f"D. {opt_matches[3].strip()}"]
        else:
            # Fallback regex for inline options
            lines = [l.strip() for l in q_body_clean.split("\n") if l.strip()]
            opt_lines = [l for l in lines if re.match(r'^[\(]?[A-D][\.\)]', l)]
            if len(opt_lines) >= 4:
                opts = opt_lines[:4]
            else:
                opts = ["A. Phương án A", "B. Phương án B", "C. Phương án C", "D. Phương án D"]

        # Clean question text (take text before first option)
        first_opt_m = re.search(r'(?:\([A-D]\)|[A-D]\.)', q_body_clean)
        if first_opt_m:
            q_txt = q_body_clean[:first_opt_m.start()].strip()
        else:
            q_txt = q_body_clean.split("\n")[0].strip()

        # Part determination
        if 101 <= q_num <= 130:
            part = 5
            g_topic = "Part 5 Grammar"
        elif 131 <= q_num <= 146:
            part = 6
            g_topic = "Part 6 Text Completion"
        else:
            part = 7
            g_topic = "Part 7 Reading Comprehension"

        corr_ans = answer_map.get(q_num, "A")

        questions.append({
            "q_num": q_num,
            "part": part,
            "question_text": f"{q_num}. {q_txt}",
            "options_json": json.dumps(opts, ensure_ascii=False),
            "correct_answer": corr_ans,
            "explanation": f"Đáp án đúng là ({corr_ans}). [MOCK EXPLANATION] Câu #{q_num} thuộc Part {part}.",
            "option_explanations_json": json.dumps({
                "A": "Phương án A",
                "B": "Phương án B",
                "C": "Phương án C",
                "D": "Phương án D"
            }, ensure_ascii=False),
            "translated_sentence": f"{q_num}. {q_txt}",
            "grammar_topic": g_topic,
            "topic_tag": f"Part {part}"
        })

    return questions


def ensure_db_schema(db: Session):
    """Ensures new columns and tables exist in SQLite DB without requiring manual migration."""
    from sqlalchemy import text
    columns_to_add = [
        ("documents", "is_builtin", "BOOLEAN DEFAULT 0"),
        ("documents", "category", "VARCHAR"),
        ("documents", "series", "VARCHAR"),
        ("documents", "test_number", "INTEGER")
    ]
    for tbl, col, col_type in columns_to_add:
        try:
            db.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_type}"))
            db.commit()
        except Exception:
            db.rollback()


def scan_and_seed_textbooks(db: Session) -> Dict[str, Any]:
    r"""
    Scans d:\TOIEC Web\textbook and seeds built-in exam documents + questions into SQLite DB.
    Guarantees built-in tests are ready on startup.
    """
    ensure_db_schema(db)
    if not os.path.exists(TEXTBOOK_ROOT_DIR):
        print(f"[TEXTBOOK SERVICE] Directory not found: {TEXTBOOK_ROOT_DIR}")
        return {"status": "error", "message": "Textbook directory missing"}

    seeded_count = 0
    updated_count = 0

    for root, dirs, files in os.walk(TEXTBOOK_ROOT_DIR):
        for f in files:
            f_lower = f.lower()
            if f.endswith(".md") and not any(k in f_lower for k in ["đáp án", "đáp_án", "dáp án", "dáp_án"]):
                md_path = os.path.join(root, f)
                ans_path = None
                for f2 in files:
                    f2_lower = f2.lower()
                    if f2.endswith(".md") and any(k in f2_lower for k in ["đáp án", "đáp_án", "dáp án", "dáp_án"]):
                        ans_path = os.path.join(root, f2)
                        break

                rel = os.path.relpath(md_path, TEXTBOOK_ROOT_DIR)
                parts = rel.split(os.sep)
                category = parts[0] if len(parts) > 1 else "ETS"
                series_name = os.path.splitext(f)[0]
                
                # Clean series_name (e.g. "ETS 2023 RC (2)" -> "ETS 2023 RC")
                series_name = re.sub(r'\s*\(\d+\)', '', series_name).strip()

                # Parse answer keys
                ans_by_test = parse_answer_file(ans_path)

                # Read MD file
                try:
                    with open(md_path, "r", encoding="utf-8", errors="ignore") as file:
                        text = file.read()
                except Exception as ex:
                    print(f"[TEXTBOOK SERVICE] Error reading {md_path}: {ex}")
                    continue

                # Split into tests
                test_splits = re.split(r'(?i)\n(?=#+\s*(?:RC\s*기출\s*|RC\s*|READING\s*)?TEST\s*0*\d+)', text)
                if len(test_splits) <= 1:
                    test_splits = [text]

                for t_idx, block in enumerate(test_splits, 1):
                    block_strip = block.strip()
                    if not block_strip:
                        continue

                    m = re.search(r'(?i)#+\s*(?:RC\s*기출\s*|RC\s*|READING\s*)?TEST\s*0*(\d+)', block_strip)
                    test_num = int(m.group(1)) if m else t_idx

                    filename = f"[{category}] {series_name} - Test {test_num:02d}"
                    content_hash = hashlib.sha256(f"{filename}::{block_strip[:500]}".encode("utf-8")).hexdigest()

                    # Check if document already exists
                    existing_doc = db.query(Document).filter(Document.content_hash == content_hash).first()
                    if not existing_doc:
                        existing_doc = db.query(Document).filter(Document.filename == filename).first()

                    if existing_doc:
                        # Ensure fields are up to date
                        existing_doc.is_builtin = True
                        existing_doc.category = category
                        existing_doc.series = series_name
                        existing_doc.test_number = test_num
                        existing_doc.status = "extracted"
                        db.commit()
                        updated_count += 1
                        continue

                    # Create new built-in Document
                    new_doc = Document(
                        filename=filename,
                        doc_type="RC_EXAM",
                        content_hash=content_hash,
                        markdown_content=block_strip,
                        status="extracted",
                        is_builtin=True,
                        category=category,
                        series=series_name,
                        test_number=test_num
                    )
                    db.add(new_doc)
                    db.commit()
                    db.refresh(new_doc)

                    # Extract questions for this test
                    t_ans_map = ans_by_test.get(test_num, {})
                    qs_data = extract_questions_from_test_text(block_strip, t_ans_map)

                    for q in qs_data:
                        new_q = Question(
                            document_id=new_doc.id,
                            part=q["part"],
                            question_text=q["question_text"],
                            options_json=q["options_json"],
                            correct_answer=q["correct_answer"],
                            explanation=q["explanation"],
                            option_explanations_json=q["option_explanations_json"],
                            translated_sentence=q["translated_sentence"],
                            grammar_topic=q["grammar_topic"],
                            topic_tag=q["topic_tag"],
                            is_generated=False
                        )
                        db.add(new_q)
                    
                    db.commit()
                    seeded_count += 1

    print(f"[TEXTBOOK SERVICE] Completed scan: {seeded_count} new tests seeded, {updated_count} tests updated.")
    return {
        "status": "success",
        "seeded_count": seeded_count,
        "updated_count": updated_count
    }
