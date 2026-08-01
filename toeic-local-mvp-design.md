# TOEIC Local Study Web App — MVP System Design

> Mục tiêu tài liệu: đây là **prompt/spec thiết kế hệ thống** để đưa cho AI coding agent (GLM 5.2 / GPT 5.5 / Antigravity IDE) thực thi code. Tài liệu này KHÔNG chứa code, chỉ chứa kiến trúc, data model, API contract, prompt template cho Gemini, và lộ trình 7 ngày.

---

## 1. Bối cảnh & Ràng buộc

- **Người dùng:** 1 người duy nhất, chạy 100% trên `localhost`. Không cần auth, không cần multi-user, không cần deploy cloud.
- **Nguồn dữ liệu đầu vào:** các file đề thi TOEIC (PDF) sưu tầm được — RC (Part 5, 6, 7) và LC (transcript Part 1–4) — do các web thi thử online đã bị gỡ vì bản quyền.
- **Ràng buộc quan trọng:** dùng Gemini API **free tier** → phải tối ưu token tối đa. Đây là lý do bắt buộc dùng `microsoft/markitdown` để convert PDF → Markdown trước khi đưa vào AI, thay vì gửi raw PDF/text thô.
- **Thời hạn:** 7 ngày để có MVP chạy được, ưu tiên tính năng lõi hơn là polish UI.
- **Hiệu năng:** vì chạy lâu dài 1 mình dùng, ưu tiên: (1) không gọi lại AI cho nội dung đã xử lý (cache triệt để), (2) DB nhẹ, không cần server DB riêng, (3) UI mượt, không lag khi dữ liệu tích lũy nhiều theo thời gian.

---

## 2. Phạm vi tính năng MVP (ưu tiên theo ngày build ở mục 9)

1. Upload file đề PDF (RC) hoặc transcript (LC) → convert sang Markdown → lưu trữ.
2. Trích xuất câu hỏi Part 5/6/7 từ Markdown, phân loại: từ vựng / ngữ pháp / đọc hiểu, gắn `grammar_topic` và `topic_tag` (ví dụ: email, memo, thông báo nội bộ...).
3. Trích xuất từ vựng: từ mới, phiên âm IPA, nghĩa tiếng Việt, từ loại, ví dụ câu, part xuất hiện, tần suất xuất hiện.
4. Sinh câu hỏi tương tự (similar question generation): dùng vocab + pattern ngữ pháp từ đề gốc để tạo câu hỏi mới, khác nghĩa nhưng cùng dạng.
5. Luyện tập theo chủ đề: lọc câu hỏi Part 6/7 theo `topic_tag` (ví dụ luyện riêng "email"), lọc câu hỏi Part 5 theo `grammar_topic`.
6. Trích xuất từ vựng/cụm từ hay gặp trong transcript Part 1–4 (listening).
7. Flashcard học từ vựng (có thể có SRS đơn giản — spaced repetition).
8. Trắc nghiệm ôn từ vựng (multiple choice quiz).
9. Gõ lại từ (typing practice / dictation từ vựng).
10. Đọc tiếng Anh + phiên âm cho từng từ (text-to-speech dùng Web Speech API của browser — không tốn API, không cần token AI).

---

## 3. Kiến trúc tổng quát

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│   Frontend (React + Vite)   │  HTTP  │   Backend (FastAPI, Python)   │
│  - Upload UI                │◄──────►│  - MarkItDown conversion       │
│  - Flashcard / Quiz / Typing│        │  - Question/Vocab extraction   │
│  - Practice by topic        │        │  - Gemini API orchestration    │
└─────────────────────────────┘        │  - Cache layer (SQLite)        │
                                        └──────────────┬────────────────┘
                                                        │
                                          ┌─────────────▼─────────────┐
                                          │   SQLite (file-based DB)  │
                                          │  documents / questions /  │
                                          │  vocabulary / flashcards  │
                                          └─────────────┬─────────────┘
                                                        │
                                          ┌─────────────▼─────────────┐
                                          │   Gemini API (free tier)  │
                                          │  chỉ nhận Markdown đã     │
                                          │  convert, đã chunk nhỏ    │
                                          └────────────────────────────┘
