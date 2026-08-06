import json
import difflib
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Question, Vocabulary
from ..services.gemini_service import query_gemini_with_cache, get_gemini_api_key

router = APIRouter(prefix="/api/generate", tags=["generator"])

def generate_similar_question_logic(orig_q: Question, db: Session) -> Dict[str, Any]:
    api_key = get_gemini_api_key()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Cần GEMINI_API_KEY trong file .env để sử dụng tính năng sinh câu hỏi AI."
        )

    prompt_type = "generate_similar_question"
    prompt_text = f"""Dựa trên câu hỏi TOEIC gốc sau đây (giữ nguyên chủ điểm ngữ pháp '{orig_q.grammar_topic}' và cấu trúc), hãy tạo ra 1 câu hỏi mới.

Câu gốc: {orig_q.question_text}
Chủ điểm ngữ pháp: {orig_q.grammar_topic}

Yêu cầu nghiêm ngặt:
1. Cùng dạng ngữ pháp, độ khó tương đương.
2. KHÔNG trùng nghĩa câu gốc (đổi tên riêng, ngữ cảnh công ty/công việc).
3. Mọi đáp án lựa chọn sai (distractors) phải ĐÚNG VỀ CẤU TRÚC NGỮ PHÁP (có thể điền vào vị trí trống mà không gây lỗi ngữ pháp thô thiển), nhưng SAI VỀ NGHĨA hoặc NGỮ CẢNH.
4. Trả về JSON object duy nhất:
{{
  "question_text": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_answer": "A" | "B" | "C" | "D",
  "explanation": "..."
}}
CHỈ trả JSON."""

    content_chunk = f"similar::{orig_q.id}::{orig_q.grammar_topic}"

    try:
        data = query_gemini_with_cache(db, prompt_type, prompt_text, content_chunk)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Gemini API tạm thời lỗi hoặc quá hạn rate limit. Vui lòng thử lại sau. ({e})"
        )

    opts = data.get("options", [])
    if not opts or not isinstance(opts, list) or len(opts) < 4:
        raise HTTPException(
            status_code=500,
            detail="Gemini API trả về cấu trúc câu hỏi không hợp lệ."
        )

    opts_str = json.dumps(opts, ensure_ascii=False)

    gen_q = Question(
        document_id=orig_q.document_id,
        part=orig_q.part,
        question_text=data.get("question_text", orig_q.question_text),
        options_json=opts_str,
        correct_answer=data.get("correct_answer", "A"),
        explanation=data.get("explanation", ""),
        grammar_topic=orig_q.grammar_topic,
        topic_tag=orig_q.topic_tag,
        is_generated=True,
        source_question_id=orig_q.id
    )
    db.add(gen_q)
    db.commit()
    db.refresh(gen_q)

    return {
        "id": gen_q.id,
        "source_question_id": orig_q.id,
        "question_text": gen_q.question_text,
        "options": opts,
        "correct_answer": gen_q.correct_answer,
        "explanation": gen_q.explanation,
        "grammar_topic": gen_q.grammar_topic,
        "is_generated": True
    }


@router.post("/similar/{question_id}")
def generate_similar_question_endpoint(
    question_id: int,
    db: Session = Depends(get_db)
):
    orig_q = db.query(Question).filter(Question.id == question_id).first()
    if not orig_q:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi gốc")

    return generate_similar_question_logic(orig_q, db)


class StudyRecommendationRequest(BaseModel):
    score_correct: int
    score_total: int
    weak_grammar_topics: List[str] = []
    weak_parts: List[int] = []


class QuestionExplanationRequest(BaseModel):
    question_id: Optional[int] = None
    question_text: str
    options: List[str]
    correct_answer: str
    user_answer: Optional[str] = None
    grammar_topic: Optional[str] = None


