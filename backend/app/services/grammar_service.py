import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from ..models import GrammarReference
from .gemini_service import query_gemini_with_cache, get_gemini_api_key

def get_or_create_grammar_reference(db: Session, topic_name: str) -> Dict[str, Any]:
    """
    Module 17: Retrieves grammar reference card from SQLite DB (0 API tokens spent on cache hit).
    If missing, queries Gemini API 1 time to generate formula, rules, and examples, then caches forever.
    """
    clean_topic = topic_name.strip()
    if not clean_topic:
        clean_topic = "general grammar"

    # 1. Check SQLite Cache
    existing = db.query(GrammarReference).filter(GrammarReference.topic_name.ilike(clean_topic)).first()
    if existing:
        print(f"[GRAMMAR REFERENCE CACHE HIT] topic='{clean_topic}' (Returned from DB, 0 API tokens spent)")
        try:
            return {
                "id": existing.id,
                "topic_name": existing.topic_name,
                "formula": existing.formula,
                "key_rules": json.loads(existing.key_rules_json),
                "example_sentences": json.loads(existing.example_sentences_json),
                "created_at": existing.created_at.isoformat()
            }
        except Exception:
            pass

    print(f"[GRAMMAR REFERENCE CACHE MISS] topic='{clean_topic}'. Triggering Gemini API 1-time generation...")
    api_key = get_gemini_api_key()

    prompt_type = "grammar_reference"
    prompt_text = f"""Bạn là chuyên gia ngữ pháp TOEIC. Hãy tạo thẻ 'Ôn nhanh' cho chủ điểm ngữ pháp: '{clean_topic}'.
Trả về 1 JSON object:
{{
  "topic_name": "{clean_topic}",
  "formula": "Công thức/cấu trúc cốt lõi dạng công thức ngắn gọn (vd: S + V + that + S + (should) + V-inf hoặc S + have/has + V3/ed)",
  "key_rules": [
    "Quy tắc 1: 1-2 câu ngắn gọn giải thích cách dùng quan trọng nhất",
    "Quy tắc 2: dấu hiệu nhận biết hoặc lưu ý hay gặp trong bài thi TOEIC"
  ],
  "example_sentences": [
    "Câu ví dụ tiếng Anh 1 (dịch nghĩa tiếng Việt đi kèm trong ngoặc)",
    "Câu ví dụ tiếng Anh 2"
  ]
}}
CHỈ trả JSON object. Không thêm bớt text ngoài JSON."""

    if api_key:
        data = query_gemini_with_cache(db, prompt_type, prompt_text, clean_topic)
    else:
        data = {
            "topic_name": clean_topic,
            "formula": f"Standard Structure for {clean_topic}",
            "key_rules": [
                f"Rule 1 for {clean_topic}: Always match the subject with correct verb forms in TOEIC Part 5.",
                f"Rule 2 for {clean_topic}: Pay attention to keywords and signal words."
            ],
            "example_sentences": [
                f"She successfully completed the task ahead of schedule. (Cô ấy đã hoàn thành công việc trước thời hạn.)",
                f"All employees are required to wear identification badges."
            ]
        }

    formula = data.get("formula", f"Structure for {clean_topic}")
    rules = data.get("key_rules", [])
    examples = data.get("example_sentences", [])

    rules_str = json.dumps(rules, ensure_ascii=False) if isinstance(rules, list) else "[]"
    examples_str = json.dumps(examples, ensure_ascii=False) if isinstance(examples, list) else "[]"

    new_ref = GrammarReference(
        topic_name=clean_topic,
        formula=formula,
        key_rules_json=rules_str,
        example_sentences_json=examples_str
    )
    db.add(new_ref)
    db.commit()
    db.refresh(new_ref)

    return {
        "id": new_ref.id,
        "topic_name": new_ref.topic_name,
        "formula": new_ref.formula,
        "key_rules": rules,
        "example_sentences": examples,
        "created_at": new_ref.created_at.isoformat()
    }
