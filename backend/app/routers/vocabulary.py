from typing import List, Optional, Dict, Any, Annotated
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from ..db import get_db
from ..models import Vocabulary, Flashcard
from ..schemas import VocabularyLookupRequest, RelatedVocabRequest
from ..services.vocabulary_lookup_service import lookup_word_in_context, get_related_vocabulary_suggestions

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])

TAXONOMY_TOPICS = [
    # Part 5/6 Grammar Topics
    "từ loại", "thì động từ", "thể bị động", "mệnh đề quan hệ",
    "giới từ & liên từ", "so sánh", "đại từ", "mệnh đề trạng ngữ",
    # Part 7 Business Situation Topics
    "đặt hàng & dịch vụ", "cảm ơn & xin lỗi", "sự kiện & lễ kỷ niệm",
    "mua sắm & giảm giá", "đề xuất & kiến nghị", "dịch vụ khách hàng",
    "tài chính & ngân sách", "bất động sản", "tuyển dụng & nhân sự", "du lịch & đi lại",
    # Part 1-4 Listening Context Topics
    "văn phòng & công sở", "giao thông & di chuyển", "nhà hàng & ăn uống",
    "mua sắm", "y tế & sức khỏe", "công nghệ & thiết bị", "hội nghị & sự kiện",
    "khác / chưa phân loại"
]

@router.get("")
def list_vocabulary(
    document_id: Optional[int] = None,
    appears_in_part: Optional[str] = None,
    topic_category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    db: Annotated[Session, Depends(get_db)] = None # type: ignore
) -> Dict[str, Any]:
    """Returns paginated vocabulary items with associated SRS flashcard progress."""
    query = db.query(Vocabulary, Flashcard).outerjoin(Flashcard, Vocabulary.id == Flashcard.vocabulary_id)

    if document_id is not None:
        query = query.filter(Vocabulary.source_document_id == document_id)
    if appears_in_part:
        query = query.filter(Vocabulary.appears_in_part.ilike(f"%{appears_in_part}%"))
    if topic_category:
        query = query.filter(Vocabulary.topic_category.ilike(f"%{topic_category}%"))
    if search:
        query = query.filter(
            (Vocabulary.word.ilike(f"%{search}%")) | (Vocabulary.meaning_vi.ilike(f"%{search}%"))
        )

    total_count = query.count()
    offset = (page - 1) * limit

    results = query.order_by(Vocabulary.frequency_count.desc(), Vocabulary.word.asc()).offset(offset).limit(limit).all()

    items = []
    for vocab, flashcard in results:
        items.append({
            "id": vocab.id,
            "word": vocab.word,
            "ipa": vocab.ipa,
            "part_of_speech": vocab.part_of_speech,
            "meaning_vi": vocab.meaning_vi,
            "example_sentence": vocab.example_sentence,
            "source_document_id": vocab.source_document_id,
            "appears_in_part": vocab.appears_in_part,
            "topic_category": vocab.topic_category or "khác / chưa phân loại",
            "frequency_count": vocab.frequency_count,
            "srs_level": flashcard.srs_level if flashcard else 0,
            "next_review_at": flashcard.next_review_at if flashcard else None
        })

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "items": items
    }

@router.get("/topics/albums")
def get_topic_albums(db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Returns topic albums with statistics: total_words count and learned_words count (srs_level >= 3).
    Optimized: Single SQL query with GROUP BY and in-memory taxonomy grouping (0 extra queries).
    """
    stats_rows = db.query(
        Vocabulary.topic_category,
        func.count(Vocabulary.id).label("total_words"),
        func.sum(case((Flashcard.srs_level >= 3, 1), else_=0)).label("learned_words")
    ).outerjoin(Flashcard, Vocabulary.id == Flashcard.vocabulary_id).group_by(Vocabulary.topic_category).all()

    category_map: Dict[str, Dict[str, int]] = {}
    for topic_cat, total_cnt, learned_cnt in stats_rows:
        if topic_cat:
            category_map[topic_cat.strip()] = {
                "total": total_cnt or 0,
                "learned": int(learned_cnt or 0)
            }

    albums = []
    seen_categories = set()

    for topic in TAXONOMY_TOPICS:
        matched_total = 0
        matched_learned = 0
        for cat_name, stats in category_map.items():
            if topic.lower() in cat_name.lower():
                matched_total += stats["total"]
                matched_learned += stats["learned"]
                seen_categories.add(cat_name)

        if matched_total > 0:
            albums.append({
                "topic_category": topic,
                "total_words": matched_total,
                "learned_words": matched_learned
            })

    for cat_name, stats in category_map.items():
        if cat_name not in seen_categories and stats["total"] > 0:
            albums.append({
                "topic_category": cat_name,
                "total_words": stats["total"],
                "learned_words": stats["learned"]
            })

    return {
        "total_albums": len(albums),
        "albums": albums
    }

@router.get("/{vocab_id}")
def get_vocab_detail(vocab_id: int, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """Fetches full vocabulary entry details including synonyms, antonyms, and review interval."""
    result = db.query(Vocabulary, Flashcard).outerjoin(
        Flashcard, Vocabulary.id == Flashcard.vocabulary_id
    ).filter(Vocabulary.id == vocab_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy từ vựng")

    vocab, flashcard = result
    return {
        "id": vocab.id,
        "word": vocab.word,
        "ipa": vocab.ipa,
        "part_of_speech": vocab.part_of_speech,
        "meaning_vi": vocab.meaning_vi,
        "example_sentence": vocab.example_sentence,
        "source_document_id": vocab.source_document_id,
        "appears_in_part": vocab.appears_in_part,
        "topic_category": vocab.topic_category or "khác / chưa phân loại",
        "frequency_count": vocab.frequency_count,
        "srs_level": flashcard.srs_level if flashcard else 0,
        "next_review_at": flashcard.next_review_at if flashcard else None
    }


@router.post("/lookup")
def lookup_vocabulary_word(req: VocabularyLookupRequest, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Module 16.1: Context lookup for highlighted text.
    First checks DB (0 API tokens spent). If missing, queries Gemini API 1 time and saves to DB.
    """
    try:
        data = lookup_word_in_context(db, req.word, req.context_sentence, req.document_id)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Lỗi khi tra nghĩa từ vựng: {str(e)}"
        )


@router.post("/suggest-related")
def suggest_related_vocabulary(req: RelatedVocabRequest, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Module 16.2: Suggests 3-5 related TOEIC business terms for a given word.
    Uses Gemini general business knowledge (0 copyright violation of proprietary ETS lists).
    Caches suggested terms in SQLite DB.
    """
    try:
        data = get_related_vocabulary_suggestions(db, req.word, req.topic_category)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Lỗi khi gợi ý từ vựng liên quan: {str(e)}"
        )