```

**Nguyên tắc tiết kiệm token (quan trọng nhất của dự án này):**
- PDF → Markdown 1 lần duy nhất qua MarkItDown, lưu vào DB. Không convert lại.
- Mọi kết quả gọi Gemini (vocab, question extraction, similar question) đều **cache theo hash nội dung** trong DB. Nếu người dùng mở lại tài liệu cũ, không gọi lại AI.
- Chunk Markdown theo từng Part/đoạn nhỏ (không gửi cả file dài vào 1 prompt) để tránh vượt free-tier limit và giảm token lãng phí do context không liên quan.
- Yêu cầu Gemini trả về **JSON có schema cố định** (không trả prose dài dòng) để giảm token output và dễ parse.
- Batch nhiều từ vựng/câu hỏi trong 1 lần gọi API thay vì gọi từng từ một.

---

## 4. Lựa chọn công nghệ

| Layer | Lựa chọn | Lý do |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + Zustand | Đã quen dùng stack này (từ dự án VietJourney), tốc độ dev nhanh, phù hợp deadline 7 ngày |
| Backend | Python + FastAPI | MarkItDown là thư viện Python native → tránh phải wrap qua subprocess/HTTP không cần thiết; FastAPI cho async tốt khi gọi Gemini API |
| Database | SQLite (qua SQLAlchemy) | Single-user, local, không cần setup server DB riêng, file `.db` gọn nhẹ, đủ nhanh cho vài nghìn record |
| File conversion | `microsoft/markitdown` (pip) | Đúng yêu cầu ban đầu — giảm 50-70% token so với PDF thô |
| AI | Gemini API free tier (google-generativeai SDK) | Theo yêu cầu, cần kiểm tra model free tier hiện tại (gemini flash) và giới hạn request/phút khi triển khai |
| TTS / phiên âm đọc | Web Speech API (`SpeechSynthesisUtterance`) trên trình duyệt | Miễn phí, không tốn token AI, chạy client-side |
| Dev/run | `uvicorn` cho backend, `vite dev` cho frontend, không cần Docker vì chỉ chạy local | Đơn giản hoá vì không cần triển khai |

> Lưu ý: cần bạn (hoặc AI thực thi) kiểm tra tên model Gemini free tier hiện hành và rate limit chính xác tại thời điểm code, vì thông tin này có thể thay đổi theo thời gian.

---

## 5. Cấu trúc thư mục đề xuất

```
toeic-local/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── db.py
│   │   ├── routers/
│   │   │   ├── documents.py
│   │   │   ├── questions.py
│   │   │   ├── vocabulary.py
│   │   │   ├── flashcards.py
│   │   │   └── quiz.py
│   │   ├── services/
│   │   │   ├── markitdown_service.py   # convert PDF -> md
│   │   │   ├── chunking_service.py     # tách md theo Part
│   │   │   ├── gemini_service.py       # gọi Gemini + cache
│   │   │   ├── extraction_service.py   # trích xuất vocab/question
│   │   │   └── srs_service.py          # spaced repetition logic
│   │   └── cache/                      # cache Gemini response theo hash
│   ├── data/toeic.db
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── UploadPage.tsx
    │   │   ├── DocumentDetailPage.tsx
    │   │   ├── PracticeByTopicPage.tsx
    │   │   ├── FlashcardPage.tsx
    │   │   ├── QuizPage.tsx
    │   │   └── TypingPracticePage.tsx
    │   ├── components/
    │   ├── store/            # Zustand stores
    │   └── api/               # API client functions
    └── package.json
```

---

## 6. Data Model (SQLite schema)

```sql
-- Tài liệu gốc (đề thi hoặc transcript)
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    doc_type TEXT CHECK(doc_type IN ('RC_EXAM','LC_TRANSCRIPT')) NOT NULL,
    content_hash TEXT UNIQUE,        -- dùng để tránh xử lý/cache trùng
    markdown_content TEXT NOT NULL,  -- output từ MarkItDown
    status TEXT DEFAULT 'uploaded',  -- uploaded / converted / extracted
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Câu hỏi trích xuất từ Part 5/6/7
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER REFERENCES documents(id),
    part INTEGER CHECK(part IN (5,6,7)),
    question_text TEXT NOT NULL,
    options_json TEXT NOT NULL,   -- ["A. ...","B. ...","C. ...","D. ..."]
    correct_answer TEXT,
    explanation TEXT,
    grammar_topic TEXT,           -- vd: "relative clause", "verb tense"
    topic_tag TEXT,               -- vd: "email", "memo", "advertisement"
    is_generated BOOLEAN DEFAULT 0, -- true nếu là câu do AI sinh thêm
    source_question_id INTEGER REFERENCES questions(id), -- câu gốc nếu is_generated=1
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Từ vựng
CREATE TABLE vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    ipa TEXT,
    part_of_speech TEXT,
    meaning_vi TEXT,
    example_sentence TEXT,
    source_document_id INTEGER REFERENCES documents(id),
    appears_in_part TEXT,          -- "5,7" nếu xuất hiện nhiều part
    frequency_count INTEGER DEFAULT 1,
    UNIQUE(word, source_document_id)
);

