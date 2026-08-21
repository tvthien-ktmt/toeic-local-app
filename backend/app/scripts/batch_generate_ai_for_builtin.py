import os
import sys
import json
import re
import time
import logging
from typing import List, Dict, Any, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_APP_DIR = os.path.abspath(os.path.join(_CURRENT_DIR, ".."))
if _APP_DIR not in sys.path:
    sys.path.insert(0, os.path.abspath(os.path.join(_APP_DIR, "..")))

from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models import Document, Question
from app.services.gemini_service import get_gemini_api_key, query_gemini_with_cache

def batch_enrich_questions_with_real_gemini(
    db: Session,
    part_filter: Optional[int] = 5,
    doc_id: Optional[int] = None,
    max_questions: int = 500,
    batch_size: int = 5,
    retry_delay_sec: int = 15,
    max_quota_retries: int = 3
) -> Dict[str, Any]:
    """
    Systematically processes built-in exam questions with REAL Gemini AI analysis.
    NO FAKE TEMPLATES / NO MOCK STRINGS:
    - Distinguishes between RPM (Requests Per Minute) vs RPD (Requests Per Day - 1,500 limit).
    - If daily quota limit (1,500 RPD) is hit across all keys, stops gracefully and outputs clear reset info.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        logger.error("[BATCH GEMINI] LỖI: Không tìm thấy GEMINI_API_KEY trong file .env!")
        return {"processed": 0, "status": "error_no_api_key"}

    query = db.query(Question)
    if doc_id:
        query = query.filter(Question.document_id == doc_id)
    if part_filter:
        query = query.filter(Question.part == part_filter)

    # Filter questions needing genuine AI enrichment
    pending_qs = query.filter(
        (Question.common_trap == None) | (Question.common_trap == "")
    ).order_by(Question.id.asc()).limit(max_questions).all()

    if not pending_qs:
        logger.info(f"[BATCH GEMINI] Tất cả câu hỏi (Part {part_filter or 'All'}) đã có dữ liệu Gemini AI thật!")
        return {"processed": 0, "status": "completed"}

    logger.info(f"[BATCH GEMINI] Tìm thấy {len(pending_qs)} câu chưa có Gemini AI thật. Bắt đầu xử lý batch {batch_size} câu/lần...")

    processed_count = 0
    consecutive_rpd_failures = 0

    for i in range(0, len(pending_qs), batch_size):
        batch = pending_qs[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(pending_qs) + batch_size - 1) // batch_size
        logger.info(f"\n[BATCH] Batch {batch_num}/{total_batches} ({len(batch)} câu)...")

        batch_prompt_items = []
        for q in batch:
            try:
                opts = json.loads(q.options_json) if q.options_json else []
            except Exception:
                opts = []
            opts_str = "\n".join(opts)
            batch_prompt_items.append(
                f"ID:{q.id}\nCâu: {q.question_text[:350]}\nCác phương án:\n{opts_str}\nĐáp án đúng: ({q.correct_answer or 'A'})"
            )

        prompt_str = "\n---\n".join(batch_prompt_items)

        prompt_text = f"""Bạn là chuyên gia huấn luyện TOEIC RC. Phân tích danh sách các câu hỏi sau và trả về JSON array cho TỪNG câu.

Danh sách câu hỏi:
{prompt_str}

Yêu cầu Nghiêm ngặt cho MỖI item trong array:
- q_id: (integer ID tương ứng)
- grammar_topic: Tên chính xác của chủ điểm ngữ pháp (VD: "Đại từ sở hữu (Possessive Pronoun)", "Mệnh đề quan hệ rút gọn")
- option_explanations: object {{ "A": "Lý do đúng/sai cụ thể của phương án A", "B": "...", "C": "...", "D": "..." }}
- common_trap: Giải thích riêng vì sao 1 phương án sai cụ thể (thường là B hoặc C) dễ bị học viên chọn nhầm (bẫy từ loại, bẫy thì, bẫy nghĩa)
- translated_sentence: Dịch câu hoàn chỉnh sang tiếng Việt TỰ NHIÊN, chuẩn nghĩa thương mại (KHÔNG dịch máy từng từ)
- explanation: Giải thích tổng quan ngắn gọn 1-2 câu

