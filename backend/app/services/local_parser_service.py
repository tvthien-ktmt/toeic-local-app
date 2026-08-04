"""
Local Regex Parser Service for TOEIC Part 5 Questions.
Parses Part 5 questions locally (0 AI tokens for question structure) ONLY when explicit (A), (B), (C), (D) option markers exist.
No guessing heuristics: any missing or corrupted markers are immediately pushed to failed_blocks for Gemini AI.
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

def parse_part5_locally(part5_text: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parses Part 5 text using local regex (0 AI tokens for structure).
    Matches valid question numbers (101-130 or 1-30) followed by dot/underscore punctuation.
    
    Returns:
        parsed_questions: List of successfully parsed question dicts.
        failed_blocks: List of raw question blocks that failed local regex parsing (to send to Gemini).
    """
    part5_text = clean_ocr_garbage_text(part5_text)

    # Strictly match valid TOEIC question numbers (101..130 or 1..30) followed by punctuation (. _ :)
    pattern = r'\b(10[1-9]|1[1-2][0-9]|130|[1-9]|[12][0-9]|30)\s*[\.\_\:\-]*\s+(.*?)(?=\b(?:10[1-9]|1[1-2][0-9]|130|[1-9]|[12][0-9]|30)\s*[\.\_\:\-]*\s+|\Z)'
    matches = list(re.finditer(pattern, part5_text, re.DOTALL))
    
    parsed_questions = []
    failed_blocks = []
    
    for match in matches:
        q_num = match.group(1)
        block_body = match.group(2).strip()
        
        # Search for explicit option markers (A), (B), (C), (D) or A., B., C., D.
        a_match = re.search(r'(?:^|\n|\s)(?:\([Aa]\)|A[\.\)])\s+', block_body)
        b_match = re.search(r'(?:^|\n|\s)(?:\([Bb]\)|B[\.\)])\s+', block_body)
        c_match = re.search(r'(?:^|\n|\s)(?:\([Cc]\)|C[\.\)])\s+', block_body)
        d_match = re.search(r'(?:^|\n|\s)(?:\([Dd]\)|D[\.\)])\s+', block_body)
        
        # B.1.4 Rule: Require all 4 option markers in order. No guessing heuristics!
        if a_match and b_match and c_match and d_match and (a_match.start() < b_match.start() < c_match.start() < d_match.start()):
            q_text_raw = block_body[:a_match.start()].strip()
            opt_a_text = block_body[a_match.end():b_match.start()].strip()
            opt_b_text = block_body[b_match.end():c_match.start()].strip()
            opt_c_text = block_body[c_match.end():d_match.start()].strip()
            opt_d_text = block_body[d_match.end():].strip()
            opt_d_text = opt_d_text.split('\n')[0].strip()

            # Clean option markers if remaining
            opt_a_text = re.sub(r'^\s*(?:\([Aa]\)|A[\.\)])\s*', '', opt_a_text).strip()
            opt_b_text = re.sub(r'^\s*(?:\([Bb]\)|B[\.\)])\s*', '', opt_b_text).strip()
            opt_c_text = re.sub(r'^\s*(?:\([Cc]\)|C[\.\)])\s*', '', opt_c_text).strip()
            opt_d_text = re.sub(r'^\s*(?:\([Dd]\)|D[\.\)])\s*', '', opt_d_text).strip()

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

                parsed_questions.append({
                    "question_num": int(q_num),
                    "question_text": f"{q_num}. {q_text_raw}",
                    "options": opts,
                    "correct_answer": None,
                    "grammar_topic": "Pending AI Enrichment",
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
            # B.1.4: Missing any marker (A/B/C/D) -> Push directly to failed_blocks for Gemini AI
            failed_blocks.append(f"{q_num}. {block_body}")

    return parsed_questions, failed_blocks