-- Flashcard / SRS state (1 dòng / từ vựng)
CREATE TABLE flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocabulary_id INTEGER UNIQUE REFERENCES vocabulary(id),
    srs_level INTEGER DEFAULT 0,      -- 0 = mới học
    ease_factor REAL DEFAULT 2.5,
    next_review_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_reviewed_at DATETIME
);

-- Lịch sử luyện tập (quiz/typing) — dùng để thống kê tiến độ
CREATE TABLE practice_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocabulary_id INTEGER REFERENCES vocabulary(id),
    question_id INTEGER REFERENCES questions(id),
    attempt_type TEXT CHECK(attempt_type IN ('quiz','typing','flashcard')),
    is_correct BOOLEAN,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cache kết quả gọi Gemini (tránh gọi lại AI cho cùng input)
CREATE TABLE ai_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_hash TEXT UNIQUE NOT NULL,   -- hash(prompt_type + content_chunk)
    prompt_type TEXT NOT NULL,          -- 'extract_vocab' / 'extract_question' / 'generate_similar'
    response_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Index quan trọng để tránh lag khi dữ liệu tăng dần:**
```sql
CREATE INDEX idx_questions_part_topic ON questions(part, topic_tag);
CREATE INDEX idx_questions_grammar ON questions(grammar_topic);
CREATE INDEX idx_vocab_word ON vocabulary(word);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review_at);
```

---

## 7. Pipeline xử lý file (Upload → sẵn sàng luyện tập)

1. **Upload** PDF/transcript → backend nhận file, tính `content_hash` (sha256 nội dung file).
2. Nếu `content_hash` đã tồn tại trong `documents` → trả về document cũ, **không xử lý lại** (tiết kiệm token + thời gian).
3. Nếu chưa có → `markitdown_service` convert PDF sang Markdown, lưu vào `documents.markdown_content`.
4. `chunking_service` tách Markdown theo pattern nhận diện Part (regex tìm "PART 5", "PART 6", "PART 7", hoặc "Questions 101-131" v.v. — vì đề TOEIC luôn có structure cố định này). Với transcript LC, tách theo "PART 1/2/3/4" hoặc theo từng conversation/talk.
5. Với mỗi chunk, gọi `gemini_service` theo prompt tương ứng (mục 8) — **kiểm tra cache trước khi gọi API**.
6. Kết quả JSON trả về được parse và insert vào `questions` / `vocabulary`.
7. Cập nhật `documents.status = 'extracted'`.

---

## 8. Prompt template cho Gemini (JSON output bắt buộc)

> Nguyên tắc chung: luôn yêu cầu Gemini trả **CHỈ JSON**, không giải thích thêm, để giảm token output. Luôn nói rõ input là Markdown đã convert từ PDF đề TOEIC.

### 8.1. Trích xuất câu hỏi Part 5
```
Bạn nhận được nội dung Markdown của Part 5 trong đề thi TOEIC (câu hỏi điền từ, 4 đáp án A/B/C/D).
Nhiệm vụ: trích xuất TỪNG câu hỏi thành JSON array, mỗi phần tử gồm:
{
  "question_text": "...",
  "options": ["A. ...","B. ...","C. ...","D. ..."],
  "correct_answer": "A" | null nếu đề không có đáp án,
  "grammar_topic": "tên chủ điểm ngữ pháp cụ thể, vd: subject-verb agreement, relative clause, verb tense, word form...",
  "explanation": "giải thích ngắn gọn 1-2 câu vì sao đáp án đúng, dựa trên ngữ pháp"
}
CHỈ trả về JSON array, không thêm text nào khác.
Nội dung: <chunk_markdown>
```

### 8.2. Trích xuất câu hỏi Part 6/7 + gắn topic
```
Bạn nhận được nội dung Markdown của Part 6 hoặc Part 7 (đoạn văn/email/thông báo + câu hỏi trắc nghiệm).
Nhiệm vụ: trả JSON gồm:
{
  "passage_type": "email" | "memo" | "advertisement" | "article" | "notice" | "other",
  "passage_topic_tag": "chủ đề ngắn gọn, vd: job application, product recall, office relocation",
  "questions": [
    { "question_text": "...", "options": [...], "correct_answer": "...", "explanation": "..." }
  ]
}
CHỈ trả về JSON, không thêm text nào khác.
Nội dung: <chunk_markdown>
```

### 8.3. Trích xuất từ vựng
```
Từ đoạn Markdown đề TOEIC sau, trích xuất các từ vựng CÓ GIÁ TRỊ học (bỏ qua từ quá cơ bản như "the", "is").
Trả JSON array, mỗi phần tử:
{
  "word": "...",
  "ipa": "phiên âm IPA chuẩn Anh-Anh hoặc Anh-Mỹ",
  "part_of_speech": "n/v/adj/adv/phrase",
  "meaning_vi": "nghĩa tiếng Việt ngắn gọn phù hợp ngữ cảnh TOEIC",
  "example_sentence": "câu ví dụ trích trực tiếp hoặc gần với đoạn gốc"
}
Ưu tiên các từ business/office vocabulary thường gặp trong TOEIC.
CHỈ trả JSON array.
Nội dung: <chunk_markdown>
```

