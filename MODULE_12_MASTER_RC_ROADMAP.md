# TOEIC Local App — MODULE 12: Lộ Trình "Mất Gốc → 495 RC" (Curriculum Engine) — Feature Spec Bổ Sung

> Dùng kèm với `toeic-local-mvp-design.md` và `toeic-local-feature-checklist.md` đã có trong repo. Module này **không thay thế** Module 1–11, mà xây một lớp "curriculum" nằm TRÊN dữ liệu đã có (15.730 câu hỏi, vocabulary, grammar_topic, topic_category) để biến app từ "kho đề + AI giải thích" thành **lộ trình học có thứ tự, có chẩn đoán, có bài giảng, có gate trước khi cho thi thử 495**.
>
> Nguồn tri thức đầu vào: 4 file tổng hợp kiến thức Part 5/6/7 (`ChatGPT.txt`, `Gemini.txt`, `Grok.txt`, `Claude.txt` trong `Knowlegle_RC/`) — mỗi file là một bản liệt kê độc lập các chủ điểm ngữ pháp, dạng câu hỏi, chủ đề từ vựng do 4 AI khác nhau tổng hợp. Coi đây là 4 "chuyên gia" cần đối chiếu chéo, KHÔNG coi 1 nguồn là chân lý duy nhất.
>
> Build theo đúng thứ tự Priority P0 → P1 → P2. Không được bỏ qua DoD của bất kỳ mục nào, đúng tinh thần đã áp dụng cho Module 1–11.

---

## MODULE 12.1 — Chuẩn hoá nguồn tri thức (Knowledge Ingestion & Canonicalization) — P0

### 12.1.1. Đọc & parse 4 file nguồn

- Input: `Knowlegle_RC/ChatGPT.txt`, `Gemini.txt`, `Grok.txt`, `Claude.txt` (text thô, không có cấu trúc format thống nhất giữa 4 file).
- [ ] **DoD:** Viết script/one-off task (Python, chạy 1 lần, không cần API tốn phí nếu parse bằng rule-based được — chỉ dùng Gemini khi văn bản quá tự do không tách được bằng regex/heading) tách mỗi file thành danh sách item có cấu trúc tối thiểu: `{source, category, name, raw_text}` với `category` ∈ {`grammar_topic`, `question_type`, `vocab_topic`}.
  - [ ] Không được bỏ sót mục nào trong 4 file — số lượng item parse ra phải log ra console/report, đối chiếu tay ít nhất 10 mục ngẫu nhiên/file xem đúng không.

### 12.1.2. Đối chiếu chéo 4 nguồn → danh sách chủ điểm chuẩn (canonical)

- [ ] Gộp các item cùng ý nghĩa dù đặt tên khác nhau giữa 4 nguồn (vd "Mệnh đề quan hệ rút gọn" / "Reduced relative clause" / "Rút gọn mệnh đề quan hệ" → 1 canonical topic).
- [ ] Với mỗi canonical topic, ghi lại **source_count** (bao nhiêu trong 4 nguồn có nhắc) và **agreement_note** nếu có mâu thuẫn nội dung giữa các nguồn (vd nguồn A liệt kê là "bẫy hay gặp" nhưng nguồn B không nhắc) — KHÔNG được âm thầm chọn 1 nguồn rồi bỏ qua phần còn lại.
- [ ] **DoD bắt buộc:** map canonical topic ↔ giá trị `grammar_topic`/`topic_category` **đã tồn tại thật trong DB** (từ 15.730 câu hỏi đã trích). Đây là bước quan trọng nhất — nếu tạo ra 1 taxonomy mới không khớp với dữ liệu thật đang có, toàn bộ Module 12 sẽ không có nội dung minh hoạ thật để dùng. Xuất báo cáo: bao nhiêu canonical topic có ≥1 câu hỏi thật trong DB, bao nhiêu topic KHÔNG có câu nào (cần biết trước để không hứa hẹn bài học không có dữ liệu).

### 12.1.3. Lưu trữ

- [ ] Bảng mới `curriculum_topics`: `id, canonical_name, category(grammar_topic/question_type/vocab_topic), level(basic/intermediate/advanced), prerequisite_topic_id (nullable, tự tham chiếu), source_files(json array), mapped_grammar_topic, mapped_topic_category, question_count(cached), created_at`.
- [ ] File seed JSON (`backend/data/curriculum_seed.json`) được version-control được, để review bằng mắt trước khi import DB — không import thẳng từ AI output vào production DB mà không có file trung gian để mày tự sửa tay nếu AI tổng hợp sai.

---

## MODULE 12.2 — Bài Giảng AI Theo Chủ Điểm (Teaching Articles) — P0

### 12.2.1. Sinh nội dung bài giảng cho từng `curriculum_topic`

