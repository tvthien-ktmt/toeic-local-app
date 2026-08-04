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
    [MODE: MOCK_FALLBACK] Trích xuất câu hỏi Part 5 bằng regex khi KHÔNG có API key.
    Chiến lược an toàn: tách câu hỏi theo số thứ tự (\n\d{3}\.) TRƯỚC,
    rồi mới tìm marker (A)/(B)/(C)/(D) BÊN TRONG mỗi block riêng biệt.
    Không bao giờ tìm xuyên block khác → tránh bug gộp câu.
    """
    print("[MODE: MOCK_FALLBACK] fallback_extract_part5 đang chạy — chỉ dùng khi không có API key.")
    questions = []

    # Bước 1: Tách text thành các block theo số thứ tự câu hỏi (101., 102., ...)
    blocks = re.split(r'\n(?=\d{3}\.)', part_text)

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Kiểm tra block bắt đầu bằng số câu hỏi 3 chữ số
        q_num_match = re.match(r'^(\d{3})\.\s*', block)
        if not q_num_match:
            continue

        q_num = q_num_match.group(1)
        block_body = block[q_num_match.end():]  # Phần sau số câu hỏi

        # Bước 2: Tìm marker (B), (C), (D) trong block này
        # Dùng (B) làm mốc chính vì (A) hay bị OCR mất
        opt_b_match = re.search(r'\(B\)|\bB\.\s', block_body)
        opt_c_match = re.search(r'\(C\)|\bC\.\s', block_body)
        opt_d_match = re.search(r'\(D\)|\bD\.\s', block_body)

        if opt_b_match and opt_c_match and opt_d_match:
            # Tìm (A) — nếu không có, coi phần giữa câu hỏi và (B) là đáp án A
            opt_a_match = re.search(r'\(A\)|\bA\.\s', block_body)

            if opt_a_match and opt_a_match.start() < opt_b_match.start():
                q_text_raw = block_body[:opt_a_match.start()].strip()
                opt_a_text = block_body[opt_a_match.end():opt_b_match.start()].strip()
            else:
                # (A) bị mất — tìm ranh giới bằng cách lấy từ cuối cùng trước (B)
                pre_b = block_body[:opt_b_match.start()].strip()
                # Tách câu hỏi và đáp án A: dòng cuối cùng trước (B) là đáp án A
                pre_b_lines = [l.strip() for l in pre_b.split('\n') if l.strip()]
                if len(pre_b_lines) >= 2:
                    q_text_raw = ' '.join(pre_b_lines[:-1])
                    opt_a_text = pre_b_lines[-1]
                else:
                    q_text_raw = pre_b
                    opt_a_text = "(không rõ)"

            opt_b_text = block_body[opt_b_match.end():opt_c_match.start()].strip()
            opt_c_text = block_body[opt_c_match.end():opt_d_match.start()].strip()
            opt_d_text = block_body[opt_d_match.end():].strip()
            # Loại bỏ dấu xuống dòng thừa trong đáp án
            opt_d_text = opt_d_text.split('\n')[0].strip()

            opts = [
                f"A. {opt_a_text}",
                f"B. {opt_b_text}",
                f"C. {opt_c_text}",
                f"D. {opt_d_text}"
            ]
        else:
            # Không tìm đủ marker B/C/D → lấy toàn bộ block làm câu hỏi, đáp án placeholder
            q_text_raw = block_body.split('\n')[0].strip() if block_body else block
            opts = ["A. (không rõ)", "B. (không rõ)", "C. (không rõ)", "D. (không rõ)"]

        q_text = f"{q_num}. {q_text_raw}"

        # Nhận dạng chủ đề ngữ pháp cơ bản
        topic = "word form"
        q_lower = q_text_raw.lower()
        if any(w in q_lower for w in ["by", "on", "at", "for", "in", "to", "during", "since", "until"]):
            topic = "preposition"
        elif any(w in q_lower for w in ["because", "although", "while", "after", "before"]):
            topic = "conjunction"

        questions.append({
            "question_text": q_text,
            "options": opts,
            "correct_answer": None,
            "grammar_topic": topic,
            "explanation": f"[MOCK] Câu #{q_num} — cần Gemini AI để giải thích chính xác."
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
                    # LAYER 1: Parse Part 5 locally using regex (0 AI tokens)
                    parsed_qs, failed_blocks = parse_part5_locally(sub_text)
                    safe_print(f"[LOCAL REGEX PARSER] Part 5 Subchunk {sub_idx + 1}/{len(text_subchunks)}: Parsed {len(parsed_qs)} questions locally (0 AI tokens). Failed blocks needing AI: {len(failed_blocks)}")

                    for q in parsed_qs:
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
                            grammar_topic=q.get("grammar_topic", "word form"),
                            topic_tag="Part 5 Grammar",
                            is_generated=False
                        )
                        db.add(new_q)
                        extracted_questions_count += 1
                    db.commit()

                    # LAYER 2: If any blocks failed local regex parsing, send ONLY those to Gemini AI (or fallback parser)
                    if failed_blocks:
                        failed_text = "\n\n".join(failed_blocks)
                        q_list = []
                        if api_key:
                            safe_print(f"[AI EXTRACTION] Part 5 Subchunk {sub_idx + 1}: Sending {len(failed_blocks)} failed question blocks ({len(failed_text)} chars) to Gemini...")
                            prompt_type = "extract_question_part5"
                            prompt_text = f"""Bạn nhận được một số câu hỏi Part 5 TOEIC chưa tách được bằng regex.