### 8.4. Sinh câu hỏi tương tự (similar question generation)
```
Dựa trên câu hỏi TOEIC gốc sau đây (giữ nguyên chủ điểm ngữ pháp và cấu trúc, dùng từ vựng tương tự nhưng đổi ngữ cảnh/nghĩa câu), hãy tạo ra {N} câu hỏi mới.
Câu gốc: <question_text + options + grammar_topic>
Yêu cầu mỗi câu mới: cùng dạng ngữ pháp, độ khó tương đương, KHÔNG trùng nghĩa câu gốc, có 4 đáp án hợp lý (chỉ 1 đúng), kèm giải thích.
Trả JSON array theo format: [{ "question_text":"...", "options":[...], "correct_answer":"...", "explanation":"..." }]
CHỈ trả JSON.
```

### 8.5. Trích xuất từ vựng/cụm từ hay trong transcript nghe (Part 1-4)
```
Đây là transcript của bài nghe TOEIC Part {1|2|3|4}.
Trích xuất: (1) các từ/cụm từ business vocabulary quan trọng thường xuất hiện trong đề nghe TOEIC, (2) các collocation/cụm cố định dễ gây nhầm khi nghe.
Trả JSON array giống format mục 8.3, thêm field "appears_in_part": "listening_part_X".
CHỈ trả JSON.
Nội dung transcript: <chunk_markdown>
```

---

## 9. Lộ trình 7 ngày

| Ngày | Công việc chính |
|---|---|
| 1 | Setup repo (FastAPI + React skeleton), tạo DB schema, tích hợp MarkItDown, hoàn thành flow: upload PDF → convert → lưu Markdown, hiển thị được nội dung md ra frontend |
| 2 | Chunking theo Part, tích hợp Gemini service + cache layer, chạy được prompt 8.1/8.2 → lưu `questions` vào DB, hiển thị danh sách câu hỏi theo Part |
| 3 | Prompt 8.3 trích xuất từ vựng, lưu `vocabulary`, hiển thị danh sách từ vựng theo tài liệu/part; thêm TTS đọc từ (Web Speech API) |
| 4 | Flashcard UI + SRS logic cơ bản (SM-2 đơn giản hoá: đúng → tăng interval, sai → reset về level 0); trang luyện trắc nghiệm ôn từ vựng (multiple choice) |
| 5 | Tính năng gõ lại từ (typing practice, so khớp string, hiển thị đúng/sai); prompt 8.4 sinh câu hỏi tương tự, lưu vào `questions` với `is_generated=1` |
| 6 | Luyện theo chủ đề: filter Part 6/7 theo `topic_tag` (email, memo...), filter Part 5 theo `grammar_topic`; prompt 8.5 cho transcript nghe |
| 7 | Polish UI (Tailwind), kiểm tra cache hoạt động đúng (không gọi lại AI trùng), test toàn bộ flow end-to-end, sửa bug |

---

## 10. Rủi ro & lưu ý khi build

- **Rate limit Gemini free tier**: cần có retry/backoff và giới hạn số request/phút phía backend; batch nhiều câu hỏi/từ vựng trong 1 request thay vì gọi lẻ từng câu.
- **PDF layout phức tạp**: MarkItDown có thể làm mất một số format (bảng, layout 2 cột trong Part 7). Cần kiểm tra output thực tế; nếu chunking theo Part bị sai do mất cấu trúc, cân nhắc dùng thêm regex heuristic dựa trên pattern câu hỏi TOEIC chuẩn ("101.", "102." ...) thay vì chỉ dựa heading Markdown.
- **Đáp án đúng**: nhiều đề sưu tầm không kèm đáp án — cần để Gemini tự suy luận (`correct_answer` có thể null nếu không chắc, và không nên tự nhận là chắc chắn 100% khi đề gốc không có đáp án kèm theo).
- **Cache invalidation**: nếu sửa prompt template sau này, cần cách xoá cache cũ theo `prompt_type` để tránh dùng kết quả lỗi thời.

---

## 11. Định hướng mở rộng sau MVP (không làm trong 7 ngày)

- Thống kê tiến độ học (biểu đồ từ vựng đã thuộc theo thời gian).
- Export flashcard ra Anki.
- Full-text search trong toàn bộ đề đã upload.
- Nghe chính tả (dictation) cho Part 2 dùng audio thật nếu có file mp3 kèm transcript.
