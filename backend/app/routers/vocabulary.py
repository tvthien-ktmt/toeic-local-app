from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..db import get_db
from ..models import Vocabulary, Flashcard

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
    db: Session = Depends(get_db)
):
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
def get_topic_albums(db: Session = Depends(get_db)):
    """
    Returns topic albums with statistics: total_words count and learned_words count (srs_level >= 3).
    """
    albums = []
    for topic in TAXONOMY_TOPICS:
        query = db.query(Vocabulary, Flashcard).outerjoin(Flashcard, Vocabulary.id == Flashcard.vocabulary_id).filter(
            Vocabulary.topic_category.ilike(f"%{topic}%")
        )
        total = query.count()
        learned = query.filter(Flashcard.srs_level >= 3).count()

        if total > 0:
            albums.append({
                "topic_category": topic,
                "total_words": total,
                "learned_words": learned
            })

    # Also query any custom categories present in DB not in default TAXONOMY_TOPICS
    db_topics = db.query(Vocabulary.topic_category).distinct().all()
    for (t_name,) in db_topics:
        if t_name and not any(a["topic_category"].lower() == t_name.lower() for a in albums):
            query = db.query(Vocabulary, Flashcard).outerjoin(Flashcard, Vocabulary.id == Flashcard.vocabulary_id).filter(
                Vocabulary.topic_category == t_name
            )
            albums.append({
                "topic_category": t_name,
                "total_words": query.count(),
                "learned_words": query.filter(Flashcard.srs_level >= 3).count()
            })

    return {
        "total_albums": len(albums),
        "albums": albums
    }

@router.get("/{vocab_id}")
def get_vocab_detail(vocab_id: int, db: Session = Depends(get_db)):
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
