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

def extract_clean_option_a(pre_b_text: str, opt_b_text: str, opt_c_text: str, opt_d_text: str) -> Tuple[str, str]:
    """
    Separates Question Text and Option A text from pre_b_text when (A) marker is missing in OCR.
    Matches the word count of options B, C, D to isolate Option A cleanly without sentence contamination.
    """
    # Check if explicit (A) or A. or A) marker exists in pre_b_text
    a_match = re.search(r'(?:^|\n|\s)(?:\([Aa]\)?|[Aa][\.\)])\s+', pre_b_text)
    if a_match:
        q_text = pre_b_text[:a_match.start()].strip()
        opt_a = pre_b_text[a_match.end():].strip()
        return q_text, opt_a

    # No explicit (A) marker -> Option A is right before (B) marker
    # Determine target word count based on B, C, D options (usually 1-3 words)
    b_words = len(opt_b_text.strip().split())
    c_words = len(opt_c_text.strip().split())
    d_words = len(opt_d_text.strip().split())
    target_words = max(b_words, c_words, d_words, 1)
    if target_words > 4:
        target_words = 2

    pre_words = pre_b_text.strip().split()
    if len(pre_words) > target_words:
        opt_a = " ".join(pre_words[-target_words:])
        q_text = " ".join(pre_words[:-target_words])
    else:
        opt_a = pre_b_text.strip()
        q_text = ""

    return q_text, opt_a

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
        
        # Search for option markers (B), (C), (D) or B., C., D.
        b_match = re.search(r'(?:^|\n|\s)(?:\([Bb]\)?|[Bb][\.\)])\s+', block_body)
        c_match = re.search(r'(?:^|\n|\s)(?:\([Cc]\)?|[Cc][\.\)])\s+', block_body)
        d_match = re.search(r'(?:^|\n|\s)(?:\([Dd]\)?|[Dd][\.\)])\s+', block_body)
        
        if b_match and c_match and d_match and (b_match.start() < c_match.start() < d_match.start()):
            pre_b_text = block_body[:b_match.start()].strip()
            opt_b_text = block_body[b_match.end():c_match.start()].strip()
            opt_c_text = block_body[c_match.end():d_match.start()].strip()
            opt_d_text = block_body[d_match.end():].strip().split('\n')[0].strip()

            # Clean option markers if remaining
            opt_b_text = re.sub(r'^\s*(?:\([Bb]\)?|[Bb][\.\)])\s*', '', opt_b_text).strip()
            opt_c_text = re.sub(r'^\s*(?:\([Cc]\)?|[Cc][\.\)])\s*', '', opt_c_text).strip()
            opt_d_text = re.sub(r'^\s*(?:\([Dd]\)?|[Dd][\.\)])\s*', '', opt_d_text).strip()

            # Separate Question Text and Option A cleanly
            q_text_raw, opt_a_text = extract_clean_option_a(pre_b_text, opt_b_text, opt_c_text, opt_d_text)
            opt_a_text = re.sub(r'^\s*(?:\([Aa]\)?|[Aa][\.\)])\s*', '', opt_a_text).strip()

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
            failed_blocks.append(f"{q_num}. {block_body}")

    return parsed_questions, failed_blocks
