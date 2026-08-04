"""
Local Regex Parser Service for TOEIC Part 5 Questions.
Parses Part 5 questions locally (0 AI tokens) using robust anchor matching for B/C/D markers
and intelligent fallback heuristics for OCR-degraded text.
Only questions that fail local regex parsing are forwarded to Gemini AI.
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
    Parses Part 5 text using local regex (0 AI tokens).
    Supports question numbers anywhere in text using word boundary \\b.
    Uses (B)/(C)/(D) markers as anchor points to handle cases where (A) is dropped by OCR.
    
    Returns:
        parsed_questions: List of successfully parsed question dicts.
        failed_blocks: List of raw question blocks that failed local regex parsing (to send to Gemini).
    """
    part5_text = clean_ocr_garbage_text(part5_text)

    # Word boundary match for 101..130 or 1..30 anywhere in OCR text
    pattern = r'\b(\d{1,3})[\.\_\:\s]+\s*(.*?)(?=\b\d{1,3}[\.\_\:\s]+|\Z)'
    matches = list(re.finditer(pattern, part5_text, re.DOTALL))
    
    parsed_questions = []
    failed_blocks = []
    
    for match in matches:
        q_num = match.group(1)
        block_body = match.group(2).strip()
        
        q_num_int = int(q_num)
        if q_num_int > 200:
            continue

        # Search for markers B, C, D in order (strict: (B) or B. or B))
        b_match = re.search(r'(?:^|\n|\s)(?:\([Bb]\)|[Bb][\.\)])\s+', block_body)
        c_match = re.search(r'(?:^|\n|\s)(?:\([Cc]\)|[Cc][\.\)])\s+', block_body)
        d_match = re.search(r'(?:^|\n|\s)(?:\([Dd]\)|[Dd][\.\)])\s+', block_body)
        
        q_text_raw = ""
        opt_a_text = ""
        opt_b_text = ""
        opt_c_text = ""
        opt_d_text = ""

        if b_match and c_match and d_match and (b_match.start() < c_match.start() < d_match.start()):
            pre_b = block_body[:b_match.start()].strip()
            opt_b_text = block_body[b_match.end():c_match.start()].strip()
            opt_c_text = block_body[c_match.end():d_match.start()].strip()
            opt_d_text = block_body[d_match.end():].strip()
            opt_d_text = opt_d_text.split('\n')[0].strip()

            # Remove (A), A., A) marker from pre_b if present (STRICT MARKER: (A), A., A) - NEVER plain 'a')
            a_match = re.search(r'(?:^|\n|\s)(?:\([Aa]\)|A[\.\)])\s+', pre_b)
            if a_match:
                q_text_raw = pre_b[:a_match.start()].strip()
                opt_a_text = pre_b[a_match.end():].strip()
            else:
                # Use length of Option B (1-3 words) to extract Option A from end of pre_b
                b_words = opt_b_text.split()
                b_words_count = max(1, min(3, len(b_words)))
                pre_b_words = pre_b.split()
                if len(pre_b_words) > b_words_count:
                    opt_a_text = " ".join(pre_b_words[-b_words_count:])
                    q_text_raw = " ".join(pre_b_words[:-b_words_count])
                else:
                    q_text_raw = pre_b
                    opt_a_text = ""
        else:
            # Anchor B/C/D missing or corrupted: add to failed_blocks to send to Gemini AI
            failed_blocks.append(f"{q_num}. {block_body}")
            continue

        # Clean option markers carefully without lerr_off_by_one (e.g. (A) Around -> Around)
        opt_a_text = re.sub(r'^\s*(?:\([Aa]\)|A[\.\)])\s*', '', opt_a_text).strip()
        opt_b_text = re.sub(r'^\s*(?:\([Bb]\)|B[\.\)])\s*', '', opt_b_text).strip()
        opt_c_text = re.sub(r'^\s*(?:\([Cc]\)|C[\.\)])\s*', '', opt_c_text).strip()
        opt_d_text = re.sub(r'^\s*(?:\([Dd]\)|D[\.\)])\s*', '', opt_d_text).strip()

        # Remove stray trailing digits (e.g. 'entitled 4' -> 'entitled')
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
            
            topic = "word form"
            q_lower = q_text_raw.lower()
            if any(w in q_lower for w in ["by ", "on ", "at ", "for ", "in ", "to ", "during ", "since ", "until "]):
                topic = "preposition"
            elif any(w in q_lower for w in ["because ", "although ", "while ", "after ", "before "]):
                topic = "conjunction"
            elif any(w in q_lower for w in ["who ", "whom ", "which ", "that ", "whose "]):
                topic = "relative clause"

            parsed_questions.append({
                "question_num": int(q_num),
                "question_text": f"{q_num}. {q_text_raw}",
                "options": opts,
                "correct_answer": None,
                "grammar_topic": topic,
                "explanation": f"[LOCAL REGEX] Câu #{q_num} — Tách 4 đáp án bằng regex 0 AI token.",
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

    return parsed_questions, failed_blocks
