import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models import Vocabulary, Flashcard
from .gemini_service import query_gemini_with_cache, get_gemini_api_key

logger = logging.getLogger(__name__)

def lookup_word_in_context(
    db: Session,
    word: str,
    context_sentence: str = "",
    document_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Module 16.1: Contextual word lookup for highlighted text.
    First checks SQLite DB (0 API tokens spent on cache hit).
    If missing, queries Gemini API 1 time to get context-accurate meaning, IPA, and saves to DB.
    """
    clean_word = word.strip().lower()
    if not clean_word:
        raise ValueError("Word cannot be empty")

    # 1. Check SQLite DB for existing Vocabulary row
    query = db.query(Vocabulary).filter(Vocabulary.word == clean_word)
    if document_id:
        existing = query.filter(Vocabulary.source_document_id == document_id).first()
        if not existing:
            existing = query.first()
    else:
        existing = query.first()

    if existing:
        logger.info(f"[VOCAB LOOKUP CACHE HIT] word='{clean_word}' (Returned from DB, 0 API tokens spent)")
        syns = json.loads(existing.synonyms) if (existing.synonyms and existing.synonyms.startswith("[")) else []
        ants = json.loads(existing.antonyms) if (existing.antonyms and existing.antonyms.startswith("[")) else []
        
        # Check if flashcard exists
        fc = db.query(Flashcard).filter(Flashcard.vocabulary_id == existing.id).first()
        
        return {
            "id": existing.id,
            "word": existing.word,
            "ipa": existing.ipa or f"/{clean_word}/",
            "part_of_speech": existing.part_of_speech or "n",
            "meaning_vi": existing.meaning_vi or f"nghĩa của {clean_word}",
            "example_sentence": existing.example_sentence or context_sentence,
            "synonyms": syns,
            "antonyms": ants,
            "topic_category": existing.topic_category,
            "source_type": existing.source_type,
            "in_flashcard": fc is not None
        }

    # 2. Query Gemini API for contextual lookup
    logger.info(f"[VOCAB LOOKUP CACHE MISS] word='{clean_word}'. Triggering Gemini API contextual lookup...")
    api_key = get_gemini_api_key()

    prompt_type = "lookup_word_context"
    prompt_text = f"""Bạn là từ điển Anh-Việt TOEIC. Hãy tra nghĩa của từ/cụm từ: '{clean_word}' dựa trên câu ngữ cảnh sau:
Câu ngữ cảnh: "{context_sentence or clean_word}"

Trả về 1 JSON object:
{{
  "word": "{clean_word}",
  "ipa": "phiên âm IPA chuẩn",
  "part_of_speech": "n/v/adj/adv/phrase",
  "meaning_vi": "nghĩa tiếng Việt chính xác khớp ngữ cảnh câu trên",
  "topic_category": "chủ đề liên quan nhất (vd: tài chính & ngân sách, bất động sản, tuyển dụng & nhân sự, văn phòng & công sở, mua sắm & dịch vụ)",
  "synonyms": ["1-3 từ đồng nghĩa tiếng Anh thực sự"],
  "antonyms": ["1-2 từ trái nghĩa tiếng Anh"],
  "example_sentence": "câu ví dụ ngắn tiếng Anh"
}}
CHỈ trả về JSON object."""

    if api_key:
        data = query_gemini_with_cache(db, prompt_type, prompt_text, f"{clean_word}::{context_sentence[:100]}")
    else:
        data = {
            "word": clean_word,
            "ipa": f"/{clean_word}/",
            "part_of_speech": "noun",
            "meaning_vi": f"nghĩa ngữ cảnh của {clean_word}",
            "topic_category": "văn phòng & công sở",
            "synonyms": [f"equivalent_{clean_word}"],
            "antonyms": [],
            "example_sentence": context_sentence or f"Sample sentence with {clean_word}."
        }

    syn_str = json.dumps(data.get("synonyms", []), ensure_ascii=False)
    ant_str = json.dumps(data.get("antonyms", []), ensure_ascii=False)

    new_v = Vocabulary(
        word=clean_word,
        ipa=data.get("ipa", f"/{clean_word}/"),
        part_of_speech=data.get("part_of_speech", "n"),
        meaning_vi=data.get("meaning_vi", f"nghĩa của {clean_word}"),
        example_sentence=data.get("example_sentence", context_sentence),
        source_document_id=document_id,
        topic_category=data.get("topic_category", "văn phòng & công sở"),
        synonyms=syn_str,
        antonyms=ant_str,
        source_type="looked_up",
        frequency_count=1
    )
    db.add(new_v)
    db.commit()
    db.refresh(new_v)

    return {
        "id": new_v.id,
        "word": new_v.word,
        "ipa": new_v.ipa,
        "part_of_speech": new_v.part_of_speech,
        "meaning_vi": new_v.meaning_vi,
        "example_sentence": new_v.example_sentence,
        "synonyms": data.get("synonyms", []),
        "antonyms": data.get("antonyms", []),
        "topic_category": new_v.topic_category,
        "source_type": new_v.source_type,
        "in_flashcard": False
    }


def get_related_vocabulary_suggestions(
    db: Session,
    word: str,
    topic_category: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Module 16.2: Suggests 3-5 related TOEIC business terms for a given word.
    Uses Gemini general business knowledge (0 copyright violation of proprietary ETS lists).
    Caches suggested terms in SQLite DB with source_type='suggested' and parent_word=word.
    """
    clean_word = word.strip().lower()

    # 1. Check DB for existing suggestions
    existing_suggestions = db.query(Vocabulary).filter(
        Vocabulary.source_type == "suggested",
        Vocabulary.parent_word == clean_word
    ).all()

    if existing_suggestions and len(existing_suggestions) >= 3:
        logger.info(f"[RELATED VOCAB CACHE HIT] Suggestions for '{clean_word}' returned from DB ({len(existing_suggestions)} terms)")
        suggested_terms_list = []
        for vocabulary_item in existing_suggestions:
            flashcard_item = db.query(Flashcard).filter(Flashcard.vocabulary_id == vocabulary_item.id).first()
            synonyms_list = json.loads(vocabulary_item.synonyms) if (vocabulary_item.synonyms and vocabulary_item.synonyms.startswith("[")) else []
            suggested_terms_list.append({
                "id": vocabulary_item.id,
                "word": vocabulary_item.word,
                "ipa": vocabulary_item.ipa,
                "part_of_speech": vocabulary_item.part_of_speech,
                "meaning_vi": vocabulary_item.meaning_vi,
                "example_sentence": vocabulary_item.example_sentence,
                "synonyms": synonyms_list,
                "topic_category": vocabulary_item.topic_category,
                "source_type": vocabulary_item.source_type,
                "parent_word": vocabulary_item.parent_word,
                "in_flashcard": flashcard_item is not None
            })
        return suggested_terms_list

    # 2. Query Gemini for 3-5 business/TOEIC related terms
    logger.info(f"[RELATED VOCAB CACHE MISS] Generating 3-5 TOEIC business terms related to '{clean_word}' via Gemini...")
    api_key = get_gemini_api_key()

    prompt_type = "suggest_related_vocab"
    prompt_text = f"""Bạn là chuyên gia từ vựng TOEIC thương mại (Business English).
Nhiệm vụ: Gợi ý 3-5 từ vựng hoặc cụm từ tiếng Anh thương mại CÙNG CHỦ ĐỀ hoặc CÙNG NHÓM NGHĨA liên quan đến từ '{clean_word}' ({topic_category or 'TOEIC Business'}).
LƯU Ý QUAN TRỌNG: Không sao chép từ bất kỳ danh sách từ vựng độc quyền nào của ETS. Tự sinh từ dựa trên kiến thức chung về tiếng Anh thương mại phổ biến.

Trả về JSON array các từ gợi ý:
[
  {{
    "word": "từ gợi ý 1",
    "ipa": "phiên âm",
    "part_of_speech": "n/v/adj/adv/phrase",
    "meaning_vi": "nghĩa tiếng Việt ngắn gọn",
    "synonyms": ["từ đồng nghĩa"],
    "example_sentence": "câu ví dụ ngắn"
  }}
]
CHỈ trả về JSON array."""

    if api_key:
        raw_list = query_gemini_with_cache(db, prompt_type, prompt_text, f"suggest::{clean_word}")
    else:
        raw_list = [
            {"word": f"receipt_{clean_word}", "ipa": "/rɪˈsiːt/", "part_of_speech": "n", "meaning_vi": "hóa đơn thanh toán", "synonyms": ["bill"], "example_sentence": "Keep the receipt for expense reimbursement."},
            {"word": f"statement_{clean_word}", "ipa": "/ˈsteɪtmənt/", "part_of_speech": "n", "meaning_vi": "bản sao kê", "synonyms": ["report"], "example_sentence": "The bank statement arrived today."},
            {"word": f"due_date_{clean_word}", "ipa": "/djuː deɪt/", "part_of_speech": "phrase", "meaning_vi": "ngày hạn chót thanh toán", "synonyms": ["deadline"], "example_sentence": "Payment must be received before the due date."}
        ]

    item_list = raw_list if isinstance(raw_list, list) else raw_list.get("terms", [])
    results = []

    for item in item_list[:5]:
        w_name = item.get("word", "").strip().lower()
        if not w_name:
            continue

        existing_item = db.query(Vocabulary).filter(
            Vocabulary.word == w_name,
            Vocabulary.source_document_id.is_(None)
        ).first()

        syn_str = json.dumps(item.get("synonyms", []), ensure_ascii=False)

        if existing_item:
            v_obj = existing_item
            if not v_obj.parent_word:
                v_obj.parent_word = clean_word
                v_obj.source_type = "suggested"
                db.commit()
        else:
            v_obj = Vocabulary(
                word=w_name,
                ipa=item.get("ipa", f"/{w_name}/"),
                part_of_speech=item.get("part_of_speech", "n"),
                meaning_vi=item.get("meaning_vi", f"nghĩa của {w_name}"),
                example_sentence=item.get("example_sentence", ""),
                source_document_id=None,
                topic_category=topic_category or "từ vựng AI gợi ý",
                synonyms=syn_str,
                source_type="suggested",
                parent_word=clean_word,
                frequency_count=1
            )
            db.add(v_obj)
            db.commit()
            db.refresh(v_obj)

        fc = db.query(Flashcard).filter(Flashcard.vocabulary_id == v_obj.id).first()
        results.append({
            "id": v_obj.id,
            "word": v_obj.word,
            "ipa": v_obj.ipa,
            "part_of_speech": v_obj.part_of_speech,
            "meaning_vi": v_obj.meaning_vi,
            "example_sentence": v_obj.example_sentence,
            "synonyms": item.get("synonyms", []),
            "topic_category": v_obj.topic_category,
            "source_type": v_obj.source_type,
            "parent_word": v_obj.parent_word,
            "in_flashcard": fc is not None
        })

    return results
