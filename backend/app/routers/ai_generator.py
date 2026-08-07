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
    Generates AI detailed explanation & grammar knowledge recall for any question.
    Uses DB cache first (0 latency), falls back to live Gemini with upgraded quality prompt.
    """
    # Fetch DB question for cached data
    db_q = None
    if req.question_id:
        db_q = db.query(Question).filter(Question.id == req.question_id).first()

    # If DB already has rich option_explanations (and not stub dashes "—") — return immediately (0 latency)
    if db_q and db_q.option_explanations_json:
        try:
            opt_exps = json.loads(db_q.option_explanations_json)
            has_real_explanations = isinstance(opt_exps, dict) and any(v and str(v).strip() not in ('—', '-') for v in opt_exps.values())
            if has_real_explanations:
                return {
                    "status": "success",
                    "source": "db_cache",
                    "explanation": {
                        "detailed_explanation": db_q.explanation or f"Đáp án đúng là ({req.correct_answer}).",
                        "grammar_recall": f"Chủ điểm: **{db_q.grammar_topic}**. Xem thẻ 'Ôn Nhanh' trên Dashboard để ôn lại công thức đầy đủ.",
                        "option_explanations": opt_exps,
                        "common_trap": db_q.common_trap,
                        "sentence_translation": db_q.translated_sentence or "",
                        "exam_tip": None,
                        "key_vocabulary": []
                    }
                }
        except Exception:
            pass

    api_key = get_gemini_api_key()

    # Upgraded prompt — specific, actionable, competitive quality
    prompt_type = "explain_question_v2"
    user_ans_str = req.user_answer if req.user_answer else "Không chọn"
    g_topic = req.grammar_topic or (db_q.grammar_topic if db_q else "Ngữ pháp TOEIC RC")
    opts_str = "\n".join(req.options) if req.options else ""

    prompt_text = f"""Bạn là chuyên gia luyện thi TOEIC RC hàng đầu. Phân tích câu hỏi TOEIC sau và trả về JSON CHÍNH XÁC theo cấu trúc yêu cầu.

Câu hỏi: {req.question_text[:600]}
Các phương án:
{opts_str}
Đáp án đúng: ({req.correct_answer})
Học viên đã chọn: ({user_ans_str})
Chủ điểm dự kiến: {g_topic}

Yêu cầu NGHIÊM NGẶT — mỗi trường phải cụ thể, không được chung chung:

1. grammar_topic: Tên chính xác và đầy đủ của chủ điểm (VD: "Đại từ sở hữu (Possessive Pronoun)" NOT chỉ "Pronoun")
2. grammar_recall: Nhắc lại công thức/quy tắc cốt lõi của chủ điểm này trong 2-3 câu ngắn gọn (format: "[Quy tắc chính]: ... [Ví dụ nhanh]: ...")
3. option_explanations: Giải thích RÕ RÀNG vì sao từng option SAI hoặc ĐÚNG — bắt buộc nêu lý do ngữ pháp/nghĩa CỤ THỂ của câu đó, KHÔNG ĐƯỢC nói chung chung "vì sai ngữ pháp"
4. common_trap: Nếu có 1 option sai mà học viên hay nhầm nhất (thường là option B hoặc option nào gần đúng nhất), giải thích RÕ vì sao học viên hay chọn nhầm option đó — đây là insight quan trọng nhất để tránh sai lần sau. Nếu không có bẫy đặc biệt, trả "".
5. sentence_translation: Dịch câu hoàn chỉnh (đã điền đáp án đúng) sang tiếng Việt TỰ NHIÊN, đúng ngữ cảnh công việc/thương mại — KHÔNG dịch máy từng từ.

Trả về JSON duy nhất:
{{
  "grammar_topic": "...",
  "grammar_recall": "...",
  "option_explanations": {{
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  }},
  "common_trap": "...",
  "sentence_translation": "...",
  "exam_tip": "Mẹo 1-2 câu để nhận dạng dạng bài này nhanh trong kỳ thi.",
  "key_vocabulary": []
}}
CHỈ trả JSON thuần túy, không markdown, không giải thích thêm."""

    # Use deterministic content_chunk (do NOT use Python built-in hash() which changes on process restart)
    clean_q_snippet = re.sub(r'\s+', ' ', req.question_text[:100]).strip()
    content_chunk = f"explain_v2::{req.question_id}::{req.correct_answer}::{user_ans_str}::{clean_q_snippet}"

    if api_key:
        try:
            data = query_gemini_with_cache(db, prompt_type, prompt_text, content_chunk)
            if isinstance(data, dict) and "option_explanations" in data:
                # Back-save ALL genuine AI fields into DB Question row so future reads are 0-latency from DB
                if db_q:
                    try:
                        if data.get("grammar_topic"):
                            db_q.grammar_topic = data["grammar_topic"]
                        if data.get("option_explanations"):
                            db_q.option_explanations_json = json.dumps(data["option_explanations"], ensure_ascii=False)
                        if data.get("common_trap"):
                            db_q.common_trap = data["common_trap"]
                        if data.get("sentence_translation"):
                            db_q.translated_sentence = data["sentence_translation"]
                        if data.get("grammar_recall"):
                            db_q.explanation = f"Đáp án đúng: ({req.correct_answer}). " + data["grammar_recall"]
                        db.commit()
                    except Exception as commit_err:
                        print(f"[AI EXPLAIN v2] Error saving AI data back to DB: {commit_err}")

                return {
                    "status": "success",
                    "source": "gemini_ai",
                    "explanation": {
                        "detailed_explanation": f"Đáp án đúng: ({req.correct_answer}). " + (data.get("grammar_recall", "")),
                        "grammar_recall": data.get("grammar_recall", ""),
                        "grammar_topic": data.get("grammar_topic", g_topic),
                        "option_explanations": data.get("option_explanations", {}),
                        "common_trap": data.get("common_trap", ""),
                        "sentence_translation": data.get("sentence_translation", ""),
                        "exam_tip": data.get("exam_tip", ""),
                        "key_vocabulary": data.get("key_vocabulary", [])
                    }
                }
        except Exception as e:
            print(f"[AI EXPLAIN v2] Gemini call failed: {e}")

    # If DB lacks enriched AI data, fall back to live Gemini call or clear pending indicator
    fallback_exp = (db_q.explanation if db_q and db_q.explanation else f"Đáp án đúng là ({req.correct_answer}).")
    fallback_trans = (db_q.translated_sentence if db_q and db_q.translated_sentence else "")
    fallback_opt_exps = {}
    if db_q and db_q.option_explanations_json:
        try:
            fallback_opt_exps = json.loads(db_q.option_explanations_json)
        except Exception:
            pass

    return {
        "status": "success",
        "source": "live_or_pending",
        "explanation": {
            "detailed_explanation": fallback_exp,
            "grammar_recall": f"Chủ điểm: **{g_topic}**. Vui lòng bấm 'AI Giải Thích' để nhận phân tích chi tiết từ Gemini.",
            "grammar_topic": g_topic,
            "option_explanations": fallback_opt_exps,
            "common_trap": db_q.common_trap if (db_q and db_q.common_trap) else None,
            "sentence_translation": fallback_trans,
            "exam_tip": "Xác định từ loại và cấu trúc ngữ pháp của câu để chọn phương án đúng nhất.",
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