- Output mỗi bài: `title`, `definition` (định nghĩa dễ hiểu cho người mất gốc), `signal_words` (dấu hiệu nhận biết trong câu), `formula` (công thức/cấu trúc nếu là ngữ pháp), `common_trap` (bẫy hay gặp — tái dùng field đã có ở `questions.common_trap` làm ví dụ thật), `worked_examples` (3-5 câu hỏi THẬT trích từ DB, không tự bịa câu mới ở bước này), `quick_check` (5 câu hỏi cuối bài lấy từ pool câu hỏi thật cùng topic).
- [ ] **DoD:** Bắt buộc trộn ví dụ minh hoạ (`worked_examples`) từ câu hỏi thật đã có trong DB qua `mapped_grammar_topic`/`mapped_topic_category` — nếu topic có 0 câu hỏi thật, bài giảng phải ghi rõ "chưa có ví dụ thật, đang dùng ví dụ AI sinh" thay vì giả vờ là ví dụ từ đề thi thật.
  - [ ] Dùng lại đúng cơ chế cache đã có (`ai_cache`, `input_hash` theo `gemini_service.py`) — build xong phải chứng minh gọi lại 1 bài giảng đã sinh KHÔNG tốn thêm request Gemini, giống tiêu chí DoD 10.1 đã áp dụng cho toàn bộ project.
  - [ ] Nội dung phải viết cho người **mất gốc thật sự** (không dùng thuật ngữ ngữ pháp tiếng Anh chưa giải thích trước khi dùng) — kiểm tra tay ít nhất 3 bài xem có đúng tinh thần "dạy từ số 0" không.

### 12.2.2. Bảng lưu trữ

- [ ] Bảng mới `lessons`: `id, curriculum_topic_id, content_markdown, worked_example_question_ids(json), quick_check_question_ids(json), has_real_examples(bool), created_at, ai_cache_hash`.
- [ ] Render `content_markdown` bằng đúng pipeline `react-markdown` + `remark-gfm` đã dùng ở Module 3, tái sử dụng luôn, không viết renderer mới.

---

## MODULE 12.3 — Từ Vựng Theo Chủ Điểm, Đối Chiếu Tần Suất Thật (Vocab Cross-Reference) — P0

### 12.3.1. Trích danh sách từ vựng "hay gặp" từ 4 nguồn kiến thức

- [ ] Parse riêng phần `vocab_topic` từ 4 file (chủ đề từ vựng: đặt hàng, tuyển dụng, sự kiện, tài chính...) — map vào đúng `topic_category` đã có ở Module 11, KHÔNG tạo enum chủ đề mới trùng lặp.

### 12.3.2. Đối chiếu với dữ liệu thật (`vocabulary.frequency_count`)

- [ ] Với mỗi từ được 4 nguồn liệt kê là "hay gặp trong TOEIC", so khớp xem từ đó đã từng xuất hiện thật trong 158 đề đã trích chưa (join bảng `vocabulary` theo `word`).
- [ ] Gắn nhãn 2 loại rõ ràng cho người học phân biệt: **"Từ đã gặp thật trong đề của mày (kèm số lần)"** vs **"Từ TOEIC hay gặp theo tổng hợp chung nhưng chưa xuất hiện trong đề mày có"** — không được gộp lẫn 2 loại này làm 1 danh sách mập mờ.
- [ ] **DoD:** báo cáo tổng: bao nhiêu % từ trong 4 nguồn đã có sẵn dữ liệu thật, bao nhiêu % chưa — để biết độ phủ dữ liệu hiện tại.

---

## MODULE 12.4 — Bài Test Chẩn Đoán Đầu Vào (Placement Test) — P0

### 12.4.1. Đề chẩn đoán rút gọn

- [ ] Sinh 1 bài test ngắn (đề xuất 25–30 câu, không phải 100 câu full): lấy mẫu rải đều qua các `curriculum_topic` có `level = basic` trước, KHÔNG lấy toàn câu khó để tránh doạ người mất gốc ngay từ đầu.
- [ ] Chấm xong → xuất `mastery_map` ban đầu: mỗi `curriculum_topic` gán trạng thái `unknown / weak / ok` dựa % đúng câu thuộc topic đó (ví dụ: 0 câu đúng hoặc không làm = unknown, <50% = weak, ≥50% = ok — ngưỡng cụ thể để lại cho AI đề xuất khi build, không hardcode cứng mà không giải thích).
- [ ] **DoD:** Test với 1 lượt làm giả lập toàn sai và 1 lượt giả lập toàn đúng, xác nhận `mastery_map` ra đúng 2 thái cực tương ứng, không bị lỗi tính sai %.

---

## MODULE 12.5 — Engine Sắp Xếp Lộ Trình Cá Nhân Hoá (Roadmap Sequencing) — P0

### 12.5.1. Thứ tự phụ thuộc giữa các chủ điểm

- [ ] Dùng field `prerequisite_topic_id` đã định nghĩa ở 12.1.3 để xếp `curriculum_topics` thành chuỗi có thứ tự hợp lý cho người mất gốc (ví dụ: từ loại cơ bản → thì động từ cơ bản → mệnh đề quan hệ → câu bị động/giả định → Part 6 điền đoạn → các dạng câu hỏi Part 7), việc xác định thứ tự phụ thuộc cụ thể để AI agent tổng hợp từ 4 nguồn khi build, không tự bịa nếu cả 4 nguồn đều không gợi ý thứ tự.
- [ ] Chủ điểm nào `mastery_map = ok` từ bài chẩn đoán → đánh dấu "đã biết, học lướt" (không bắt buộc học lại từ đầu) nhưng vẫn cho xem lại nếu muốn.
- [ ] Chủ điểm `weak`/`unknown` → xếp vào lộ trình theo đúng thứ tự phụ thuộc ở trên, ưu tiên `unknown` trước `weak`.

