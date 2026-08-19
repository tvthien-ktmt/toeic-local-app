import hashlib
import tempfile
import os
import logging
import fitz
from markitdown import MarkItDown
from .ocr_service import is_scanned_pdf, extract_pdf_with_local_ocr

logger = logging.getLogger(__name__)

def compute_hash(file_bytes: bytes) -> str:
    """Computes a SHA-256 hex digest of file bytes for idempotent document deduplication."""
    return hashlib.sha256(file_bytes).hexdigest()

def convert_pdf_to_markdown(file_bytes: bytes, filename: str) -> str:
    """
    Converts PDF bytes to Markdown using microsoft/markitdown.
    If PDF is scanned or image-based, falls back to 100% Local 2-Column OCR pipeline.
    """
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        ext = ".pdf"

    # Count pages using PyMuPDF
    try:
        pdf_doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(pdf_doc)
        pdf_doc.close()
    except Exception:
        page_count = 1

    markdown_text = ""

    # Write bytes to a temp file for MarkItDown to process
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        temp_file.write(file_bytes)
        temp_file_path = temp_file.name

    try:
        md = MarkItDown()
        result = md.convert(temp_file_path)
        markdown_text = result.text_content or ""
        logger.info(f"[MODE: MARKITDOWN] Converted '{filename}' using MarkItDown ({len(markdown_text)} chars).")
    except Exception as e:
        logger.warning(f"[MARKITDOWN WARNING] MarkItDown conversion note: {e}")
        markdown_text = ""
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as file_cleanup_err:
                logger.warning(f"Could not remove temporary file {temp_file_path}: {file_cleanup_err}")

    # Check if scanned PDF requires Local 2-Column OCR
    if is_scanned_pdf(markdown_text, page_count):
        logger.info(f"[MODE: LOCAL_OCR] PDF '{filename}' detected as scanned/image or low-text PDF ({len(markdown_text)} chars). Triggering Local 2-Column OCR...")
        markdown_text = extract_pdf_with_local_ocr(file_bytes, filename)
    else:
        logger.info(f"[MODE: TEXT_LAYER_OK] PDF '{filename}' has valid text layer ({len(markdown_text)} chars). Using MarkItDown output directly.")

    return markdown_text
