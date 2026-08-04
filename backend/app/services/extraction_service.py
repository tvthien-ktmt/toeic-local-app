import os
import sys
import json
import re
from datetime import datetime
from typing import Dict, Any, List
from .local_parser_service import parse_part5_locally

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        try:
            text = " ".join(str(a) for a in args)
            sys.stdout.buffer.write((text + "\n").encode("utf-8", errors="replace"))
        except Exception:
            pass
from sqlalchemy.orm import Session
from ..models import Document, Question, Vocabulary, Flashcard
from .gemini_service import query_gemini_with_cache, get_gemini_api_key
from .chunking_service import chunk_markdown_document

# Dictionary of real TOEIC vocabulary translations for fallback testing
REAL_VIETNAMESE_DICTIONARY = {
    "report": ("báo cáo", "n", "/rɪˈpɔːt/", "The manager reviewed the quarterly report.", ["statement", "account"], ["silence"]),
    "reports": ("báo cáo", "n", "/rɪˈpɔːts/", "All financial reports must be submitted on time.", ["statements"], []),
    "company": ("công ty", "n", "/ˈkʌmpəni/", "The company announced a new product line.", ["firm", "corporation"], []),
    "proposal": ("đề xuất", "n", "/prəˈpəʊzl/", "The board approved the budget proposal.", ["suggestion", "recommendation"], ["refusal"]),
    "department": ("phòng ban", "n", "/dɪˈpɑːtmənt/", "She works in the marketing department.", ["division", "section"], []),
    "advertisement": ("mẫu quảng cáo", "n", "/ədˈvɜːtɪsmənt/", "The new advertisement attracted many customers.", ["commercial", "notice"], []),
    "leadership": ("năng lực lãnh đạo", "n", "/ˈliːdəʃɪp/", "His strong leadership guided the team to success.", ["guidance", "direction"], []),
    "belongings": ("đồ dùng cá nhân", "n", "/bɪˈlɒŋɪŋz/", "Please take care of your personal belongings.", ["possessions", "property"], []),
    "performance": ("hiệu suất làm việc", "n", "/pəˈfɔːməns/", "The software upgrade improved system performance.", ["efficiency", "execution"], []),
    "conference": ("hội nghị", "n", "/ˈkɒnfərəns/", "The annual conference will be held in Chicago.", ["meeting", "convention"], []),
    "agreement": ("thỏa thuận", "n", "/əˈɡriːmənt/", "Both parties signed the final agreement.", ["contract", "deal"], ["disagreement"]),
    "investigation": ("cuộc điều tra", "n", "/ɪnˌvestɪˈɡeɪʃn/", "The audit firm conducted an extensive investigation.", ["inquiry", "inspection"], []),
    "contract": ("hợp đồng", "n", "/ˈkɒntrækt/", "Please review the contract before signing.", ["agreement", "pact"], []),
    "schedule": ("lịch trình", "n", "/ˈʃedjuːl/", "The renovation project was completed ahead of schedule.", ["timetable", "agenda"], []),
    "candidate": ("ứng viên", "n", "/ˈkændɪdət/", "She is the most qualified candidate for the position.", ["applicant", "nominee"], []),
    "warranty": ("giấy bảo hành", "n", "/ˈwɒrənti/", "The product comes with a two-year warranty.", ["guarantee", "pledge"], []),
    "complaint": ("khiếu nại", "n", "/kəmˈpleɪnt/", "Customer service handled the complaint efficiently.", ["objection", "grievance"], ["praise"]),
    "quarter": ("quý tài chính", "n", "/ˈkwɔːtə/", "Profits increased in the third quarter.", ["period", "term"], []),
    "month": ("tháng", "n", "/mʌnθ/", "The project will be launched next month.", ["period"], []),
    "year": ("năm", "n", "/jɪə/", "Fiscal year net profits were outstanding.", ["annual period"], []),
    "revision": ("sự chỉnh sửa", "n", "/rɪˈvɪʒn/", "Several revisions were made to the document.", ["amendment", "alteration"], []),
    "budget": ("ngân sách", "n", "/ˈbʌdʒɪt/", "The campaign was completed under budget.", ["allowance", "financial plan"], []),
    "manager": ("quản lý", "n", "/ˈmænɪdʒə/", "Please speak with the store manager.", ["supervisor", "director"], ["subordinate"]),
    "reference": ("thư giới thiệu", "n", "/ˈrefrəns/", "Applicants should provide three references.", ["recommendation", "testimonial"], []),
    "benefit": ("phúc lợi", "n", "/ˈbenɪfɪt/", "The package includes medical benefits.", ["advantage", "perk"], ["drawback"])
}

