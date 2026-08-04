"""
Local Regex Parser Service for TOEIC Part 5 Questions.
Parses Part 5 questions locally (0 AI tokens) using B/C/D markers as anchor points.
Only questions that fail local regex parsing are forwarded to Gemini AI.
"""
import re
from typing import List, Dict, Any, Tuple, Optional

def parse_part5_locally(part5_text: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parses Part 5 text using local regex (0 AI tokens).
    Uses (B)/(C)/(D) markers as anchor points to handle cases where (A) is dropped by OCR.
    
    Returns:
        parsed_questions: List of successfully parsed question dicts.
        failed_blocks: List of raw question blocks that failed local regex parsing (to send to Gemini).
    """
    pattern = r'(?:^|\n)\s*(\d{3})\.\s*(.*?)(?=\n\s*\d{3}\.|\Z)'
    matches = list(re.finditer(pattern, part5_text, re.DOTALL))
    
    parsed_questions = []
    failed_blocks = []
    
    for match in matches:
        q_num = match.group(1)
        block_body = match.group(2).strip()
        
        # Search for markers B, C, D in order
        b_match = re.search(r'(?:^|\n|\s)\(?[Bb]\)?[\.\)]?\s+', block_body)
        c_match = re.search(r'(?:^|\n|\s)\(?[Cc]\)?[\.\)]?\s+', block_body)
        d_match = re.search(r'(?:^|\n|\s)\(?[Dd]\)?[\.\)]?\s+', block_body)
        
        if b_match and c_match and d_match and (b_match.start() < c_match.start() < d_match.start()):
            pre_b = block_body[:b_match.start()].strip()
            
            # Remove (A) marker if present
            a_match = re.search(r'(?:^|\n|\s)\(?[Aa]\)?[\.\)]?\s+', pre_b)
            if a_match:
                q_text_raw = pre_b[:a_match.start()].strip()
                opt_a_text = pre_b[a_match.end():].strip()
            else:
                lines = [l.strip() for l in pre_b.split('\n') if l.strip()]
                if len(lines) >= 2:
                    q_text_raw = ' '.join(lines[:-1]).strip()
                    opt_a_text = lines[-1].strip()
                else:
                    q_text_raw = pre_b
                    opt_a_text = ""

            opt_b_text = block_body[b_match.end():c_match.start()].strip()
            opt_c_text = block_body[c_match.end():d_match.start()].strip()
            opt_d_text = block_body[d_match.end():].strip()
            opt_d_text = opt_d_text.split('\n')[0].strip()

            opt_a_text = re.sub(r'^\s*\(?[Aa]\)?[\.\)]?\s*', '', opt_a_text).strip()
            opt_b_text = re.sub(r'^\s*\(?[Bb]\)?[\.\)]?\s*', '', opt_b_text).strip()
            opt_c_text = re.sub(r'^\s*\(?[Cc]\)?[\.\)]?\s*', '', opt_c_text).strip()
            opt_d_text = re.sub(r'^\s*\(?[Dd]\)?[\.\)]?\s*', '', opt_d_text).strip()

            if opt_a_text and opt_b_text and opt_c_text and opt_d_text:
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
                failed_blocks.append(match.group(0).strip())
        else:
            failed_blocks.append(match.group(0).strip())

    return parsed_questions, failed_blocks
