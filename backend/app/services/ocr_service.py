import os
import io
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from typing import List, Tuple, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor

def is_scanned_pdf(markdown_text: str, page_count: int = 1) -> bool:
    """
    Checks if PDF is scanned based on extracted markdown length per page.
    If text length per page < 100 characters, it is treated as a scanned PDF requiring OCR.
    """
    if not markdown_text or not markdown_text.strip():
        return True
    avg_chars_per_page = len(markdown_text.strip()) / max(page_count, 1)
    return avg_chars_per_page < 100

# Lazy-loaded EasyOCR reader instance
_easyocr_reader = None

def get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            print("[OCR SERVICE] Initializing EasyOCR engine (CPU mode)...")
            _easyocr_reader = easyocr.Reader(['en'], gpu=False)
        except Exception as e:
            print(f"[OCR SERVICE WARNING] Failed to initialize EasyOCR: {e}")
            _easyocr_reader = False
    return _easyocr_reader if _easyocr_reader is not False else None


def render_pdf_page_to_image(pdf_doc: fitz.Document, page_num: int, dpi: int = 250) -> Image.Image:
    """
    Renders a specific PDF page to grayscale PIL Image at specified high DPI (250 DPI).
    High DPI ensures zero lost articles ('a', 'the') and sharp character recognition.
    """
    page = pdf_doc.load_page(page_num)
    pix = page.get_pixmap(dpi=dpi, colorspace=fitz.csGRAY)
    img_bytes = pix.tobytes("png")
    return Image.open(io.BytesIO(img_bytes))


def detect_two_column_layout(page: fitz.Page) -> bool:
    """
    Detects if page has 2-column TOEIC layout (Part 5/6 questions side by side).
    """
    blocks = page.get_text("blocks")
    rect = page.rect
    
    if not blocks or len(blocks) < 2:
        if rect.width > 400 and rect.height > 600 and rect.height / max(rect.width, 1) > 1.2:
            return True
        return False
    
    x_mid = rect.width / 2.0
    left_blocks = 0
    right_blocks = 0

    for b in blocks:
        x0, y0, x1, y1 = b[:4]
        if x1 < x_mid + 30:
            left_blocks += 1
        elif x0 > x_mid - 30:
            right_blocks += 1

    return (left_blocks >= 1 and right_blocks >= 1)


def split_image_into_columns(img: Image.Image) -> Tuple[Image.Image, Image.Image]:
    """
    Splits image vertically into left and right half columns.
    """
    w, h = img.size
    mid_x = w // 2
    left_crop = img.crop((0, 0, mid_x, h))
    right_crop = img.crop((mid_x, 0, w, h))
    return left_crop, right_crop


def ocr_image_local(img: Image.Image) -> str:
    """
    Performs local OCR on PIL Image using EasyOCR (primary) and PyTesseract (fallback).
    Configured for maximum recognition accuracy.
    """
    # 1. Primary: EasyOCR
    try:
        import numpy as np
        reader = get_easyocr_reader()
        if reader:
            img_np = np.array(img)
            results = reader.readtext(img_np, detail=0, canvas_size=1600, paragraph=False)
            if results:
                text = "\n".join(results)
                if text and len(text.strip()) > 5:
                    return text.strip()
    except Exception as ex:
        print(f"[OCR WARNING] EasyOCR note: {ex}")

    # 2. Fallback: PyTesseract PSM 6
    try:
        text = pytesseract.image_to_string(img, lang="eng", config="--psm 6 --oem 1")
        if text and len(text.strip()) > 5:
            return text.strip()
    except Exception:
        pass

    # 3. Fallback: PyTesseract PSM 3
    try:
        text = pytesseract.image_to_string(img, lang="eng", config="--psm 3 --oem 1")
        if text and len(text.strip()) > 5:
            return text.strip()
    except Exception:
        pass

    return ""


def _process_single_page(args: Tuple[int, bytes]) -> Tuple[int, str]:
    """
    Worker function to process a single PDF page independently in parallel.
    Uses layout-sorted text block extraction (sort=True) for clean reading order.
    """
    page_idx, pdf_bytes = args
    pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = pdf_doc.load_page(page_idx)
    is_two_col = detect_two_column_layout(page)

    page_md_parts = []

    if is_two_col:
        rect = page.rect
        x_mid = rect.width / 2.0
        left_rect = fitz.Rect(0, 0, x_mid, rect.height)
        right_rect = fitz.Rect(x_mid, 0, rect.width, rect.height)

        # Use sort=True for clean natural top-to-bottom reading order
        left_blocks = page.get_text("blocks", clip=left_rect, sort=True)
        right_blocks = page.get_text("blocks", clip=right_rect, sort=True)

        left_text = "\n".join([b[4].strip() for b in left_blocks if len(b) > 4 and b[4].strip()]).strip()
        right_text = "\n".join([b[4].strip() for b in right_blocks if len(b) > 4 and b[4].strip()]).strip()

        img = None
        if len(left_text) < 15 or len(right_text) < 15:
            img = render_pdf_page_to_image(pdf_doc, page_idx, dpi=250)
            left_img, right_img = split_image_into_columns(img)

            if len(left_text) < 15:
                ocr_left = ocr_image_local(left_img)
                if ocr_left:
                    left_text = ocr_left

            if len(right_text) < 15:
                ocr_right = ocr_image_local(right_img)
                if ocr_right:
                    right_text = ocr_right

        if left_text:
            page_md_parts.append(f"\n## Page {page_idx + 1} - Left Column\n{left_text}")
        if right_text:
            page_md_parts.append(f"\n## Page {page_idx + 1} - Right Column\n{right_text}")
    else:
        blocks = page.get_text("blocks", sort=True)
        page_text = "\n".join([b[4].strip() for b in blocks if len(b) > 4 and b[4].strip()]).strip()
        if len(page_text) < 15:
            img = render_pdf_page_to_image(pdf_doc, page_idx, dpi=250)
            page_text = ocr_image_local(img)

        if page_text:
            page_md_parts.append(f"\n## Page {page_idx + 1}\n{page_text}")

    pdf_doc.close()
    return page_idx, "\n".join(page_md_parts)


def extract_pdf_with_local_ocr(pdf_bytes: bytes, filename: str) -> str:
    """
    Full Local 0-AI-Token OCR processing pipeline for scanned PDFs.
    Uses 250 DPI rendering + layout sorting for maximum recognition quality.
    """
    print(f"[MODE: LOCAL_OCR] Executing High-Precision Parallel Local OCR pipeline for '{filename}' (0 AI tokens spent).")
    
    pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(pdf_doc)
    pdf_doc.close()

    max_workers = min(4, os.cpu_count() or 4)
    print(f"[MODE: LOCAL_OCR] Spawning {max_workers} parallel workers across CPU cores...")

    tasks = [(idx, pdf_bytes) for idx in range(page_count)]
    page_results = {}

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for page_idx, page_md in executor.map(_process_single_page, tasks):
            page_results[page_idx] = page_md
            print(f" -> Page {page_idx + 1}/{page_count} OCR completed.")

    full_markdown_parts = [f"# {filename} (OCR Processed)\n"]
    for page_idx in range(page_count):
        if page_idx in page_results and page_results[page_idx]:
            full_markdown_parts.append(page_results[page_idx])

    result_markdown = "\n".join(full_markdown_parts)
    return result_markdown