def split_large_text_chunk(text: str, max_chars: int = 4500) -> List[str]:
    """
    Splits large text into smaller sub-chunks cleanly along question boundaries or double newlines.
    Prevents silent truncation of Part 5/6/7 questions while staying well within prompt limits.
    """
    if len(text) <= max_chars:
        return [text]
    
    sub_chunks = []
    # Split on question numbers (e.g. \n101. or \n\n)
    blocks = re.split(r'\n(?=\d{3}\.)', text)
    current_chunk = ""
    
    for block in blocks:
        if len(current_chunk) + len(block) > max_chars and current_chunk:
            sub_chunks.append(current_chunk.strip())
            current_chunk = block
        else:
            current_chunk += ("\n" + block) if current_chunk else block
            
    if current_chunk.strip():
        sub_chunks.append(current_chunk.strip())
        
    return sub_chunks if sub_chunks else [text]


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
                vi, pos, ipa, ex, syns, ants = REAL_VIETNAMESE_DICTIONARY[w_lower]
                vocab_list.append({
                    "word": w_lower,
                    "ipa": ipa,
                    "part_of_speech": pos,
                    "meaning_vi": vi,
                    "synonyms": syns,
                    "antonyms": ants,
                    "example_sentence": ex
                })
            else:
                vocab_list.append({
                    "word": w_lower,
                    "ipa": f"/{w_lower}/",
                    "part_of_speech": "noun",
                    "meaning_vi": f"từ vựng {w_lower}",
                    "synonyms": [f"equivalent_{w_lower}"],
                    "antonyms": [],
                    "example_sentence": f"Sample sentence containing {w_lower}."
                })
            if len(vocab_list) >= 20:
                break
    return vocab_list

def fallback_extract_part5(part_text: str) -> List[Dict[str, Any]]:
    """
    [MODE: MOCK_FALLBACK] Trích xuất câu hỏi Part 5 bằng regex khi KHÔNG có API key hoặc Gemini API gặp 429.
    Runs local_parser_service to parse remaining blocks cleanly.
    """
    print("[MODE: MOCK_FALLBACK] fallback_extract_part5 đang chạy — trích xuất câu hỏi Part 5 bằng regex cục bộ.")
    parsed, failed = parse_part5_locally(part_text, start_q=101, end_q=130)
    
    # For any blocks in failed list, create fallback question items stripping OCR header/footer garbage
    for fb in failed:
        num_m = re.search(r'^\s*(\d{1,3})[\.\_\:]*\s*', fb)
        q_num = num_m.group(1) if num_m else "101"
        q_body = fb[num_m.end():] if num_m else fb

        # Strip OCR page headers, markdown headings, directions
        q_body = re.sub(r'#+\s*.*', '', q_body)
        q_body = re.sub(r'(?i)Page\s+\d+.*', '', q_body)
        q_body = re.sub(r'(?i)READING TEST.*', '', q_body)
        q_body = re.sub(r'(?i)PART\s+5.*', '', q_body)
        q_body = re.sub(r'(?i)TEST\s+\d+.*', '', q_body)
        q_body = re.sub(r'(?i)Directions:.*', '', q_body)

        # Clean option marker remnants
        q_body_clean = re.sub(r'\([A-D]\)|[A-D][\.\)]|\([A-D]', ' ', q_body)
        q_body_clean = re.sub(r'\s+', ' ', q_body_clean).strip()

        words = [w.strip(".,;:_()-") for w in q_body_clean.split() if w.strip(".,;:_()-")]

        if len(words) >= 5:
            opt_d = words[-1]
            opt_c = words[-2]
            opt_b = words[-3]
            opt_a = words[-4]
            q_txt = " ".join(words[:-4])
        elif len(words) >= 4:
            opt_d = words[-1]
            opt_c = words[-2]
            opt_b = words[-3]
            opt_a = words[-4]
            q_txt = " ".join(words)
        else:
            opt_a = opt_b = opt_c = opt_d = "(chưa rõ)"
            q_txt = q_body_clean

        if not q_txt.endswith('.'):
            q_txt += " _____"

        parsed.append({
            "question_num": int(q_num),
            "question_text": f"{q_num}. {q_txt}",
            "options": [f"A. {opt_a}", f"B. {opt_b}", f"C. {opt_c}", f"D. {opt_d}"],
            "correct_answer": None,
            "grammar_topic": "Từ loại (Word Form)",
            "explanation": f"[LOCAL REGEX FALLBACK] Câu #{q_num} — Đã trích xuất bằng regex dự phòng.",
            "option_explanations": {
                "A": f"Phương án A: {opt_a}",
                "B": f"Phương án B: {opt_b}",
                "C": f"Phương án C: {opt_c}",
                "D": f"Phương án D: {opt_d}"
            },
            "translated_sentence": f"{q_num}. {q_txt}",
            "is_ai_verified": False
        })

    return parsed


