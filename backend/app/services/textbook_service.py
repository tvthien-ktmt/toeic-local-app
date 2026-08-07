import os
import re
import json
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from ..models import Document, Question, Vocabulary

# Calculate dynamic root path to 'textbook' directory relative to repository root
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_CURRENT_DIR, "..", "..", ".."))
_DEFAULT_TEXTBOOK_DIR = os.path.join(_PROJECT_ROOT, "textbook")

TEXTBOOK_ROOT_DIR = os.environ.get("TEXTBOOK_ROOT_DIR", _DEFAULT_TEXTBOOK_DIR)

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


# =====================================================================
# QUESTION NUMBER REGEX — handles all known MD formats:
#   "101. text"  |  "**101.** text"  |  "### 101. text"  |  "**101**. text"
# =====================================================================
Q_NUM_PATTERN = re.compile(
    r'(?:^|\n)\s*(?:#{1,4}\s*)?'   # optional markdown heading
    r'(?:\*{1,2})?'                # optional bold start
    r'(1[0-9]{2}|200)'             # question number 100-200
    r'(?:\*{1,2})?'                # optional bold end
    r'[\.:]\s*'                    # period or colon
)

# Option pattern — handles (A)/(B)/(C)/(D) and A./B./C./D. formats (multi-line)
OPT_PATTERN = re.compile(
    r'(?:^|\n)\s*'
    r'(?:\*{1,2})?'                # optional bold
    r'[\(]?([A-Da-d])[\).]'        # letter with paren or period
    r'(?:\*{1,2})?'                # optional bold end
    r'\s*(.+?)(?=\n|$)'
)

# Inline option pattern — handles all 4 options on same line:
# "(A) attracted (B) entered (C) awarded (D) promoted"
INLINE_OPT_PATTERN = re.compile(
    r'\(([A-D])\)\s*(.+?)(?=\s*\([A-D]\)|$)',
    re.IGNORECASE
)


def _extract_options(q_body: str) -> Dict[str, str]:
    """Extract A/B/C/D options from question body, handling both multi-line and inline formats."""
    opt_by_letter: Dict[str, str] = {}

    # Try inline format first: "(A) text (B) text (C) text (D) text" on same line
    # This handles ETS 2021 style: "131. (A) attracted (B) entered (C) awarded (D) promoted"
    for line in q_body.splitlines():
        inline_matches = list(INLINE_OPT_PATTERN.finditer(line))
        if len(inline_matches) >= 2:  # at least 2 options on same line
            for m in inline_matches:
                letter = m.group(1).upper()
                text_val = re.sub(r'\*{1,2}', '', m.group(2)).strip()
                if letter in ('A', 'B', 'C', 'D') and letter not in opt_by_letter and text_val:
                    opt_by_letter[letter] = text_val
            if len(opt_by_letter) >= 4:
                break

    # If inline didn't get enough, try multi-line OPT_PATTERN
    if len(opt_by_letter) < 2:
        for om in OPT_PATTERN.finditer(q_body):
            letter = om.group(1).upper()
            text_val = re.sub(r'\*{1,2}$', '', om.group(2)).strip()
            if letter not in opt_by_letter and letter in ('A', 'B', 'C', 'D') and text_val:
                opt_by_letter[letter] = text_val

    return opt_by_letter


