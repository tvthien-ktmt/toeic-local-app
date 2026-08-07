"""
Standalone offline ingestion script for built-in TOEIC Reading textbooks.
Uses known-sequence matching (101..200) and column sorting to cleanly parse
textbooks in d:\\TOIEC Web\\textbook without runtime lag or AI structure tokens.
"""
import os
import sys
import re
import json
import hashlib
from typing import List, Dict, Any, Tuple, Optional

# Add backend directory to sys.path
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_APP_DIR = os.path.abspath(os.path.join(_CURRENT_DIR, ".."))
_BACKEND_DIR = os.path.abspath(os.path.join(_APP_DIR, ".."))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault("DATABASE_URL", "sqlite:///./data/toeic.db")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Document, Question
from app.services.textbook_service import (
    TEXTBOOK_ROOT_DIR,
    parse_answer_file,
    _get_series_name,
    _is_answer_file,
    _find_answer_file,
    ensure_db_schema,
    _build_passage_map
)

# Known expected numbers for TOEIC RC
EXPECTED_Q_NUMBERS = range(101, 201)

# Option pattern — handles (A)/(B)/(C)/(D), A./B./C./D. formats, and bulleted options "- (A) text"
OPT_PATTERN = re.compile(
    r'(?:^|\n)\s*'
    r'(?:[\-\*\•]\s*)?'            # optional bullet prefix (- or * or •)
    r'(?:\*{1,2})?'                # optional bold start
    r'[\(]?([A-Da-d])[\)\.]'        # letter with paren or period
    r'(?:\*{1,2})?'                # optional bold end
    r'\s*(.+?)(?=\n|$)'
)

INLINE_OPT_PATTERN = re.compile(
    r'(?:[\-\*\•]\s*)?\(([A-D])\)\s*(.+?)(?=\s*(?:[\-\*\•]\s*)?\([A-D]\)|$)',
    re.IGNORECASE
)


def clean_ocr_text_artifacts(text: str) -> str:
    """Normalizes common OCR artifacts (e.g. '(8)' -> '(B)')."""
    # Normalize '(8)' option marker to '(B)'
    text = re.sub(r'\(8\)', '(B)', text)
    text = re.sub(r'\b8\.\s+', 'B. ', text)
    return text


def extract_options_from_body(q_body: str) -> Dict[str, str]:
    """Extract A/B/C/D options handling multi-line and inline formats."""
    q_body = clean_ocr_text_artifacts(q_body)
    opt_by_letter: Dict[str, str] = {}

    # 1. Inline format check
    for line in q_body.splitlines():
        inline_matches = list(INLINE_OPT_PATTERN.finditer(line))
        if len(inline_matches) >= 2:
            for m in inline_matches:
                letter = m.group(1).upper()
                text_val = re.sub(r'\*{1,2}', '', m.group(2)).strip()
                if letter in ('A', 'B', 'C', 'D') and letter not in opt_by_letter and text_val:
                    opt_by_letter[letter] = text_val
            if len(opt_by_letter) >= 4:
                break

    # 2. Multi-line pattern check if inline wasn't complete
    if len(opt_by_letter) < 2:
        for om in OPT_PATTERN.finditer(q_body):
            letter = om.group(1).upper()
            text_val = re.sub(r'\*{1,2}$', '', om.group(2)).strip()
            if letter not in opt_by_letter and letter in ('A', 'B', 'C', 'D') and text_val:
                opt_by_letter[letter] = text_val

    return opt_by_letter