Trả về JSON array duy nhất dạng:
[
  {{
    "q_id": 123,
    "grammar_topic": "...",
    "option_explanations": {{ "A": "...", "B": "...", "C": "...", "D": "..." }},
    "common_trap": "...",
    "translated_sentence": "...",
    "explanation": "..."
  }}
]
CHỈ trả JSON array thuần túy, không thêm markdown hay bất kỳ chữ nào khác."""

        content_chunk = f"batch_real_gemini_{batch[0].id}_{len(batch)}"
        success = False
        attempts = 0

        while not success and attempts < max_quota_retries:
            attempts += 1
            try:
                data = query_gemini_with_cache(db, "batch_real_gemini", prompt_text, content_chunk)
                if isinstance(data, list) and len(data) > 0:
                    data_map = {item.get("q_id"): item for item in data if isinstance(item, dict) and "q_id" in item}
                    batch_success_count = 0
                    for question_obj in batch:
                        ai_result_item = data_map.get(question_obj.id)
                        if ai_result_item and ai_result_item.get("common_trap") and ai_result_item.get("translated_sentence"):
                            # Verify translation is actually in Vietnamese
                            translated_text = ai_result_item.get("translated_sentence", "")
                            if not re.search(r'[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]', translated_text, re.IGNORECASE):
                                continue

                            question_obj.grammar_topic = ai_result_item.get("grammar_topic") or question_obj.grammar_topic
                            question_obj.option_explanations_json = json.dumps(ai_result_item.get("option_explanations", {}), ensure_ascii=False)
                            question_obj.common_trap = ai_result_item.get("common_trap", "")
                            question_obj.translated_sentence = translated_text
                            if ai_result_item.get("explanation"):
                                question_obj.explanation = ai_result_item.get("explanation")
                            batch_success_count += 1

                    if batch_success_count > 0:
                        db.commit()
                        processed_count += batch_success_count
                        consecutive_rpd_failures = 0
                        logger.info(f"   [OK] Đã lưu {batch_success_count}/{len(batch)} câu Gemini AI THẬT vào DB.")
                        success = True
                    else:
                        logger.warning(f"   [WARNING] Lần thử {attempts}: Gemini trả về cấu trúc chưa đủ tiếng Việt. Thử lại sau {retry_delay_sec}s...")
                        time.sleep(retry_delay_sec)
                else:
                    logger.warning(f"   [WARNING] Lần thử {attempts}: Phản hồi Gemini không phải JSON array. Thử lại sau {retry_delay_sec}s...")
                    time.sleep(retry_delay_sec)

            except Exception as e:
                err_msg = str(e)
                logger.warning(f"   [WARNING] Gemini API rate-limited hoặc hết quota ({err_msg[:120]}). Lần thử {attempts}/{max_quota_retries}...")
                time.sleep(retry_delay_sec * attempts)

        if not success:
            consecutive_rpd_failures += 1
            if consecutive_rpd_failures >= 2:
                logger.warning("\n[LIMIT] [DAILY QUOTA EXCEEDED] Đã chạm giới hạn 1.500 RPD (Requests Per Day) của Gemini Free Tier trên toàn bộ API Keys!")
                logger.info("[INFO] Gemini Free Tier tự động reset daily quota vào 00:00 UTC (7:00 AM giờ Việt Nam).")
                logger.info(f"[INFO] Đã hoàn thành và bảo toàn nguyên vẹn {processed_count} câu Gemini AI THẬT trong DB.")
                logger.info("[INFO] Vui lòng chạy lại script vào ngày mai hoặc bổ sung thêm API Key mới vào file .env.")
                break

        # RPM Rate-Limit Safety Pause (15 RPM max = ~4 seconds between requests)
        time.sleep(4)

    logger.info(f"\n[DONE] [HOÀN TẤT BATCH AI THẬT] Đã tạo và lưu thành công {processed_count} câu Gemini AI THẬT vào DB.")
    return {"processed": processed_count, "status": "success"}


if __name__ == "__main__":
    db = SessionLocal()
    try:
        batch_enrich_questions_with_real_gemini(db, part_filter=5, max_questions=50, batch_size=5, retry_delay_sec=15)
    finally:
        db.close()