def parse_answer_file(ans_path: Optional[str]) -> Dict[int, Dict[int, str]]:
    """
    Parses answer key file. Returns dict: {test_num: {q_num: "A"|"B"|"C"|"D"}}

    Handles TWO formats:
    1. Standard: each line has sequential q_nums e.g. "101. (A) | 102. (B) | ... | 110. (C)"
       and "111. (D) | 112. (A) | ..." etc. — all genuine q_nums.

    2. 2-column OCR: each row has LEFT col (1 value) + RIGHT col (9 values):
       Row 1: [101. (C)] [102. (C) | 103. (A) | ... | 110. (B)]  ← Q101-Q110
       Row 2: [102. (C)] [112. (B) | 113. (D) | ... | 120. (A)]  ← left=Q111, right=Q112-Q120
       Row 3: [103. (D)] [122. (A) | 123. (B) | ... | 130. (C)]  ← left=Q121, right=Q122-Q130
       ...
       Row 10: [110. (B)] [192. (D) | 193. (A) | ... | 200. (B)] ← left=Q191, right=Q192-Q200

       Q111, Q121, ... Q191 are encoded as the ANSWER of the LEFT column value on rows 2-10.
       Detection: row1 has exactly 10 q_nums AND row2's first q_num < row2's second q_num.
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

            q_map = {}

            # Get lines that contain question-answer pairs
            data_lines = [
                l.strip() for l in block.splitlines()
                if re.search(r'\d{3}\.\s*\([A-D]\)', l, re.I)
            ]

            # Detect 2-column OCR format:
            # Row 1 has 10 q_nums (Q101-Q110).
            # In 2-column OCR: row 2 starts with a repeated low label (102-110, i.e. < 111)
            # In standard format: row 2 starts with the next sequential q_num (111+)
            # So: if row1 has 10 items AND row2[0] < 111 => 2-column OCR
            is_two_col = False
            if len(data_lines) >= 2:
                row1_pairs = re.findall(r'\b(1[0-9]{2}|200)\.\s*\([A-Da-d]\)', data_lines[0])
                row2_pairs = re.findall(r'\b(1[0-9]{2}|200)\.\s*\([A-Da-d]\)', data_lines[1])
                if (len(row1_pairs) == 10 and len(row2_pairs) >= 2
                        and int(row2_pairs[0]) < 111):
                    is_two_col = True

            if is_two_col:
                # Parse 2-column OCR format
                all_row_pairs = []
                for line in data_lines:
                    pairs = re.findall(r'\b(1[0-9]{2}|200)\.\s*\(([A-Da-d])\)', line)
                    all_row_pairs.append(pairs)

                # Row 1: all 10 are genuine Q101-Q110
                for q_str, ans in all_row_pairs[0]:
                    q_map[int(q_str)] = ans.upper()

                # Rows 2-10: left col encodes Q111, Q121...Q191; right col = genuine q_nums
                for row_idx, pairs in enumerate(all_row_pairs[1:], start=1):
                    if not pairs:
                        continue
                    # Left col answer = answer for Q(101 + row_idx * 10)
                    left_ans = pairs[0][1].upper()
                    missing_q = 101 + row_idx * 10  # 111, 121, 131...191
                    if 101 <= missing_q <= 200:
                        q_map[missing_q] = left_ans
                    # Right col: genuine q_nums
                    for q_str, ans in pairs[1:]:
                        q = int(q_str)
                        q_map[q] = ans.upper()
            else:
                # Standard format: every "NNN. (X)" is a genuine q_num
                for q_str, ans in re.findall(
                    r'(?:^|\n|\|)\s*\*{0,2}(1[0-9]{2}|200)\*{0,2}\s*[\.:\|]\s*\(?([A-Da-d])\)?',
                    block
                ):
                    q = int(q_str)
                    if q not in q_map:
                        q_map[q] = ans.upper()

            if q_map:
                answers_by_test[test_num] = q_map

        return answers_by_test
    except Exception as e:
        print(f"[TEXTBOOK SERVICE] Error parsing answer file {ans_path}: {e}")
        return {}

def split_text_into_tests_by_q_reset(text: str) -> List[Tuple[int, str]]:
    """
    Splits a full MD file into individual test blocks by detecting when
    question numbering resets back to 101 (or near it).
    
    Returns list of (char_position_of_first_question, block_text) pairs.
    """
    # Find all question number positions
    q_positions = []
    for m in Q_NUM_PATTERN.finditer(text):
        q_num = int(m.group(1))
        q_positions.append((m.start(), q_num))
    
    if not q_positions:
        return []
    
    # Detect test boundaries: when question number drops significantly
    test_start_positions = [0]  # First test starts at beginning of file
    prev_q = 0
    for i, (pos, q_num) in enumerate(q_positions):
        if q_num <= prev_q and q_num <= 110 and prev_q >= 130:
            # Found a reset — new test starts here
            # Find a good split point: look backwards for a heading before this question
            split_pos = pos
            # Look back up to 500 chars for a heading line
            search_start = max(0, pos - 500)
            chunk_before = text[search_start:pos]
            heading_m = list(re.finditer(r'\n(#+\s+.*)', chunk_before))
            if heading_m:
                last_heading = heading_m[-1]
                split_pos = search_start + last_heading.start()
            
            test_start_positions.append(split_pos)
        prev_q = q_num
    
    # Create test blocks
    test_blocks = []
    for i in range(len(test_start_positions)):
        start = test_start_positions[i]
        end = test_start_positions[i + 1] if i + 1 < len(test_start_positions) else len(text)
        block = text[start:end].strip()
        if block:
            test_blocks.append((start, block))
    
    return test_blocks


# Passage header pattern: "Questions 131-134 refer to the following notice." (supports -, –, —)
PASSAGE_HEADER_PATTERN = re.compile(
    r'Questions?\s+(\d+)[\s\-–—\u2013\u2014]+(?:to\s+)?(\d+)\s+refer\s+to\s+the\s+following\b',
    re.IGNORECASE
)


def _build_passage_map(test_content: str) -> Dict[int, str]:
    """
    Pre-scans test content for passage blocks like:
      "Questions 131-134 refer to the following notice."
      [PASSAGE TEXT]
      ### 131.   <-- first question of the group
    Returns a dict mapping each question number to its passage text.
    """
    passage_map: Dict[int, str] = {}
    header_matches = list(PASSAGE_HEADER_PATTERN.finditer(test_content))
    q_occurrences = list(Q_NUM_PATTERN.finditer(test_content))

    for h in header_matches:
        try:
            q_start = int(h.group(1))
            q_end = int(h.group(2))
        except (IndexError, ValueError):
            continue

        # Passage text = text from end of header line to the first question-number marker
        # that belongs to this group (>= q_start)
        header_end = h.end()
        # Skip to end of the header line
        newline_pos = test_content.find('\n', header_end)
        passage_body_start = newline_pos + 1 if newline_pos >= 0 else header_end

        # Find the first Q_NUM match that is >= q_start appearing after the header
        passage_body_end = None
        for qm in q_occurrences:
            if qm.start() <= header_end:
                continue
            qn = int(qm.group(1))
            if q_start <= qn <= q_end:
                passage_body_end = qm.start()
                break

        if passage_body_end is None or passage_body_end <= passage_body_start:
            continue

        raw_passage = test_content[passage_body_start:passage_body_end].strip()
        # Clean markdown headings and bold markers from passage
        raw_passage = re.sub(r'^#+\s*', '', raw_passage, flags=re.MULTILINE)
        raw_passage = re.sub(r'\*{1,2}', '', raw_passage)
        raw_passage = raw_passage.strip()

        if raw_passage:
            for qn in range(q_start, q_end + 1):
                passage_map[qn] = raw_passage

    return passage_map


def extract_questions_from_test_text(test_content: str, answer_map: Dict[int, str]) -> List[Dict[str, Any]]:
    """
    Extracts individual questions (101..200) from markdown text.
    Uses robust regex that handles **bold** question numbers, markdown headings, etc.
    Classifies into Part 5 (101-130), Part 6 (131-146), Part 7 (147-200).

    Key improvements:
    - Pre-scans passage blocks ("Questions X-Y refer to...") and attaches
      reading passage text to every question in that group.
    - Part 6 questions appear TWICE in the MD: first as inline blank markers
      inside the passage (no options), then again with actual A/B/C/D options
      listed after the passage. We skip the marker occurrence (no options) and
      use the options-bearing occurrence.
    """
    questions = []
    seen_q_nums = set()
    # Track Part 6 questions that appeared only as inline markers (no options listing)
    # If no options-bearing occurrence is found, we create a stub with passage context
    inline_p6_markers: Dict[int, bool] = {}

    # Pre-build passage map: {q_num -> passage_text}
    passage_map = _build_passage_map(test_content)

    # Find all question positions
    q_matches = list(Q_NUM_PATTERN.finditer(test_content))

    for i, m in enumerate(q_matches):
        q_num = int(m.group(1))

        # Only process TOEIC RC questions 101-200
        if q_num < 101 or q_num > 200:
            continue

        # Get question body: from end of this match to start of next question match
        body_start = m.end()
        body_end = q_matches[i + 1].start() if i + 1 < len(q_matches) else len(test_content)
        q_body = test_content[body_start:body_end].strip()

        # Limit body to reasonable length (prevent runaway into next test's content)
        if len(q_body) > 3000:
            q_body = q_body[:3000]

        # Extract options from body using helper that handles both multi-line and inline formats
        opt_by_letter = _extract_options(q_body)

        has_options = len(opt_by_letter) >= 2

        # For Part 6 (131-146): if no options found this is an inline blank marker
        # embedded in the passage (ETS 2020 style: "### 131." inside passage text).
        # Track it but skip - we prefer the options-bearing occurrence that appears
        # AFTER the passage. If no options occurrence exists, we'll add a stub later.
        if 131 <= q_num <= 146 and not has_options:
            # Positional marker only — no options attached
            # Register in inline_p6_markers so we can create stubs if needed
            if q_num not in seen_q_nums and q_num not in inline_p6_markers:
                inline_p6_markers[q_num] = True
            continue

        # Skip true duplicates (already processed with options)
        if q_num in seen_q_nums:
            continue
        seen_q_nums.add(q_num)
        # Remove from inline markers since we found an options-bearing occurrence
        inline_p6_markers.pop(q_num, None)

        # Build options list
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

        # Extract question stem text (everything before first option)
        # Try multi-line pattern first, then inline pattern for same-line options
        _stem_match = OPT_PATTERN.search(q_body) or INLINE_OPT_PATTERN.search(q_body)
        q_stem = q_body[:_stem_match.start()].strip() if _stem_match else q_body
        q_stem = re.sub(r'\*{1,2}', '', q_stem).strip()
        if len(q_stem) > 2000:
            q_stem = q_stem[:2000] + "..."

        # Attach passage text for Part 6 & Part 7
        passage = passage_map.get(q_num, "")
        if passage:
            if q_stem:
                full_text = f"{passage}\n\n{q_stem}"
            else:
                full_text = passage
        else:
            full_text = q_stem

        # Limit total question text length
        if len(full_text) > 4000:
            full_text = full_text[:4000] + "..."

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

    # Create stub questions for Part 6 inline markers that had no options listing
    # (these appear in some textbooks where options were not digitized properly)
    for q_num in sorted(inline_p6_markers.keys()):
        if q_num in seen_q_nums:
            continue  # was already added with options in the main loop
        passage = passage_map.get(q_num, "")
        corr_ans = answer_map.get(q_num, "")
        full_text = passage if passage else f"[Câu hỏi điền từ - Xem đoạn văn]"
        questions.append({
            "q_num": q_num,
            "part": 6,
            "question_text": f"{q_num}. {full_text}" if full_text else f"{q_num}.",
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


def _get_series_name(filename_no_ext: str) -> str:
    """Clean series name: remove (2), normalize variations, trailing whitespace, etc."""
    name = re.sub(r'\s*\(\d+\)', '', filename_no_ext).strip()
    # Normalize known variations
    name = re.sub(r'(?i)^ETS\s+TOEIC\s+Reading\s+(\d{4})', r'ETS \1 RC', name)
    return name


def _find_answer_file(directory: str, files: List[str]) -> Optional[str]:
    """Find the answer key file in a directory."""
    ans_keywords = ["đáp án", "đáp_án", "dáp án", "dáp_án"]
    for f2 in files:
        f2_lower = f2.lower()
        if f2.endswith(".md") and any(k in f2_lower for k in ans_keywords):
            return os.path.join(directory, f2)
    return None


def _is_answer_file(filename: str) -> bool:
    """Check if a filename is an answer key file."""
    f_lower = filename.lower()
    return any(k in f_lower for k in ["đáp án", "đáp_án", "dáp án", "dáp_án"])


def scan_and_seed_textbooks(db: Session) -> Dict[str, Any]:
    r"""
    Scans d:\TOIEC Web\textbook and seeds built-in exam documents + questions into SQLite DB.
    
    Strategy: 
    1. For each non-answer MD file, read the full text
    2. Split into individual tests by detecting question-number resets (Q101 appears again)
    3. Extract 100 questions per test (Q101-Q200)
    4. Match answer keys from companion answer file
    5. Seed into DB with deduplication
    """
    ensure_db_schema(db)
    if not os.path.exists(TEXTBOOK_ROOT_DIR):
        err_msg = f"[TEXTBOOK SERVICE] Directory not found: {TEXTBOOK_ROOT_DIR}. Please set TEXTBOOK_ROOT_DIR env var or place 'textbook' directory in project root."
        print(err_msg)
        raise FileNotFoundError(err_msg)

    seeded_count = 0
    skipped_count = 0

    for root, dirs, files in os.walk(TEXTBOOK_ROOT_DIR):
        for f in files:
            if not f.endswith(".md") or _is_answer_file(f):
                continue
            
            md_path = os.path.join(root, f)
            ans_path = _find_answer_file(root, files)
            
            rel = os.path.relpath(md_path, TEXTBOOK_ROOT_DIR)
            parts = rel.split(os.sep)
            category = parts[0] if len(parts) > 1 else "OTHER"
            series_name = _get_series_name(os.path.splitext(f)[0])

            # Parse answer keys
            ans_by_test = parse_answer_file(ans_path)

            # Read MD file
            try:
                with open(md_path, "r", encoding="utf-8", errors="ignore") as file:
                    text = file.read()
            except Exception as ex:
                print(f"[TEXTBOOK SERVICE] Error reading {md_path}: {ex}")
                continue

            # Split into tests by question-number reset
            test_blocks = split_text_into_tests_by_q_reset(text)
            
            if not test_blocks:
                print(f"[TEXTBOOK SERVICE] ⚠️ No questions found in: {rel}")
                continue

            print(f"[TEXTBOOK SERVICE] 📚 {rel}: {len(test_blocks)} tests detected")

            for t_idx, (_, block) in enumerate(test_blocks, 1):
                # Try to determine test number from heading in the block
                test_num = t_idx  # default: sequential
                # Only look at heading lines (starting with #) to avoid matching question numbers
                heading_lines = re.findall(r'^(#+\s*.*)', block[:1000], re.MULTILINE)
                for hl in heading_lines:
                    hm = re.search(r'(?i)(?:TEST|test)\s*0*(\d+)', hl)
                    if hm:
                        parsed_num = int(hm.group(1))
                        if 1 <= parsed_num <= 20:  # Valid test number range
                            test_num = parsed_num
                            break
                
                # Match answer key for this test
                t_ans_map = ans_by_test.get(test_num, {})
                
                # If no answer key found by test_num, try t_idx
                if not t_ans_map and t_idx in ans_by_test:
                    t_ans_map = ans_by_test[t_idx]

                filename = f"[{category}] {series_name} - Test {test_num:02d}"
                content_hash = hashlib.sha256(
                    f"{filename}::{block[:1000]}".encode("utf-8")
                ).hexdigest()

                # Check if document already exists (by hash or filename)
                existing_doc = db.query(Document).filter(
                    Document.content_hash == content_hash
                ).first()
                if not existing_doc:
                    existing_doc = db.query(Document).filter(
                        Document.filename == filename,
                        Document.is_builtin == True
                    ).first()

                if existing_doc:
                    # Check if questions already extracted properly
                    q_count = db.query(Question).filter(
                        Question.document_id == existing_doc.id
                    ).count()

                    if q_count >= 100:
                        # Already has full 100 questions — just update metadata
                        existing_doc.is_builtin = True
                        existing_doc.category = category
                        existing_doc.series = series_name
                        existing_doc.test_number = test_num
                        existing_doc.status = "extracted"
                        db.commit()
                        skipped_count += 1
                        continue
                    else:
                        # Has < 100 questions — delete old questions and re-extract
                        # (catches tests missing passages or with inline markers skipped)
                        print(f"[TEXTBOOK SERVICE] ♻️  Re-extracting {filename} (had only {q_count} qs)")
                        db.query(Question).filter(
                            Question.document_id == existing_doc.id
                        ).delete()
                        existing_doc.is_builtin = True
                        existing_doc.category = category
                        existing_doc.series = series_name
                        existing_doc.test_number = test_num
                        existing_doc.markdown_content = block
                        existing_doc.content_hash = content_hash
                        existing_doc.status = "extracted"
                        db.commit()

                        # Re-extract questions
                        qs_data = extract_questions_from_test_text(block, t_ans_map)
                        for q in qs_data:
                            new_q = Question(
                                document_id=existing_doc.id,
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
                        continue

                # Create new built-in Document
                new_doc = Document(
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
                db.add(new_doc)
                db.commit()
                db.refresh(new_doc)

                # Extract questions for this test
                qs_data = extract_questions_from_test_text(block, t_ans_map)

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

    print(f"[TEXTBOOK SERVICE] Completed scan: {seeded_count} tests seeded/updated, {skipped_count} skipped (already OK).")
    return {
        "status": "success",
        "seeded_count": seeded_count,
        "skipped_count": skipped_count
    }