def extract_test_by_known_sequence(
    test_content: str,
    answer_map: Dict[int, str]
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Parses a test block using literal expected numbers (101..200).
    Sorts questions by question number to resolve 2-column OCR mixing.
    
    Returns:
        questions: List of extracted question dictionaries.
        stats: Dictionary with statistics and parse_status.
    """
    test_content = clean_ocr_text_artifacts(test_content)
    passage_map = _build_passage_map(test_content)

    # Step 1: Find literal positions of expected question numbers
    # Format variations supported: "135.", "### 135.", "**135.**", "### **135.**", "[135]"
    positions: List[Tuple[int, int]] = []  # (q_num, match_start_pos)
    
    for n in EXPECTED_Q_NUMBERS:
        pattern = re.compile(r'(?:^|\s)(?:#+\s*)?\*{0,2}\[?' + str(n) + r'\]?[\.\_\:]?\*{0,2}[\.\_\:]?\s+')
        m = pattern.search(test_content)
        if m:
            positions.append((n, m.start()))

    # Sort positions by text start location to slice blocks correctly
    positions.sort(key=lambda x: x[1])

    questions = []
    seen_q_nums = set()
    inline_p6_markers = {}

    for idx, (q_num, pos) in enumerate(positions):
        pattern = re.compile(r'(?:^|\s)(?:#+\s*)?\*{0,2}\[?' + str(q_num) + r'\]?[\.\_\:]?\*{0,2}[\.\_\:]?\s+')
        heading_match = pattern.search(test_content[pos:])
        body_start = pos + heading_match.end() if heading_match else pos
        body_end = positions[idx + 1][1] if idx + 1 < len(positions) else len(test_content)

        q_body = test_content[body_start:body_end].strip()
        if len(q_body) > 3000:
            q_body = q_body[:3000]

        opt_by_letter = extract_options_from_body(q_body)
        has_options = len(opt_by_letter) >= 2

        # Special handling for ETS 2020 Pattern 3: Cluster of empty headers 115..120 followed by sequential blocks in q_body of 120
        if q_num == 120 and (116 not in [p[0] for p in positions] or 118 not in [p[0] for p in positions]):
            sub_blocks = re.split(r'\n(?=[A-Z0-9\-\'\s]+?\-\-\-\-\-\-\-)', q_body)
            if len(sub_blocks) >= 4:
                missing_cluster = [qn for qn in range(115, 121) if qn not in seen_q_nums]
                for c_idx, sub_b in enumerate(sub_blocks[:len(missing_cluster)]):
                    target_q = missing_cluster[c_idx]
                    sub_opts = extract_options_from_body(sub_b)
                    if len(sub_opts) >= 2:
                        s_opts = [f"{k}. {v}" for k, v in sorted(sub_opts.items())]
                        while len(s_opts) < 4:
                            s_opts.append(f"{['A','B','C','D'][len(s_opts)]}. —")
                        _s_match = OPT_PATTERN.search(sub_b)
                        s_stem = sub_b[:_s_match.start()].strip() if _s_match else sub_b
                        corr_ans = answer_map.get(target_q, "")
                        questions.append({
                            "q_num": target_q,
                            "part": 5,
                            "question_text": f"{target_q}. {s_stem}",
                            "options_json": json.dumps(s_opts, ensure_ascii=False),
                            "correct_answer": corr_ans,
                            "explanation": f"Đáp án đúng là ({corr_ans})." if corr_ans else "Chưa có đáp án.",
                            "option_explanations_json": json.dumps({"A": "—", "B": "—", "C": "—", "D": "—"}, ensure_ascii=False),
                            "translated_sentence": "",
                            "grammar_topic": "Part 5 Grammar",
                            "topic_tag": "Part 5"
                        })
                        seen_q_nums.add(target_q)

        if 131 <= q_num <= 146 and not has_options:
            if q_num not in seen_q_nums:
                inline_p6_markers[q_num] = True
            continue

        if q_num in seen_q_nums:
            continue

        seen_q_nums.add(q_num)
        inline_p6_markers.pop(q_num, None)

        if len(opt_by_letter) >= 4:
            opts = [
                f"A. {opt_by_letter.get('A', '')}",
                f"B. {opt_by_letter.get('B', '')}",
                f"C. {opt_by_letter.get('C', '')}",
                f"D. {opt_by_letter.get('D', '')}"
            ]
        elif len(opt_by_letter) >= 2:
            opts = [f"{k}. {v}" for k, v in sorted(opt_by_letter.items())]
            while len(opts) < 4:
                opts.append(f"{['A','B','C','D'][len(opts)]}. —")
        else:
            opts = ["A. —", "B. —", "C. —", "D. —"]

        _stem_match = OPT_PATTERN.search(q_body) or INLINE_OPT_PATTERN.search(q_body)
        q_stem = q_body[:_stem_match.start()].strip() if _stem_match else q_body
        q_stem = re.sub(r'\*{1,2}', '', q_stem).strip()
        if len(q_stem) > 2000:
            q_stem = q_stem[:2000] + "..."

        passage = passage_map.get(q_num, "")
        if passage:
            full_text = f"{passage}\n\n{q_stem}" if q_stem else passage
        else:
            full_text = q_stem

        if len(full_text) > 4000:
            full_text = full_text[:4000] + "..."

        if 101 <= q_num <= 130:
            part = 5
            g_topic = "Part 5 Grammar"
        elif 131 <= q_num <= 146:
            part = 6
            g_topic = "Part 6 Text Completion"
        else:
            part = 7
            g_topic = "Part 7 Reading Comprehension"

        corr_ans = answer_map.get(q_num, "")

        questions.append({
            "q_num": q_num,
            "part": part,
            "question_text": f"{q_num}. {full_text}" if full_text else f"{q_num}.",
            "options_json": json.dumps(opts, ensure_ascii=False),
            "correct_answer": corr_ans,
            "explanation": f"Đáp án đúng là ({corr_ans})." if corr_ans else "Chưa có đáp án.",
            "option_explanations_json": json.dumps(
                {"A": "—", "B": "—", "C": "—", "D": "—"}, ensure_ascii=False
            ),
            "translated_sentence": "",
            "grammar_topic": g_topic,
            "topic_tag": f"Part {part}"
        })

    # Part 6 inline marker stubs
    for q_num in sorted(inline_p6_markers.keys()):
        if q_num in seen_q_nums:
            continue
        passage = passage_map.get(q_num, "")
        corr_ans = answer_map.get(q_num, "")
        full_text = passage if passage else "[Câu hỏi điền từ - Xem đoạn văn]"
        questions.append({
            "q_num": q_num,
            "part": 6,
            "question_text": f"{q_num}. {full_text}",
            "options_json": json.dumps(["A. —", "B. —", "C. —", "D. —"], ensure_ascii=False),
            "correct_answer": corr_ans,
            "explanation": f"Đáp án đúng là ({corr_ans})." if corr_ans else "Chưa có đáp án (câu điền từ).",
            "option_explanations_json": json.dumps(
                {"A": "—", "B": "—", "C": "—", "D": "—"}, ensure_ascii=False
            ),
            "translated_sentence": "",
            "grammar_topic": "Part 6 Text Completion",
            "topic_tag": "Part 6"
        })

    # Sort final questions list strictly by q_num (resolves 2-column OCR mixing)
    questions.sort(key=lambda x: x["q_num"])

    total_parsed = len(questions)
    if total_parsed >= 100:
        status = "complete"
    elif total_parsed >= 80:
        status = "partial"
    else:
        status = "failed"

    return questions, {"parsed_count": total_parsed, "status": status}


def run_standalone_ingestion():
    """Executes offline textbook ingestion pipeline and prints execution report."""
    print("=" * 65)
    print("🚀 TOEIC LOCAL APP — BUILT-IN EXAM INGESTION PIPELINE")
    print("=" * 65)

    db_url = os.environ.get("DATABASE_URL", "sqlite:///./data/toeic.db")
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    ensure_db_schema(db)

    if not os.path.exists(TEXTBOOK_ROOT_DIR):
        print(f"❌ Error: Textbook root directory not found at: {TEXTBOOK_ROOT_DIR}")
        return

    total_tests_processed = 0
    complete_tests = 0
    partial_tests = 0
    failed_tests = 0
    test_summary = []

    for root, dirs, files in os.walk(TEXTBOOK_ROOT_DIR):
        for f in files:
            if not f.endswith(".md") or _is_answer_file(f):
                continue

            md_path = os.path.join(root, f)
            ans_path = _find_answer_file(root, files)
            rel_path = os.path.relpath(md_path, TEXTBOOK_ROOT_DIR)

            category = rel_path.split(os.sep)[0] if os.sep in rel_path else "OTHER"
            series_name = _get_series_name(os.path.splitext(f)[0])

            ans_by_test = parse_answer_file(ans_path)

            try:
                with open(md_path, "r", encoding="utf-8", errors="ignore") as file:
                    text = file.read()
            except Exception as ex:
                print(f"⚠️ Error reading {md_path}: {ex}")
                continue

            # Split text by Test headings or question resets
            from app.services.textbook_service import split_text_into_tests_by_q_reset
            test_blocks = split_text_into_tests_by_q_reset(text)

            if not test_blocks:
                continue

            for t_idx, (_, block) in enumerate(test_blocks, 1):
                test_num = t_idx
                heading_lines = re.findall(r'^(#+\s*.*)', block[:1000], re.MULTILINE)
                for hl in heading_lines:
                    hm = re.search(r'(?i)(?:TEST|test)\s*0*(\d+)', hl)
                    if hm:
                        p_num = int(hm.group(1))
                        if 1 <= p_num <= 20:
                            test_num = p_num
                            break

                t_ans_map = ans_by_test.get(test_num, {}) or ans_by_test.get(t_idx, {})
                filename = f"[{category}] {series_name} - Test {test_num:02d}"
                content_hash = hashlib.sha256(f"{filename}::{block[:1000]}".encode("utf-8")).hexdigest()

                # Extract questions using known sequence literal matching
                qs_data, stats = extract_test_by_known_sequence(block, t_ans_map)

                # Upsert Document into SQLite DB
                existing_doc = db.query(Document).filter(Document.filename == filename).first()
                if not existing_doc:
                    existing_doc = db.query(Document).filter(Document.content_hash == content_hash).first()

                if existing_doc:
                    existing_doc.is_builtin = True
                    existing_doc.category = category
                    existing_doc.series = series_name
                    existing_doc.test_number = test_num
                    existing_doc.markdown_content = block
                    existing_doc.content_hash = content_hash
                    existing_doc.status = "extracted"
                    db.query(Question).filter(Question.document_id == existing_doc.id).delete()
                    target_doc = existing_doc
                else:
                    target_doc = Document(
                        filename=filename,
                        doc_type="RC_EXAM",
                        content_hash=content_hash,
                        markdown_content=block,
                        status="extracted",
                        is_builtin=True,
                        category=category,
                        series=series_name,
                        test_number=test_num
                    )
                    db.add(target_doc)
                    db.commit()
                    db.refresh(target_doc)

                for q in qs_data:
                    new_q = Question(
                        document_id=target_doc.id,
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

                total_tests_processed += 1
                status = stats["status"]
                if status == "complete":
                    complete_tests += 1
                elif status == "partial":
                    partial_tests += 1
                else:
                    failed_tests += 1

                test_summary.append({
                    "filename": filename,
                    "parsed_count": stats["parsed_count"],
                    "status": status
                })

    db.close()

    print("\n" + "=" * 65)
    print("📊 INGESTION SUMMARY REPORT")
    print("=" * 65)
    print(f"Total Tests Processed : {total_tests_processed}")
    print(f"  ✅ Complete (100 qs) : {complete_tests}")
    print(f"  ⚠️ Partial (80-99 qs): {partial_tests}")
    print(f"  ❌ Failed (<80 qs)   : {failed_tests}")
    print("-" * 65)


if __name__ == "__main__":
    run_standalone_ingestion()