### 12.5.2. Kế hoạch học theo ngày (Daily Plan Generator)

- [ ] Cho người dùng chọn thời gian học/ngày (ví dụ 20 / 40 / 60 phút) → engine chia mỗi ngày gồm: N bài giảng mới (Module 12.2) + M từ vựng cần ôn hôm nay (tái dùng Module 6 SRS `next_review_at <= now`) + K câu luyện tập (tái dùng Module 5).
- [ ] **DoD:** đơn giản hoá — không cần thuật toán lập lịch phức tạp, chỉ cần đảm bảo KHÔNG lặp lại đúng 1 bài giảng đã "hoàn thành" trong plan ngày sau, trừ khi người dùng chủ động chọn "ôn lại".

---

## MODULE 12.6 — Gate Trước Khi Thi Thử Full 495 (Mastery Gate) — P1

### 12.6.1. Điều kiện mở khoá "Thi Thật (Full Exam)" ở chế độ được đề xuất

- [ ] Không khoá cứng — người dùng luôn có thể bấm "Thi Thật" bất cứ lúc nào (không phá vỡ tính năng nộp bài tự do đã có ở Module 2). Nhưng nếu các `curriculum_topic level = basic` chưa đạt `ok`, hiển thị cảnh báo rõ ràng kiểu "Bạn còn N chủ điểm nền tảng chưa vững, có thể điểm sẽ không phản ánh đúng thực lực — vẫn muốn thi luôn?" kèm nút xác nhận bỏ qua.
- [ ] Sau mỗi lượt "Thi Thật" hoặc "Luyện Tập", map câu sai về đúng `curriculum_topic` (tái dùng logic đã có ở weakness-report Module 4.D) để tự động cập nhật `mastery_map`, feedback ngược vào lộ trình 12.5 — không phải làm chẩn đoán lại từ đầu mỗi lần.

---

## MODULE 12.7 — Trang "Lộ Trình Của Tôi" (Roadmap Dashboard UI) — P1

### 12.7.1. Giao diện

- [ ] Danh sách/timeline các `curriculum_topic` theo thứ tự đã sắp ở 12.5, mỗi mục hiển thị trạng thái (chưa học / đang học / đã ok), % hoàn thành tổng.
- [ ] Nút "Học tiếp" luôn trỏ đúng vào bài giảng/hoạt động tiếp theo trong kế hoạch ngày hôm nay (12.5.2), không bắt người dùng tự tìm.
- [ ] Có thể click vào bất kỳ chủ điểm nào để xem trước dù chưa tới lượt (không khoá cứng nội dung, chỉ khoá "thứ tự đề xuất").

---

## Non-functional / DoD xuyên suốt Module 12 (bắt buộc, giống tinh thần Module 10)

- [ ] Toàn bộ gọi Gemini trong Module 12 (parse 4 file nếu cần AI, sinh bài giảng) đều qua `ai_cache` hiện có — không tạo cơ chế cache riêng thứ 2.
- [ ] Không có bước nào trong Module 12 được phép **tự bịa dữ liệu** khi thiếu — nếu 4 nguồn kiến thức mâu thuẫn hoặc DB chưa có câu hỏi thật cho 1 topic, phải hiển thị/log rõ ràng, không âm thầm lấp đầy bằng nội dung generic.
- [ ] Các bảng mới (`curriculum_topics`, `lessons`) phải có index hợp lý (`idx_curriculum_topics_prerequisite`, `idx_lessons_topic`) theo đúng convention index đã liệt kê ở `toeic-local-mvp-design.md`.
- [ ] Trước khi báo "xong Module 12", phải test full flow thật: từ parse 4 file → sinh canonical topics → sinh ít nhất 3 bài giảng thật (có ví dụ thật từ DB) → chạy 1 lượt chẩn đoán giả lập → xem roadmap sinh ra đúng thứ tự → làm 1 lượt luyện tập → xác nhận mastery_map cập nhật đúng.

## Ghi chú cho AI thực thi

- Build và báo cáo tiến độ theo TỪNG mục 12.x, không gộp báo "xong hết Module 12".
- Với mục nào không đạt được DoD (ví dụ không tách được ranh giới nội dung trong 1 trong 4 file .txt vì format quá tự do), phải báo rõ, đề xuất hướng xử lý tay, không giả lập kết quả.
- Đây là spec bổ sung — nếu trong lúc build phát hiện xung đột với Module 1–11 đã có (tên bảng, field trùng, route trùng), ưu tiên giữ nguyên convention đã có trong `toeic-local-mvp-design.md`, không đổi tên field cũ.
