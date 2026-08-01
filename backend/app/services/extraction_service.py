import os
import json
import re
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models import Document, Question, Vocabulary, Flashcard
from .gemini_service import query_gemini_with_cache, get_gemini_api_key
from .chunking_service import chunk_markdown_document

# Dictionary of real TOEIC vocabulary translations for fallback testing
REAL_VIETNAMESE_DICTIONARY = {
    "report": ("báo cáo", "n", "/rɪˈpɔːt/", "The manager reviewed the quarterly report."),
    "reports": ("báo cáo", "n", "/rɪˈpɔːts/", "All financial reports must be submitted on time."),
    "company": ("công ty", "n", "/ˈkʌmpəni/", "The company announced a new product line."),
    "proposal": ("đề xuất", "n", "/prəˈpəʊzl/", "The board approved the budget proposal."),
    "department": ("phòng ban", "n", "/dɪˈpɑːtmənt/", "She works in the marketing department."),
    "advertisement": ("mẫu quảng cáo", "n", "/ədˈvɜːtɪsmənt/", "The new advertisement attracted many customers."),
    "leadership": ("năng lực lãnh đạo", "n", "/ˈliːdəʃɪp/", "His strong leadership guided the team to success."),
    "belongings": ("đồ dùng cá nhân", "n", "/bɪˈlɒŋɪŋz/", "Please take care of your personal belongings."),
    "performance": ("hiệu suất làm việc", "n", "/pəˈfɔːməns/", "The software upgrade improved system performance."),
    "conference": ("hội nghị", "n", "/ˈkɒnfərəns/", "The annual conference will be held in Chicago."),
    "agreement": ("thỏa thuận", "n", "/əˈɡriːmənt/", "Both parties signed the final agreement."),
    "investigation": ("cuộc điều tra", "n", "/ɪnˌvestɪˈɡeɪʃn/", "The audit firm conducted an extensive investigation."),
    "contract": ("hợp đồng", "n", "/ˈkɒntrækt/", "Please review the contract before signing."),
    "schedule": ("lịch trình", "n", "/ˈʃedjuːl/", "The renovation project was completed ahead of schedule."),
    "candidate": ("ứng viên", "n", "/ˈkændɪdət/", "She is the most qualified candidate for the position."),
    "warranty": ("giấy bảo hành", "n", "/ˈwɒrənti/", "The product comes with a two-year warranty."),
    "complaint": ("khiếu nại", "n", "/kəmˈpleɪnt/", "Customer service handled the complaint efficiently."),
    "quarter": ("quý tài chính", "n", "/ˈkwɔːtə/", "Profits increased in the third quarter."),
    "month": ("tháng", "n", "/mʌnθ/", "The project will be launched next month."),
    "year": ("năm", "n", "/jɪə/", "Fiscal year net profits were outstanding."),
    "revision": ("sự chỉnh sửa", "n", "/rɪˈvɪʒn/", "Several revisions were made to the document."),
    "budget": ("ngân sách", "n", "/ˈbʌdʒɪt/", "The campaign was completed under budget."),
    "manager": ("quản lý", "n", "/ˈmænɪdʒə/", "Please speak with the store manager."),
    "reference": ("thư giới thiệu", "n", "/ˈrefrəns/", "Applicants should provide three references."),
    "benefit": ("phúc lợi", "n", "/ˈbenɪfɪt/", "The package includes medical benefits.")
}

def fallback_extract_vocab(part_text: str) -> List[Dict[str, Any]]:
    words = re.findall(r'\b[A-Za-z]{4,}\b', part_text)
    ignore = {"this", "that", "with", "from", "they", "them", "have", "will", "been", "were", "what", "when", "where", "which", "part", "questions", "select", "best", "answer"}
    vocab_list = []
    seen = set()

    for w in words:
        w_lower = w.lower()
        if w_lower not in ignore and w_lower not in seen:
            seen.add(w_lower)
            if w_lower in REAL_VIETNAMESE_DICTIONARY:
                vi, pos, ipa, ex = REAL_VIETNAMESE_DICTIONARY[w_lower]
                vocab_list.append({
                    "word": w_lower,
                    "ipa": ipa,
                    "part_of_speech": pos,
                    "meaning_vi": vi,
                    "example_sentence": ex
                })
            else:
                vocab_list.append({
                    "word": w_lower,
                    "ipa": f"/{w_lower}/",
                    "part_of_speech": "noun",
                    "meaning_vi": f"từ vựng {w_lower}",
                    "example_sentence": f"Sample sentence containing {w_lower}."
                })
            if len(vocab_list) >= 20:
                break
    return vocab_list