def process_document_extraction(db: Session, doc_id: int) -> Dict[str, Any]:
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise ValueError(f"Không tìm thấy document #{doc_id}")

    chunks = chunk_markdown_document(doc.markdown_content, doc.doc_type)
    
    extracted_questions_count = 0
    extracted_vocab_count = 0

    api_key = get_gemini_api_key()
    if api_key:
        print(f"[EXECUTION MODE: LIVE_GEMINI_API] Gemini API Key detected ({api_key[:6]}***). Processing full document without silent truncation.")
    else:
        print("[EXECUTION MODE: MOCK_FALLBACK] WARNING: No GEMINI_API_KEY configured in .env! Running fallback extraction mode.")

    for chunk in chunks:
        part_num = chunk.get("part", 5)
        part_text = chunk["content"]
        
        # Split text into sub-chunks (max 4500 chars) ensuring zero truncation while minimizing API calls
        text_subchunks = split_large_text_chunk(part_text, max_chars=4500)

        for sub_idx, sub_text in enumerate(text_subchunks):
            # Throttle requests slightly (1.0s) to respect Gemini Free Tier limits
            import time
            time.sleep(1.0)

            print(f"[AI EXTRACTION] Part {part_num} (Subchunk {sub_idx + 1}/{len(text_subchunks)}): Sending {len(sub_text)} characters to Gemini...")

            if doc.doc_type == "RC_EXAM":
                if part_num == 5:
                    q_list = []
                    if api_key:
                        safe_print(f"[AI EXTRACTION] Part 5 (Subchunk {sub_idx + 1}/{len(text_subchunks)}): Sending to Gemini AI for direct extraction & 100% full enrichment...")
                        prompt_type = "extract_question_part5_full"
                        prompt_text = f"""Bạn nhận được văn bản đề thi TOEIC Part 5 (gồm các câu hỏi từ 101 tới 130).
Nhiệm vụ: Trích xuất TẤT CẢ các câu hỏi thành một JSON array hoàn chỉnh.
LƯU Ý QUAN TRỌNG:
1. Đọc và tách chính xác từng câu hỏi (101, 102, ..., 130). Điền dấu chỗ trống _____ vào vị trí bị thiếu từ.
2. Tách chính xác 4 phương án A, B, C, D cho MỖI câu hỏi.
3. Xác định đáp án đúng correct_answer ("A", "B", "C", hoặc "D").
4. Phân loại grammar_topic chuẩn TOEIC (ví dụ: 'Giới từ (Preposition)', 'Liên từ (Conjunction)', 'Đại từ (Pronoun)', 'Từ loại (Word Form)', 'Mệnh đề quan hệ (Relative Clause)', 'Thì động từ (Verb Tense)', 'Thể bị động (Passive Voice)').
5. Sinh giải thích option_explanations cho từng lựa chọn A, B, C, D và bản dịch tiếng Việt tự nhiên translated_sentence.

Mỗi phần tử trong JSON array có dạng:
{{
  "question_num": 101,
  "question_text": "101. Mr. Ellis needs a ticket for a new flight because _____ was canceled.",
  "options": ["A. him", "B. he", "C. his", "D. himself"],
  "correct_answer": "B",
  "grammar_topic": "Đại từ (Pronoun)",
  "explanation": "Cần một đại từ nhân xưng đóng vai trò chủ ngữ cho mệnh đề 'was canceled', nên chọn 'he'.",
  "option_explanations": {{
    "A": "him: Đại từ tân ngữ, không thể làm chủ ngữ.",
    "B": "he: Đại từ nhân xưng chủ ngữ (chính xác).",
    "C": "his: Tính từ sở hữu/đại từ sở hữu.",
    "D": "himself: Đại từ phản thân."
  }},
  "translated_sentence": "Ông Ellis cần một vé cho chuyến bay mới vì chuyến bay của ông ấy đã bị hủy."
}}

CHỈ trả về JSON array duy nhất, không kèm văn bản giải thích ngoài.
Nội dung đề thi:
{sub_text}"""
                        try:
                            raw_ai_qs = query_gemini_with_cache(db, prompt_type, prompt_text, sub_text)
                            q_list = raw_ai_qs if isinstance(raw_ai_qs, list) else (raw_ai_qs.get("questions", []) if isinstance(raw_ai_qs, dict) else [])
                        except Exception as e:
                            safe_print(f"[EXTRACTION_FALLBACK] Gemini API lỗi ({e}), chuyển sang fallback local parser.")
                            q_list = fallback_extract_part5(sub_text)
                    else:
                        safe_print("[EXTRACTION_FALLBACK] No API Key, running fallback local parser on Part 5...")
                        q_list = fallback_extract_part5(sub_text)

                    for q in q_list:
                        if not isinstance(q, dict): continue
                        g_topic = q.get("grammar_topic") or "Từ loại (Word Form)"
                        opts = q.get("options", [])
                        opts_str = json.dumps(opts, ensure_ascii=False) if isinstance(opts, list) else "[]"
                        opt_exps = q.get("option_explanations", {})
                        opt_exps_str = json.dumps(opt_exps, ensure_ascii=False) if isinstance(opt_exps, dict) else "{}"

                        new_q = Question(
                            document_id=doc.id,
                            part=5,
                            question_text=q.get("question_text", "Untitled Question"),
                            options_json=opts_str,
                            correct_answer=q.get("correct_answer"),
                            explanation=q.get("explanation"),
                            option_explanations_json=opt_exps_str,
                            translated_sentence=q.get("translated_sentence"),
                            grammar_topic=g_topic,
                            topic_tag="Part 5 Grammar",
                            is_generated=False
                        )
                        db.add(new_q)
                        extracted_questions_count += 1
                    db.commit()

                    # Extract Vocabulary for Part 5
                    if api_key:
                        vocab_prompt_type = "extract_vocab_part5"
                        vocab_prompt_text = f"""Từ đoạn Markdown đề TOEIC sau, hãy trích xuất các từ vựng CÓ GIÁ TRỊ HỌC.
Trả về JSON array các từ vựng:
[
  {{
    "word": "từ tiếng Anh nguyên mẫu",
    "ipa": "phiên âm IPA",
    "part_of_speech": "n/v/adj/adv/phrase",
    "meaning_vi": "nghĩa tiếng Việt chính xác theo ngữ cảnh",
    "synonyms": ["từ đồng nghĩa"],
    "antonyms": ["từ trái nghĩa"],
    "topic_category": "chọn 1 trong các chủ đề TOEIC",
    "example_sentence": "câu ví dụ"
  }}
]
CHỈ trả về JSON array.
Nội dung:
{sub_text}"""
                        try:
                            vocab_data = query_gemini_with_cache(db, vocab_prompt_type, vocab_prompt_text, sub_text)
                        except Exception as ve:
                            safe_print(f"[EXTRACTION_NOTE] Vocab Part 5 API limit, using fallback vocab.")
                            vocab_data = fallback_extract_vocab(sub_text)
                    else:
                        vocab_data = fallback_extract_vocab(sub_text)

                    v_list = vocab_data if isinstance(vocab_data, list) else (vocab_data.get("vocabulary", []) if isinstance(vocab_data, dict) else [])
                    for item in v_list:
                        if not isinstance(item, dict): continue
                        word_clean = item.get("word", "").strip().lower()
                        if not word_clean: continue

                        syn_list = item.get("synonyms", [])
                        ant_list = item.get("antonyms", [])
                        syn_str = json.dumps(syn_list, ensure_ascii=False) if isinstance(syn_list, list) else "[]"
                        ant_str = json.dumps(ant_list, ensure_ascii=False) if isinstance(ant_list, list) else "[]"

                        existing_v = db.query(Vocabulary).filter(
                            Vocabulary.word == word_clean,
                            Vocabulary.source_document_id == doc.id
                        ).first()

                        if existing_v:
                            existing_v.frequency_count += 1
                            if syn_str != "[]" and existing_v.synonyms == "[]":
                                existing_v.synonyms = syn_str
                            if ant_str != "[]" and existing_v.antonyms == "[]":
                                existing_v.antonyms = ant_str
                        else:
                            new_v = Vocabulary(
                                word=word_clean,
                                ipa=item.get("ipa", f"/{word_clean}/"),
                                part_of_speech=item.get("part_of_speech", "n"),
                                meaning_vi=item.get("meaning_vi", "nghĩa tiếng Việt"),
                                synonyms=syn_str,
                                antonyms=ant_str,
                                topic_category=item.get("topic_category", "khác / chưa phân loại"),
                                example_sentence=item.get("example_sentence", ""),
                                source_document_id=doc.id,
                                appears_in_part=f"Part {part_num}",
                                frequency_count=1
                            )
                            db.add(new_v)
                            db.flush()

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
                    db.commit()

                elif part_num in [6, 7]:
                    prompt_type = f"extract_part{part_num}_combined"
                    prompt_text = f"""Bạn nhận được nội dung Markdown của Part {part_num} trong đề thi TOEIC.
Nhiệm vụ: Trích xuất TẤT CẢ các câu hỏi VÀ các từ vựng thương mại quan trọng thành 1 JSON object duy nhất:
{{
  "passage_type": "email" | "memo" | "advertisement" | "article" | "notice" | "other",
  "passage_topic_tag": "Part {part_num} Passage",
  "questions": [
    {{
      "question_text": "...",
      "options": ["A. ...","B. ...","C. ...","D. ..."],
      "correct_answer": "...",
      "explanation": "...",
      "option_explanations": {{
        "A": "Giải thích A",
        "B": "Giải thích B",
        "C": "Giải thích C",
        "D": "Giải thích D"
      }},
      "translated_sentence": "Dịch tự nhiên tiếng Việt câu chứa chỗ trống hoặc câu hỏi"
    }}
  ],
  "vocabulary": [
    {{
      "word": "từ tiếng Anh nguyên mẫu",
      "ipa": "phiên âm IPA",
      "part_of_speech": "n/v/adj/adv/phrase",
      "meaning_vi": "nghĩa tiếng Việt",
      "synonyms": ["từ đồng nghĩa"],
      "antonyms": ["từ trái nghĩa"],
      "topic_category": "chọn 1 trong các chủ đề TOEIC",
      "example_sentence": "câu ví dụ"
    }}
  ]
}}
CHỈ trả về JSON.
Nội dung:
{sub_text}"""

                    try:
                        if api_key:
                            raw_data = query_gemini_with_cache(db, prompt_type, prompt_text, sub_text)
                        else:
                            print(f"[MODE: MOCK_FALLBACK] Part {part_num} — không có API key, dùng fallback regex.")
                            raw_data = {
                                "passage_type": "email",
                                "passage_topic_tag": f"Part {part_num} Business Topic",
                                "questions": fallback_extract_part5(sub_text),
                                "vocabulary": fallback_extract_vocab(sub_text)
                            }

                        passages_list = []
                        if isinstance(raw_data, list):
                            for item in raw_data:
                                if isinstance(item, dict) and "questions" in item:
                                    passages_list.append(item)
                                elif isinstance(item, dict) and ("question_text" in item or "options" in item):
                                    passages_list.append({"passage_topic_tag": f"Part {part_num} Passage", "questions": [item], "vocabulary": []})
                        elif isinstance(raw_data, dict):
                            if "questions" in raw_data:
                                passages_list.append(raw_data)
                            elif "question_text" in raw_data or "options" in raw_data:
                                passages_list.append({"passage_topic_tag": f"Part {part_num} Passage", "questions": [raw_data], "vocabulary": []})

                        for pass_obj in passages_list:
                            topic_tag = pass_obj.get("passage_topic_tag", f"Part {part_num} Passage")
                            q_list = pass_obj.get("questions", [])
                            for q in q_list:
                                if not isinstance(q, dict):
                                    continue
                                opts = q.get("options", [])
                                opts_str = json.dumps(opts, ensure_ascii=False) if isinstance(opts, list) else "[]"
                                opt_exps = q.get("option_explanations", {})
                                opt_exps_str = json.dumps(opt_exps, ensure_ascii=False) if isinstance(opt_exps, dict) else "{}"

                                new_q = Question(
                                    document_id=doc.id,
                                    part=part_num,
                                    question_text=q.get("question_text", "Reading Question"),
                                    options_json=opts_str,
                                    correct_answer=q.get("correct_answer"),
                                    explanation=q.get("explanation"),
                                    option_explanations_json=opt_exps_str,
                                    translated_sentence=q.get("translated_sentence"),
                                    grammar_topic="reading comprehension",
                                    topic_tag=topic_tag,
                                    is_generated=False
                                )
                                db.add(new_q)
                                extracted_questions_count += 1

                            # Process vocabulary from Part 6/7
                            v_list = pass_obj.get("vocabulary", []) if isinstance(pass_obj, dict) else []
                            if isinstance(raw_data, dict) and "vocabulary" in raw_data:
                                v_list.extend(raw_data.get("vocabulary", []))

                            for item in v_list:
                                if not isinstance(item, dict):
                                    continue
                                word_clean = item.get("word", "").strip().lower()
                                if not word_clean:
                                    continue

                                syn_list = item.get("synonyms", [])
                                ant_list = item.get("antonyms", [])
                                syn_str = json.dumps(syn_list, ensure_ascii=False) if isinstance(syn_list, list) else "[]"
                                ant_str = json.dumps(ant_list, ensure_ascii=False) if isinstance(ant_str, list) else "[]"

                                existing_v = db.query(Vocabulary).filter(
                                    Vocabulary.word == word_clean,
                                    Vocabulary.source_document_id == doc.id
                                ).first()

                                if existing_v:
                                    existing_v.frequency_count += 1
                                    if syn_str != "[]" and existing_v.synonyms == "[]":
                                        existing_v.synonyms = syn_str
                                    if ant_str != "[]" and existing_v.antonyms == "[]":
                                        existing_v.antonyms = ant_str
                                else:
                                    new_v = Vocabulary(
                                        word=word_clean,
                                        ipa=item.get("ipa", f"/{word_clean}/"),
                                        part_of_speech=item.get("part_of_speech", "n"),
                                        meaning_vi=item.get("meaning_vi", "nghĩa tiếng Việt"),
                                        synonyms=syn_str,
                                        antonyms=ant_str,
                                        topic_category=item.get("topic_category", "khác / chưa phân loại"),
                                        example_sentence=item.get("example_sentence", ""),
                                        source_document_id=doc.id,
                                        appears_in_part=f"Part {part_num}",
                                        frequency_count=1
                                    )
                                    db.add(new_v)
                                    db.flush()

                                    existing_fc = db.query(Flashcard).filter(Flashcard.vocabulary_id == new_v.id).first()
                                    if not existing_fc:
                                        new_fc = Flashcard(
                                            vocabulary_id=new_v.id,
                                            srs_level=0,
                                            ease_factor=2.5,
                                            next_review_at=datetime.utcnow()
                                        )
                                        db.add(new_fc)
                        db.commit()

                    except Exception as e:
                        safe_print(f"[EXTRACTION_FAILED] Part {part_num} subchunk {sub_idx + 1}/{len(text_subchunks)}: Gemini API lỗi ({e}). Chunk này sẽ KHÔNG được thay thế bằng regex rác.")
    if doc:
        doc.status = "extracted"
        db.commit()

    return {
        "document_id": doc_id,
        "status": "extracted",
        "questions_count": extracted_questions_count,
        "vocabulary_count": extracted_vocab_count,
        "chunks_processed": len(chunks)
    }