@router.post("/explain-question")
def generate_question_explanation(req: QuestionExplanationRequest, db: Session = Depends(get_db)):
    """
    Generates AI detailed explanation & grammar knowledge recall for any question (correct or incorrect).
    """
    # 1. Try fetching existing Question from DB if question_id provided
    db_q = None
    if req.question_id:
        db_q = db.query(Question).filter(Question.id == req.question_id).first()

    api_key = get_gemini_api_key()
    
    # Standard prompt for Gemini
    prompt_type = "explain_question"
    user_ans_str = req.user_answer if req.user_answer else "Không chọn"
    g_topic = req.grammar_topic or (db_q.grammar_topic if db_q else "Ngữ pháp / Đọc hiểu TOEIC")
    
    opts_str = "\n".join(req.options) if req.options else "A. Phương án A\nB. Phương án B\nC. Phương án C\nD. Phương án D"
    
    prompt_text = f"""Bạn là một chuyên gia huấn luyện TOEIC RC hàng đầu. Hãy phân tích chi tiết câu hỏi TOEIC sau đây và cung cấp phần GIẢI THÍCH + NHẮC LẠI KIẾN THỨC CỐT LÕI.

Câu hỏi: {req.question_text}
Các phương án:
{opts_str}

Đáp án đúng: ({req.correct_answer})
Học viên đã chọn: ({user_ans_str})
Chủ điểm ngữ pháp: {g_topic}

Hãy đưa ra giải thích chuyên sâu.
Trả về JSON object duy nhất với cấu trúc:
{{
  "detailed_explanation": "Phân tích vì sao đáp án ({req.correct_answer}) là đúng và tại sao từng phương án còn lại chưa đúng.",
  "grammar_recall": "Nhắc lại kiến thức/quy tắc ngữ pháp cốt lõi liên quan (ví dụ: Vị trí của trạng từ, Cấu trúc câu điều kiện, Mệnh đề quan hệ rút gọn, v.v.). Trình bày rõ ràng, dễ nhớ.",
  "exam_tip": "Mẹo suy luận nhanh khi gặp dạng bài này trong đề thi (1-2 câu ngắn gọn).",
  "sentence_translation": "Bản dịch tiếng Việt hoàn chỉnh và chuẩn nghĩa của câu.",
  "key_vocabulary": [
    {{"word": "Từ/Cụm từ 1", "meaning": "Nghĩa tiếng Việt"}},
    {{"word": "Từ/Cụm từ 2", "meaning": "Nghĩa tiếng Việt"}}
  ]
}}
CHỈ trả JSON object duy nhất, không thêm bớt markdown."""

    content_chunk = f"explain::{req.question_id}::{req.correct_answer}::{user_ans_str}::{hash(req.question_text)}"

    if api_key:
        try:
            data = query_gemini_with_cache(db, prompt_type, prompt_text, content_chunk)
            if isinstance(data, dict) and "detailed_explanation" in data:
                return {
                    "status": "success",
                    "source": "gemini_ai",
                    "explanation": data
                }
        except Exception as e:
            print(f"[AI EXPLAIN] Gemini call failed/rate limited: {e}")

    # Fallback response using DB question data or fallback template
    fallback_exp = db_q.explanation if (db_q and db_q.explanation) else f"Đáp án đúng là ({req.correct_answer})."
    fallback_trans = db_q.translated_sentence if (db_q and db_q.translated_sentence) else ""

    return {
        "status": "success",
        "source": "fallback",
        "explanation": {
            "detailed_explanation": f"{fallback_exp} Phương án ({req.correct_answer}) chính xác về cả cấu trúc lẫn ngữ cảnh trong câu.",
            "grammar_recall": f"Chủ điểm ngữ pháp: {g_topic}. Hãy lưu ý cấu trúc từ loại và ngữ cảnh ngữ pháp của dạng câu hỏi này.",
            "exam_tip": f"Nhìn nhanh vị trí cần điền trong câu và loại trừ các đáp án sai ngữ pháp trước.",
            "sentence_translation": fallback_trans or req.question_text,
            "key_vocabulary": []
        }
    }


@router.post("/study-recommendations")
def generate_study_recommendations(req: StudyRecommendationRequest, db: Session = Depends(get_db)):
    """
    Generates personalized AI study advice after exam completion based on user score & weak points.
    Discloses overall evaluation, weak grammar topics to review, and recommended Flashcard categories.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Cần GEMINI_API_KEY trong file .env để tạo gợi ý học tập AI."
        )

    prompt_type = "study_recommendations"
    acc = round((req.score_correct / max(1, req.score_total)) * 100, 1)

    weak_g_str = ", ".join(req.weak_grammar_topics) if req.weak_grammar_topics else "không có chủ điểm đặc biệt yếu"
    weak_p_str = ", ".join([f"Part {p}" for p in req.weak_parts]) if req.weak_parts else "không có Part nào quá yếu"

    prompt_text = f"""Bạn là cố vấn chiến lược luyện thi TOEIC đỉnh cao.
Một học viên vừa hoàn thành bài thi với kết quả:
- Điểm số: {req.score_correct}/{req.score_total} câu ({acc}% chính xác).
- Các chủ điểm ngữ pháp làm sai nhiều nhất: {weak_g_str}.
- Các Part làm chưa tốt: {weak_p_str}.

Hãy đưa ra LỜI KHUYÊN CHIẾN LƯỢC ÔN LUYỆN DÀNH RIÊNG CHO HỌC VIÊN NÀY.
Trả về JSON object duy nhất:
{{
  "overall_evaluation": "1-2 câu đánh giá tổng quan phong độ và ước tính khoảng điểm TOEIC hiện tại",
  "target_action_plan": [
    "Hành động cụ thể 1",
    "Hành động cụ thể 2"
  ],
  "grammar_to_review": ["danh sách các chủ điểm ngữ pháp cụ thể cần ôn lại ngay trên thẻ Ôn Nhanh"],
  "recommended_vocab_focus": ["chủ đề từ vựng thương mại cần ôn tập thêm trên Flashcard"]
}}
CHỈ trả JSON object."""

    content_chunk = f"advice::{req.score_correct}::{req.score_total}::{weak_g_str}::{weak_p_str}"

    try:
        data = query_gemini_with_cache(db, prompt_type, prompt_text, content_chunk)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Gemini API tạm thời lỗi hoặc quá hạn rate limit. Vui lòng thử lại sau. ({e})"
        )

    return data

