import os
import sys
import re
import logging
from typing import List, Dict, Any, Optional, Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from ..db import get_db, SessionLocal
from ..models import Document, Question, Vocabulary, Flashcard, PracticeAttempt
from ..schemas import DocumentResponse, DocumentSummary
from ..services.markitdown_service import compute_hash, convert_pdf_to_markdown
from ..services.extraction_service import process_document_extraction

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["documents"])

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

def process_document_background(doc_id: int, content_bytes: bytes, filename: str) -> None:
    """
    Background worker function for asynchronous OCR / MarkItDown conversion & AI extraction.
    Does NOT block the main HTTP server thread.
    """
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return

        logger.info(f"[BACKGROUND TASK] Starting asynchronous conversion for Document #{doc_id} ('{filename}')...")
        markdown_text = convert_pdf_to_markdown(content_bytes, filename)

        if not markdown_text or "conversion_failed" in markdown_text:
            doc.status = "conversion_failed"
            doc.markdown_content = markdown_text or "# Conversion Failed"
        else:
            doc.markdown_content = markdown_text
            doc.status = "converted"
            db.commit()

            # Auto-trigger AI extraction
            logger.info(f"[BACKGROUND TASK] Auto-triggering AI extraction for Document #{doc_id}...")
            process_document_extraction(db, doc.id)

        db.commit()
        logger.info(f"[BACKGROUND TASK COMPLETED] Document #{doc_id} is ready with status='{doc.status}'!")

    except Exception as e:
        logger.error(f"[BACKGROUND TASK ERROR] Document #{doc_id} failed: {e}")
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = "conversion_failed"
            doc.markdown_content = f"# Lỗi xử lý nền\n\n*{str(e)}*"
            db.commit()
    finally:
        db.close()


@router.post("/{doc_id}/extract")
def extract_document_questions_and_vocab(doc_id: int, db: Annotated[Session, Depends(get_db)]) -> Dict[str, Any]:
    """Triggers AI/regex question and vocabulary extraction on an uploaded document."""
    try:
        extraction_result = process_document_extraction(db, doc_id)
        return extraction_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi trích xuất dữ liệu từ tài liệu: {str(e)}"
        )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    doc_type: str = Form("RC_EXAM"),
    db: Annotated[Session, Depends(get_db)] = None # type: ignore
) -> Document:
    """Accepts a PDF/MD file upload, computes SHA-256 hash for deduplication, and schedules OCR in background."""
    if doc_type not in ["RC_EXAM", "LC_TRANSCRIPT"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="doc_type phải là RC_EXAM hoặc LC_TRANSCRIPT"
        )

    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File rỗng!"
        )

    file_hash = compute_hash(content_bytes)

    # Check if document already uploaded
    existing_doc = db.query(Document).filter(Document.content_hash == file_hash).first()
    if existing_doc:
        # Generalized check: if existing doc is broken, conversion failed, or extracted with 0 questions/vocab, wipe & re-process!
        q_count = db.query(Question).filter(Question.document_id == existing_doc.id).count()
        v_count = db.query(Vocabulary).filter(Vocabulary.source_document_id == existing_doc.id).count()
        is_broken = (
            not existing_doc.markdown_content or
            len(existing_doc.markdown_content) < 500 or
            existing_doc.status == "conversion_failed" or
            (existing_doc.status == "extracted" and q_count == 0 and v_count == 0)
        )
        if is_broken:
            logger.info(f"[RE-PROCESSING BROKEN DOC] Document #{existing_doc.id} ('{file.filename}') has broken status/data. Wiping old record and re-processing...")
            v_subq = db.query(Vocabulary.id).filter(Vocabulary.source_document_id == existing_doc.id).subquery()
            db.query(Flashcard).filter(Flashcard.vocabulary_id.in_(v_subq)).delete(synchronize_session=False)
            db.query(Question).filter(Question.document_id == existing_doc.id).delete()
            db.query(Vocabulary).filter(Vocabulary.source_document_id == existing_doc.id).delete()
            db.delete(existing_doc)
            db.commit()
        else:
            return existing_doc

    # Create new document with status = "processing" immediately
    new_doc = Document(
        filename=file.filename,
        doc_type=doc_type,
        content_hash=file_hash,
        markdown_content="*Đang xử lý OCR và trích xuất ở nền (Processing in background)...*",
        status="processing"
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Save uploaded binary file to disk (sanitize filename to prevent Path Traversal)
    safe_filename = os.path.basename(file.filename)
    safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', safe_filename)
    save_path = os.path.join(UPLOADS_DIR, f"{new_doc.id}_{safe_filename}")
    try:
        with open(save_path, "wb") as save_f:
            save_f.write(content_bytes)
        logger.info(f"Saved uploaded file to disk: '{save_path}'")
    except Exception as ex:
        logger.warning(f"File save note: {ex}")

    # Schedule background processing task
    background_tasks.add_task(process_document_background, new_doc.id, content_bytes, safe_filename)

    return new_doc


@router.get("", response_model=List[DocumentSummary])
def list_documents(db: Annotated[Session, Depends(get_db)]) -> List[DocumentSummary]:
    """Returns a list of all user-uploaded exam and transcript documents."""
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    summaries = []
    for d in docs:
        summaries.append(DocumentSummary(
            id=d.id,
            filename=d.filename,
            doc_type=d.doc_type,
            content_hash=d.content_hash,
            status=d.status,
            uploaded_at=d.uploaded_at,
            markdown_length=len(d.markdown_content) if d.markdown_content else 0
        ))
    return summaries


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Annotated[Session, Depends(get_db)]) -> Document:
    """Fetches details and raw markdown content of a specific uploaded document."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài liệu"
        )
    return doc


@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Annotated[Session, Depends(get_db)]) -> Dict[str, str]:
    """Deletes a document and cascade-deletes its associated questions, vocabularies, and flashcards."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài liệu"
        )
    
    # Cascade delete all questions, vocabulary, and flashcards associated with doc
    v_subq = db.query(Vocabulary.id).filter(Vocabulary.source_document_id == doc.id).subquery()
    db.query(Flashcard).filter(Flashcard.vocabulary_id.in_(v_subq)).delete(synchronize_session=False)
    db.query(Question).filter(Question.document_id == doc.id).delete()
    db.query(Vocabulary).filter(Vocabulary.source_document_id == doc.id).delete()
    db.delete(doc)
    db.commit()
    return {"message": f"Đã xóa tài liệu #{doc_id}"}
