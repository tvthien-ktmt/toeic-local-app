import os
import io
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from typing import List, Tuple, Dict, Any

# Configure Tesseract binary path if installed on Windows
POSSIBLE_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe")
]
for p in POSSIBLE_TESSERACT_PATHS:
    if os.path.exists(p):
        pytesseract.pytesseract.tesseract_cmd = p
        break

_EASYOCR_READER = None

def get_easyocr_reader():
    global _EASYOCR_READER
    if _EASYOCR_READER is None:
        try:
            import easyocr
            print("[OCR SERVICE] Initializing EasyOCR Reader (CPU mode)...")
            _EASYOCR_READER = easyocr.Reader(['en'], gpu=False)
        except Exception as e:
            print(f"[OCR SERVICE WARNING] Could not initialize EasyOCR: {e}")
            _EASYOCR_READER = False
    return _EASYOCR_READER if _EASYOCR_READER is not False else None


def is_scanned_pdf(markdown_text: str, page_count: int = 1) -> bool:
    """
    Determines if PDF is a scanned image without a valid text layer.
    Only flags as scanned if extracted text length is virtually empty (< 300 total chars).
    """
    if not markdown_text or not markdown_text.strip():
        return True
    if "Lỗi khi chuyển đổi file" in markdown_text or "conversion_failed" in markdown_text:
        return True
    
    clean = markdown_text.replace("#", "").replace("*", "").replace("\n", "").strip()
    if len(clean) < 300:
        return True
    return False


def render_pdf_page_to_image(pdf_doc: fitz.Document, page_num: int, dpi: int = 300) -> Image.Image:
    """
    Renders a PDF page to a high-resolution PIL Image (default 300 DPI).
    """
    page = pdf_doc.load_page(page_num)
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return img


def detect_two_column_layout(page: fitz.Page) -> bool:
    """
    Detects if page has 2-column TOEIC layout (Part 5/6 questions side by side).
    Handles both text-layer PDFs and pure scanned bitmap PDFs.
    """
    blocks = page.get_text("blocks")
    rect = page.rect
    
    if not blocks or len(blocks) < 2:
        # Fallback for 0% text layer bitmap scanned PDFs:
        # Standard TOEIC Part 5/6 reading exam pages have standard portrait aspect ratio (width > 400, height > 600)
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
    """
    # 1. Primary: EasyOCR
    try:
        import numpy as np
        reader = get_easyocr_reader()
        if reader:
            img_np = np.array(img)
            results = reader.readtext(img_np, detail=0)
            if results:
                text = "\n".join(results)
                if text and len(text.strip()) > 5:
                    return text.strip()
    except Exception as ex:
        print(f"[OCR WARNING] EasyOCR note: {ex}")

    # 2. Fallback: PyTesseract PSM 6
    try:
        text = pytesseract.image_to_string(img, lang="eng", config="--psm 6")
        if text and len(text.strip()) > 5:
            return text.strip()
    except Exception:
        pass

    # 3. Fallback: PyTesseract PSM 3
    try:
        text = pytesseract.image_to_string(img, lang="eng", config="--psm 3")
        if text and len(text.strip()) > 5:
            return text.strip()
    except Exception:
        pass

    return ""


def extract_pdf_with_local_ocr(pdf_bytes: bytes, filename: str) -> str:
    """
    Full Local 0-AI-Token OCR processing pipeline for scanned PDFs.
    Separates 2-column layouts to preserve correct question order (Q101 -> Q102 -> Q103).
    """
    print(f"[MODE: LOCAL_OCR] Executing Local OCR pipeline for '{filename}' (0 AI tokens spent).")
    
    pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(pdf_doc)
    full_markdown_parts = [f"# {filename} (OCR Processed)\n"]

    for page_idx in range(page_count):
        page = pdf_doc.load_page(page_idx)
        is_two_col = detect_two_column_layout(page)

        print(f" -> Page {page_idx + 1}/{page_count}: {'2-Column Layout' if is_two_col else 'Single-Column Layout'}")

        if is_two_col:
            rect = page.rect
            x_mid = rect.width / 2.0
            left_rect = fitz.Rect(0, 0, x_mid, rect.height)
            right_rect = fitz.Rect(x_mid, 0, rect.width, rect.height)

            left_text = page.get_text("text", clip=left_rect).strip()
            right_text = page.get_text("text", clip=right_rect).strip()

            img = None
            if len(left_text) < 15 or len(right_text) < 15:
                img = render_pdf_page_to_image(pdf_doc, page_idx, dpi=300)
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
                full_markdown_parts.append(f"\n## Page {page_idx + 1} - Left Column\n{left_text}")
            if right_text:
                full_markdown_parts.append(f"\n## Page {page_idx + 1} - Right Column\n{right_text}")
        else:
            page_text = page.get_text("text").strip()
            if len(page_text) < 15:
                img = render_pdf_page_to_image(pdf_doc, page_idx, dpi=300)
                page_text = ocr_image_local(img)

            if page_text:
                full_markdown_parts.append(f"\n## Page {page_idx + 1}\n{page_text}")

    pdf_doc.close()
    result_markdown = "\n".join(full_markdown_parts)
    return result_markdown
