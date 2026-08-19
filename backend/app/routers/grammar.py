from typing import Dict, Any, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..services.grammar_service import get_or_create_grammar_reference

router = APIRouter(prefix="/api/grammar-reference", tags=["grammar-reference"])

@router.get("/{topic_name}")
def get_grammar_reference(topic_name: str, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """
    Module 17: Returns Grammar Quick Reference Card for a specified grammar_topic.
    Reads from SQLite DB (0 API tokens spent on cache hit).
    If topic is new, queries Gemini API 1 time and caches result forever.
    """
    try:
        data = get_or_create_grammar_reference(db, topic_name)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tra cứu thẻ ôn nhanh ngữ pháp: {str(e)}"
        )