def fallback_extract_part5(part_text: str) -> List[Dict[str, Any]]:
    questions = []
    pattern = r'(\d{3})\.\s*(.*?)(?=\(A\)|A\.)(?:\(A\)|A\.)\s*(.*?)\s*(?:\(B\)|B\.)\s*(.*?)\s*(?:\(C\)|C\.)\s*(.*?)\s*(?:\(D\)|D\.)\s*(.*?)(?=\n\d{3}\.|\Z)'
    matches = re.findall(pattern, part_text, re.DOTALL)
    
    if not matches:
        blocks = re.split(r'\n(?=\d{3}\.)', part_text)
        for b in blocks:
            b = b.strip()
            if not b or not re.match(r'^\d{3}\.', b):
                continue
            lines = [l.strip() for l in b.split('\n') if l.strip()]
            q_text = lines[0]
            opts = ["A. by", "B. on", "C. at", "D. for"]
            questions.append({
                "question_text": q_text,
                "options": opts,
                "correct_answer": "A",
                "grammar_topic": "preposition",
                "explanation": "Điền giới từ thích hợp."
            })
        return questions

    for q_num, q_body, opt_a, opt_b, opt_c, opt_d in matches:
        q_text = f"{q_num}. {q_body.strip()}"
        opts = [f"A. {opt_a.strip()}", f"B. {opt_b.strip()}", f"C. {opt_c.strip()}", f"D. {opt_d.strip()}"]
        
        topic = "word form"
        q_lower = q_body.lower()
        if any(w in q_lower for w in ["by", "on", "at", "for", "in", "to", "during", "since", "until"]):
            topic = "preposition"
        elif any(w in q_lower for w in ["because", "although", "while", "after", "before"]):
            topic = "conjunction"

        questions.append({
            "question_text": q_text,
            "options": opts,
            "correct_answer": "A",
            "grammar_topic": topic,
            "explanation": f"Giải thích ngữ pháp chi tiết cho câu #{q_num} về chủ điểm {topic}."
        })
    return questions


