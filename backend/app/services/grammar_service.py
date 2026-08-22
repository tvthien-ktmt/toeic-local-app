import json
import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
from ..models import GrammarReference
from .gemini_service import query_gemini_with_cache, get_gemini_api_key

logger = logging.getLogger(__name__)

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
        logger.info(f"[GRAMMAR REFERENCE CACHE HIT] topic='{clean_topic}' (Returned from DB, 0 API tokens spent)")
        try:
            return {
                "id": existing.id,
                "topic_name": existing.topic_name,
                "formula": existing.formula,
                "key_rules": json.loads(existing.key_rules_json),
                "example_sentences": json.loads(existing.example_sentences_json),
                "created_at": existing.created_at.isoformat()
            }
        except Exception as json_decode_err:
            logger.warning(f"[GRAMMAR REFERENCE CACHE CORRUPT] Failed parsing grammar reference #{existing.id}: {json_decode_err}")

    logger.info(f"[GRAMMAR REFERENCE CACHE MISS] topic='{clean_topic}'. Triggering Gemini API 1-time generation...")
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

    data = None
    if api_key:
        try:
            data = query_gemini_with_cache(db, prompt_type, prompt_text, clean_topic)
        except Exception as gemini_err:
            logger.warning(f"[GRAMMAR REFERENCE AI ERROR] Gemini query failed for '{clean_topic}': {gemini_err}. Using rule-based fallback.")
            data = None

    if not data or not isinstance(data, dict):
        data = {
            "topic_name": clean_topic,
            "formula": f"Standard Structure & Usage for {clean_topic}",
            "key_rules": [
                f"Quy tắc cốt lõi ({clean_topic}): Xác định đúng vị trí và chức năng ngữ pháp của từ trong câu trước khi chọn đáp án.",
                f"Lưu ý bẫy ({clean_topic}): Chú ý các liên từ, dấu hiệu nhận biết thời thì và sự hòa hợp giữa chủ ngữ - vị ngữ."
            ],
            "example_sentences": [
                f"The management announced that the project will be completed ahead of schedule. (Ban quản lý thông báo rằng dự án sẽ hoàn thành trước thời hạn.)",
                f"All employees are required to submit their quarterly expense reports by Friday."
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
