"""
Local Regex Parser Service for TOEIC Part 5 Questions.
Parses Part 5 questions locally (0 AI tokens for structure) using explicit start_q..end_q question numbers.
No hardcoded 1-30 matching when parsing Part 5 (101-130).
"""
import re
from typing import List, Dict, Any, Tuple, Optional

def clean_ocr_garbage_text(text: str) -> str:
    """Cleans OCR page numbers, headers, footers and stray single digits."""
    text = re.sub(r'(?i)Page\s+\d+[\s\-\w]* Column', '', text)
    text = re.sub(r'(?i)TEST\s+\d+\s+\d+', '', text)
    text = re.sub(r'(?i)READING TEST.*?(?=101)', '', text, flags=re.DOTALL)
    text = re.sub(r'\b\d{1,2}\s+(?=\([A-D]\)|[A-D][\.\)])', ' ', text)
    text = re.sub(r'(\b[a-zA-Z]+)\s+\d{1,2}\b', r'\1', text)
    return text

def parse_part5_locally(
    part5_text: str,
    start_q: int = 101,
    end_q: int = 130
) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parses Part 5 text using local regex (0 AI tokens for structure).
    Strictly matches question numbers in range [start_q, end_q] (default: 101 to 130).
    Number 30 inside sentences like '30 minutes' is NEVER matched as a question boundary!
    
    Returns:
        parsed_questions: List of successfully parsed question dicts.
        failed_blocks: List of raw question blocks that failed local regex parsing (to send to Gemini).
    """
    part5_text = clean_ocr_garbage_text(part5_text)

    # Build regex strictly from start_q to end_q (e.g. 101|102|...|130)
    q_range_pattern = "|".join(str(n) for n in range(start_q, end_q + 1))
    
    # Question boundary pattern: matches number in valid range followed by punctuation (. _ : ..)
    pattern = rf'\b({q_range_pattern})[\.\_\:\-]*\s+(.*?)(?=\b(?:{q_range_pattern})[\.\_\:\-]*\s+|\Z)'
    matches = list(re.finditer(pattern, part5_text, re.DOTALL))
    
    parsed_questions = []
    failed_blocks = []
    
    for match in matches:
        q_num = match.group(1)
        block_body = match.group(2).strip()
        
        # Search for option markers (A), (B), (C), (D) or A., B., C., D. or A), B), C), D) or (A, (B, (C, (D
        a_match = re.search(r'(?:^|\n|\s)(?:\([Aa]\)?|[Aa][\.\)])\s+', block_body)
        b_match = re.search(r'(?:^|\n|\s)(?:\([Bb]\)?|[Bb][\.\)])\s+', block_body)
        c_match = re.search(r'(?:^|\n|\s)(?:\([Cc]\)?|[Cc][\.\)])\s+', block_body)
        d_match = re.search(r'(?:^|\n|\s)(?:\([Dd]\)?|[Dd][\.\)])\s+', block_body)
        
        if a_match and b_match and c_match and d_match and (a_match.start() < b_match.start() < c_match.start() < d_match.start()):
            q_text_raw = block_body[:a_match.start()].strip()
            opt_a_text = block_body[a_match.end():b_match.start()].strip()
            opt_b_text = block_body[b_match.end():c_match.start()].strip()
            opt_c_text = block_body[c_match.end():d_match.start()].strip()
            opt_d_text = block_body[d_match.end():].strip()
            opt_d_text = opt_d_text.split('\n')[0].strip()

            # Clean option markers if remaining
            opt_a_text = re.sub(r'^\s*(?:\([Aa]\)?|[Aa][\.\)])\s*', '', opt_a_text).strip()
            opt_b_text = re.sub(r'^\s*(?:\([Bb]\)?|[Bb][\.\)])\s*', '', opt_b_text).strip()
            opt_c_text = re.sub(r'^\s*(?:\([Cc]\)?|[Cc][\.\)])\s*', '', opt_c_text).strip()
            opt_d_text = re.sub(r'^\s*(?:\([Dd]\)?|[Dd][\.\)])\s*', '', opt_d_text).strip()

            # Strip stray trailing digits from page headers/footers
            opt_a_text = re.sub(r'\s+\d{1,2}$', '', opt_a_text)
            opt_b_text = re.sub(r'\s+\d{1,2}$', '', opt_b_text)
            opt_c_text = re.sub(r'\s+\d{1,2}$', '', opt_c_text)
            opt_d_text = re.sub(r'\s+\d{1,2}$', '', opt_d_text)

            if opt_a_text and opt_b_text and opt_c_text and opt_d_text:
                if not re.search(r'[-_~]{3,}|\.{3,}', q_text_raw):
                    q_text_clean = q_text_raw.strip()
                    if not q_text_clean.endswith('.'):
                        q_text_clean += " _____"
                    q_text_raw = q_text_clean

                opts = [
                    f"A. {opt_a_text}",
                    f"B. {opt_b_text}",
                    f"C. {opt_c_text}",
                    f"D. {opt_d_text}"
                ]

                # Rule-based initial grammar topic estimation
                q_lower = q_text_raw.lower()
                topic = "Từ loại (Word Form)"
                if any(w in q_lower for w in ["by ", "on ", "at ", "for ", "in ", "to ", "during ", "since ", "until ", "under "]):
                    topic = "Giới từ (Preposition)"
                elif any(w in q_lower for w in ["because ", "although ", "while ", "after ", "before ", "unless ", "provided "]):
                    topic = "Liên từ (Conjunction)"
                elif any(w in q_lower for w in ["who ", "whom ", "which ", "that ", "whose "]):
                    topic = "Mệnh đề quan hệ (Relative Clause)"
                elif any(w in q_lower for w in ["he", "him", "his", "himself", "they", "them", "their", "themselves", "it", "its"]):
                    topic = "Đại từ (Pronoun)"

                parsed_questions.append({
                    "question_num": int(q_num),
                    "question_text": f"{q_num}. {q_text_raw}",
                    "options": opts,
                    "correct_answer": None,
                    "grammar_topic": topic,
                    "explanation": f"[LOCAL REGEX] Câu #{q_num} — Đã tách 4 đáp án cục bộ (0 AI token).",
                    "option_explanations": {
                        "A": f"Phương án A: {opt_a_text}",
                        "B": f"Phương án B: {opt_b_text}",
                        "C": f"Phương án C: {opt_c_text}",
                        "D": f"Phương án D: {opt_d_text}"
                    },
                    "translated_sentence": f"{q_num}. {q_text_raw}",
                    "is_ai_verified": False
                })
            else:
                failed_blocks.append(f"{q_num}. {block_body}")
        else:
            # Anchor missing: Try matching (A), (B), (C), (D) markers loosely
            a_m = re.search(r'\(?[Aa]\)?[\.\)]?\s+', block_body)
            b_m = re.search(r'\(?[Bb]\)?[\.\)]?\s+', block_body)
            c_m = re.search(r'\(?[Cc]\)?[\.\)]?\s+', block_body)
            d_m = re.search(r'\(?[Dd]\)?[\.\)]?\s+', block_body)

            markers = []
            if a_m: markers.append(('A', a_m.start(), a_m.end()))
            if b_m: markers.append(('B', b_m.start(), b_m.end()))
            if c_m: markers.append(('C', c_m.start(), c_m.end()))
            if d_m: markers.append(('D', d_m.start(), d_m.end()))
            markers.sort(key=lambda x: x[1])

            if len(markers) == 4:
                q_text_raw = block_body[:markers[0][1]].strip()
                opt_a_text = block_body[markers[0][2]:markers[1][1]].strip()
                opt_b_text = block_body[markers[1][2]:markers[2][1]].strip()
                opt_c_text = block_body[markers[2][2]:markers[3][1]].strip()
                opt_d_text = block_body[markers[3][2]:].strip().split('\n')[0].strip()

                opt_a_text = re.sub(r'^\s*(?:\([Aa]\)?|[Aa][\.\)])\s*', '', opt_a_text).strip()
                opt_b_text = re.sub(r'^\s*(?:\([Bb]\)?|[Bb][\.\)])\s*', '', opt_b_text).strip()
                opt_c_text = re.sub(r'^\s*(?:\([Cc]\)?|[Cc][\.\)])\s*', '', opt_c_text).strip()
                opt_d_text = re.sub(r'^\s*(?:\([Dd]\)?|[Dd][\.\)])\s*', '', opt_d_text).strip()

                if opt_a_text and opt_b_text and opt_c_text and opt_d_text:
                    if not re.search(r'[-_~]{3,}|\.{3,}', q_text_raw):
                        q_text_clean = q_text_raw.strip()
                        if not q_text_clean.endswith('.'):
                            q_text_clean += " _____"
                        q_text_raw = q_text_clean

                    opts = [
                        f"A. {opt_a_text}",
                        f"B. {opt_b_text}",
                        f"C. {opt_c_text}",
                        f"D. {opt_d_text}"
                    ]

                    q_lower = q_text_raw.lower()
                    topic = "Từ loại (Word Form)"
                    if any(w in q_lower for w in ["by ", "on ", "at ", "for ", "in ", "to ", "during ", "since ", "until "]):
                        topic = "Giới từ (Preposition)"
                    elif any(w in q_lower for w in ["because ", "although ", "while ", "after ", "before "]):
                        topic = "Liên từ (Conjunction)"
                    elif any(w in q_lower for w in ["who ", "whom ", "which ", "that ", "whose "]):
                        topic = "Mệnh đề quan hệ (Relative Clause)"

                    parsed_questions.append({
                        "question_num": int(q_num),
                        "question_text": f"{q_num}. {q_text_raw}",
                        "options": opts,
                        "correct_answer": None,
                        "grammar_topic": topic,
                        "explanation": f"[LOCAL REGEX] Câu #{q_num} — Đã tách 4 đáp án cục bộ (0 AI token).",
                        "option_explanations": {
                            "A": f"Phương án A: {opt_a_text}",
                            "B": f"Phương án B: {opt_b_text}",
                            "C": f"Phương án C: {opt_c_text}",
                            "D": f"Phương án D: {opt_d_text}"
                        },
                        "translated_sentence": f"{q_num}. {q_text_raw}",
                        "is_ai_verified": False
                    })
                else:
                    failed_blocks.append(f"{q_num}. {block_body}")
            else:
                failed_blocks.append(f"{q_num}. {block_body}")

    return parsed_questions, failed_blocks