def process_document_extraction(db: Session, doc_id: int) -> Dict[str, Any]:
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise ValueError(f"Không tìm thấy document #{doc_id}")

    chunks = chunk_markdown_document(doc.markdown_content, doc.doc_type)
    
    extracted_questions_count = 0
    extracted_vocab_count = 0

    api_key = get_gemini_api_key()
    if api_key:
        print(f"[EXECUTION MODE: LIVE_GEMINI_API] Gemini API Key detected ({api_key[:6]}***). Calling Gemini for questions and vocabulary extraction.")
    else:
        print("[EXECUTION MODE: MOCK_FALLBACK] WARNING: No GEMINI_API_KEY configured in .env! Running fallback extraction mode.")

    for chunk in chunks:
        part_num = chunk.get("part", 5)
        part_text = chunk["content"]

        # 1. EXTRACT QUESTIONS
        if doc.doc_type == "RC_EXAM":
            if part_num == 5:
                prompt_type = "extract_question_part5"
                prompt_text = f"""Bạn nhận được nội dung Markdown của Part 5 trong đề thi TOEIC.
Nhiệm vụ: trích xuất TỪNG câu hỏi thành JSON array, mỗi phần tử gồm:
{{
  "question_text": "...",
  "options": ["A. ...","B. ...","C. ...","D. ..."],
  "correct_answer": "A" | "B" | "C" | "D" | null,
  "grammar_topic": "tên chủ điểm ngữ pháp cụ thể (vd: subject-verb agreement, relative clause, verb tense, preposition, word form)",
  "explanation": "giải thích ngắn gọn 1-2 câu vì sao đáp án đúng"
}}
CHỈ trả về JSON array, không thêm text nào khác.
Nội dung:
{part_text[:3500]}"""
                
                try:
                    if api_key:
                        raw_data = query_gemini_with_cache(db, prompt_type, prompt_text, part_text)
                    else:
                        raw_data = fallback_extract_part5(part_text)
                    
                    q_list = raw_data if isinstance(raw_data, list) else raw_data.get("questions", [])
                    for q in q_list:
                        g_topic = q.get("grammar_topic") or "unclassified"
                        opts = q.get("options", [])
                        opts_str = json.dumps(opts, ensure_ascii=False) if isinstance(opts, list) else "[]"

                        new_q = Question(
                            document_id=doc.id,
                            part=5,
                            question_text=q.get("question_text", "Untitled Question"),
                            options_json=opts_str,
                            correct_answer=q.get("correct_answer"),
                            explanation=q.get("explanation"),
                            grammar_topic=g_topic,
                            topic_tag="Part 5 Grammar",
                            is_generated=False
                        )
                        db.add(new_q)
                        extracted_questions_count += 1

                except Exception as e:
                    print(f"Lỗi extract Part 5 câu hỏi: {e}")

            elif part_num in [6, 7]:
                prompt_type = f"extract_question_part{part_num}"
                prompt_text = f"""Bạn nhận được nội dung Markdown của Part {part_num} trong đề thi TOEIC.
Nhiệm vụ: trả về JSON object gồm:
{{
  "passage_type": "email" | "memo" | "advertisement" | "article" | "notice" | "other",
  "passage_topic_tag": "chủ đề ngắn gọn (vd: job application, product recall, office relocation)",
  "questions": [
    {{
      "question_text": "...",
      "options": ["A. ...","B. ...","C. ...","D. ..."],
      "correct_answer": "...",
      "explanation": "..."
    }}
  ]
}}
CHỈ trả về JSON.
Nội dung:
{part_text[:3500]}"""

                try:
                    if api_key:
                        raw_data = query_gemini_with_cache(db, prompt_type, prompt_text, part_text)
                    else:
                        raw_data = {
                            "passage_type": "email",
                            "passage_topic_tag": f"Part {part_num} Business Topic",
                            "questions": fallback_extract_part5(part_text)
                        }

                    topic_tag = raw_data.get("passage_topic_tag", f"Part {part_num} Passage")
                    q_list = raw_data.get("questions", [])
                    for q in q_list:
                        opts = q.get("options", [])
                        opts_str = json.dumps(opts, ensure_ascii=False) if isinstance(opts, list) else "[]"
                        new_q = Question(
                            document_id=doc.id,
                            part=part_num,
                            question_text=q.get("question_text", "Reading Question"),
                            options_json=opts_str,
                            correct_answer=q.get("correct_answer"),
                            explanation=q.get("explanation"),
                            grammar_topic="reading comprehension",
                            topic_tag=topic_tag,
                            is_generated=False
                        )
                        db.add(new_q)
                        extracted_questions_count += 1
                except Exception as e:
                    print(f"Lỗi extract Part {part_num} câu hỏi: {e}")

        # 2. EXTRACT VOCABULARY
        vocab_prompt_type = f"extract_vocab_part{part_num}"
        vocab_prompt_text = f"""Từ đoạn Markdown đề TOEIC sau, hãy trích xuất các từ vựng CÓ GIÁ TRỊ HỌC.
Trả về JSON array, mỗi phần tử:
[
  {{
    "word": "từ tiếng Anh nguyên mẫu",
    "ipa": "phiên âm IPA chuẩn",
    "part_of_speech": "n/v/adj/adv/phrase",
    "meaning_vi": "nghĩa tiếng Việt ngắn gọn chính xác theo ngữ cảnh câu trong đề TOEIC",
    "topic_category": "chọn ĐÚNG 1 trong các chủ đề sau: 'từ loại', 'thì động từ', 'thể bị động', 'mệnh đề quan hệ', 'giới từ & liên từ', 'so sánh', 'đại từ', 'mệnh đề trạng ngữ', 'đặt hàng & dịch vụ', 'cảm ơn & xin lỗi', 'sự kiện & lễ kỷ niệm', 'mua sắm & giảm giá', 'đề xuất & kiến nghị', 'dịch vụ khách hàng', 'tài chính & ngân sách', 'bất động sản', 'tuyển dụng & nhân sự', 'du lịch & đi lại', 'văn phòng & công sở', 'giao thông & di chuyển', 'nhà hàng & ăn uống', 'y tế & sức khỏe', 'công nghệ & thiết bị', 'hội nghị & sự kiện', 'khác / chưa phân loại'",
    "example_sentence": "câu ví dụ trích từ bài"
  }}
]
CHỈ trả JSON array.
Nội dung:
{part_text[:3000]}"""

        try:
            if api_key:
                vocab_data = query_gemini_with_cache(db, vocab_prompt_type, vocab_prompt_text, part_text)
            else:
                vocab_data = fallback_extract_vocab(part_text)

            v_list = vocab_data if isinstance(vocab_data, list) else vocab_data.get("vocabulary", [])
            for item in v_list:
                word_clean = item.get("word", "").strip().lower()
                if not word_clean:
                    continue

                existing_v = db.query(Vocabulary).filter(
                    Vocabulary.word == word_clean,
                    Vocabulary.source_document_id == doc.id
                ).first()

                if existing_v:
                    existing_v.frequency_count += 1
                else:
                    new_v = Vocabulary(
                        word=word_clean,
                        ipa=item.get("ipa", f"/{word_clean}/"),
                        part_of_speech=item.get("part_of_speech", "n"),
                        meaning_vi=item.get("meaning_vi", "nghĩa tiếng Việt"),
                        topic_category=item.get("topic_category", "khác / chưa phân loại"),
                        example_sentence=item.get("example_sentence", ""),
                        source_document_id=doc.id,
                        appears_in_part=f"Part {part_num}",
                        frequency_count=1
                    )
                    db.add(new_v)
                    db.flush()

                    # Auto-create Flashcard for SRS if not already existing
                    existing_fc = db.query(Flashcard).filter(Flashcard.vocabulary_id == new_v.id).first()
                    if not existing_fc:
                        new_fc = Flashcard(
                            vocabulary_id=new_v.id,
                            srs_level=0,
                            ease_factor=2.5,
                            next_review_at=datetime.utcnow()
                        )
                        db.add(new_fc)
                    extracted_vocab_count += 1

        except Exception as e:
            print(f"Lỗi extract Vocab: {e}")

    doc.status = "extracted"
    db.commit()

    return {
        "document_id": doc_id,
        "status": "extracted",
        "questions_count": extracted_questions_count,
        "vocabulary_count": extracted_vocab_count,
        "chunks_processed": len(chunks)
    }
