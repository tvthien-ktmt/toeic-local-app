import os
import sys
import json

_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_APP_DIR = os.path.abspath(os.path.join(_CURRENT_DIR, ".."))
if _APP_DIR not in sys.path:
    sys.path.insert(0, os.path.abspath(os.path.join(_APP_DIR, "..")))

from app.db import SessionLocal
from app.models import Question
from app.services.gemini_service import get_gemini_api_key, query_gemini_with_cache

db = SessionLocal()
api_key = get_gemini_api_key()
print("Gemini API key present:", bool(api_key))

q = db.query(Question).filter(Question.id == 101).first()
if not q:
    q = db.query(Question).first()

print(f"Testing Gemini call on Question ID {q.id}: {q.question_text[:100]}")

prompt = f"""Phân tích câu hỏi TOEIC sau và trả về JSON duy nhất:
Câu: {q.question_text}
Đáp án đúng: ({q.correct_answer or 'A'})

Format JSON:
{{
  "grammar_topic": "...",
  "option_explanations": {{ "A": "...", "B": "...", "C": "...", "D": "..." }},
  "common_trap": "...",
  "translated_sentence": "..."
}}
CHỈ trả JSON duy nhất."""

try:
    data = query_gemini_with_cache(db, "test_gemini_single", prompt, f"test_{q.id}")
    print("Gemini response data:", json.dumps(data, ensure_ascii=False, indent=2))
    if isinstance(data, dict) and "common_trap" in data:
        q.grammar_topic = data.get("grammar_topic", q.grammar_topic)
        q.option_explanations_json = json.dumps(data.get("option_explanations", {}), ensure_ascii=False)
        q.common_trap = data.get("common_trap", "")
        q.translated_sentence = data.get("translated_sentence", "")
        db.commit()
        print("✅ Saved REAL Gemini AI data to DB successfully!")
except Exception as e:
    print("Gemini error:", e)

db.close()