Trích xuất TẤT CẢ các câu hỏi này thành JSON array.
Mỗi phần tử gồm:
{{
  "question_text": "...",
  "options": ["A. ...","B. ...","C. ...","D. ..."],
  "correct_answer": "A" | "B" | "C" | "D" | null,
  "grammar_topic": "tên chủ điểm ngữ pháp",
  "explanation": "giải thích ngắn gọn",
  "option_explanations": {{
    "A": "Giải thích A",
    "B": "Giải thích B",
    "C": "Giải thích C",
    "D": "Giải thích D"
  }},
  "translated_sentence": "Bản dịch tiếng Việt hoàn chỉnh"
}}
CHỈ trả về JSON array.
Nội dung:
{failed_text}"""
                            try:
                                raw_ai_qs = query_gemini_with_cache(db, prompt_type, prompt_text, failed_text)
                                q_list = raw_ai_qs if isinstance(raw_ai_qs, list) else (raw_ai_qs.get("questions", []) if isinstance(raw_ai_qs, dict) else [])
                            except Exception as e:
                                safe_print(f"[EXTRACTION_FALLBACK] Gemini API lỗi ({e}), chuyển sang fallback local parser.")
                                q_list = fallback_extract_part5(failed_text)
                        else:
                            safe_print(f"[EXTRACTION_FALLBACK] No API Key, running fallback local parser on {len(failed_blocks)} failed blocks...")
                            q_list = fallback_extract_part5(failed_text)

                        for q in q_list:
                            if not isinstance(q, dict): continue
                            g_topic = q.get("grammar_topic") or "unclassified"
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

                    # B.1.3: Mandatory Gemini AI Enrichment Pass for Part 5 questions
                    all_p5_qs = db.query(Question).filter(Question.document_id == doc.id, Question.part == 5).all()
                    if all_p5_qs and api_key:
                        qs_summary = "\n\n".join([
                            f"Question #{q.id} (No. {q.question_text[:5]}): {q.question_text}\nOptions: {q.options_json}"
                            for q in all_p5_qs
                        ])
                        safe_print(f"[AI ENRICHMENT] Part 5: Sending {len(all_p5_qs)} questions to Gemini AI for real grammar_topic, explanations, and Vietnamese translation...")
                        enrich_prompt_type = "enrich_part5_questions"
                        enrich_prompt_text = f"""Bạn nhận được danh sách các câu hỏi Part 5 TOEIC.
Hãy phân loại CHÍNH XÁC grammar_topic, sinh giải thích option_explanations cho từng đáp án A, B, C, D, và dịch translated_sentence sang tiếng Việt hoàn chỉnh cho MỖI câu hỏi.

Trả về JSON array các object tương ứng theo thứ tự câu:
[
  {{
    "id": <ID câu hỏi trong input>,
    "grammar_topic": "tên chủ điểm ngữ pháp chuẩn TOEIC (ví dụ: 'đại từ', 'từ loại', 'giới từ', 'liên từ', 'thể bị động', 'mệnh đề quan hệ', 'thì động từ', 'mệnh đề trạng ngữ', 'so sánh')",
    "correct_answer": "A" | "B" | "C" | "D",
    "explanation": "giải thích ngắn gọn vì sao đáp án đúng",
    "option_explanations": {{
      "A": "Giải thích ngữ pháp cụ thể cho phương án A",
      "B": "Giải thích ngữ pháp cụ thể cho phương án B",
      "C": "Giải thích ngữ pháp cụ thể cho phương án C",
      "D": "Giải thích ngữ pháp cụ thể cho phương án D"
    }},
    "translated_sentence": "Bản dịch tiếng Việt hoàn chỉnh và tự nhiên của câu khi đã điền đáp án đúng vào chỗ trống"
  }}
]
CHỈ trả về JSON array.
Nội dung câu hỏi:
{qs_summary}"""
                        try:
                            enriched_data = query_gemini_with_cache(db, enrich_prompt_type, enrich_prompt_text, qs_summary)
                            enrich_list = enriched_data if isinstance(enriched_data, list) else (enriched_data.get("questions", []) if isinstance(enriched_data, dict) else [])
                            
                            enrich_map = {}
                            for item in enrich_list:
                                if isinstance(item, dict) and item.get("id"):
                                    enrich_map[item["id"]] = item

                            for db_q in all_p5_qs:
                                item = enrich_map.get(db_q.id)
                                if item:
                                    if item.get("grammar_topic"):
                                        db_q.grammar_topic = item["grammar_topic"]
                                    if item.get("correct_answer"):
                                        db_q.correct_answer = item["correct_answer"]
                                    if item.get("explanation"):
                                        db_q.explanation = item["explanation"]
                                    if item.get("option_explanations"):
                                        db_q.option_explanations_json = json.dumps(item["option_explanations"], ensure_ascii=False)
                                    if item.get("translated_sentence"):
                                        db_q.translated_sentence = item["translated_sentence"]
                            db.commit()
                            safe_print(f"[AI ENRICHMENT] Part 5: Successfully enriched {len(enrich_map)} questions with real topics and translations!")
                        except Exception as ee:
                            safe_print(f"[AI ENRICHMENT NOTE] Gemini AI enrichment skipped/failed: {ee}")

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
