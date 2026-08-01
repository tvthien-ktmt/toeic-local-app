import hashlib
import tempfile
import os
import fitz
from markitdown import MarkItDown
from .ocr_service import is_scanned_pdf, extract_pdf_with_local_ocr

def compute_hash(file_bytes: bytes) -> str:
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
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        md = MarkItDown()
        result = md.convert(tmp_path)
        markdown_text = result.text_content or ""
        print(f"[MODE: MARKITDOWN] Converted '{filename}' using MarkItDown ({len(markdown_text)} chars).")
    except Exception as e:
        print(f"[MARKITDOWN WARNING] MarkItDown conversion note: {e}")
        markdown_text = ""
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    # Check if scanned PDF requires Local 2-Column OCR
    if is_scanned_pdf(markdown_text, page_count):
        print(f"[MODE: LOCAL_OCR] PDF '{filename}' detected as scanned/image or low-text PDF ({len(markdown_text)} chars). Triggering Local 2-Column OCR...")
        markdown_text = extract_pdf_with_local_ocr(file_bytes, filename)
    else:
        print(f"[MODE: TEXT_LAYER_OK] PDF '{filename}' has valid text layer ({len(markdown_text)} chars). Using MarkItDown output directly.")

    return markdown_text
