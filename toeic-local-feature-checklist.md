# TOEIC Local App — Feature Checklist chi tiết (Build Spec)

> Dùng kèm với `toeic-local-mvp-design.md`. Tài liệu này liệt kê **TỪNG chức năng cụ thể**, kèm input/output, edge case, và **Definition of Done (DoD)** để AI agent build không được báo "xong" khi chưa đủ tiêu chí. Build theo đúng thứ tự Priority P0 → P1 → P2. Không được bỏ qua DoD của bất kỳ mục nào.

---

## MODULE 1 — Upload & Convert tài liệu (P0 — bắt buộc có trước mọi thứ khác)

### 1.1. Upload file PDF đề thi RC hoặc transcript LC
- Input: file PDF (và tùy chọn: .docx, .txt nếu có).
- Chọn loại tài liệu khi upload: `RC_EXAM` (Part 5/6/7) hoặc `LC_TRANSCRIPT` (Part 1-4).
- **DoD:**
  - [ ] Upload thành công lưu file gốc (hoặc chỉ giữ nội dung, tuỳ quyết định lưu trữ) + tính `content_hash`.
  - [ ] Nếu `content_hash` trùng tài liệu đã có → KHÔNG convert lại, trả về document cũ kèm cảnh báo "tài liệu đã tồn tại".
  - [ ] Upload file rỗng/hỏng/không phải PDF hợp lệ → trả lỗi rõ ràng, không crash server.

### 1.2. Convert PDF → Markdown bằng MarkItDown
- **DoD:**
  - [ ] Gọi đúng MarkItDown, lưu kết quả vào `documents.markdown_content`.
  - [ ] Có bước kiểm tra: nếu Markdown output rỗng hoặc quá ngắn bất thường so với số trang PDF → đánh dấu `status = 'conversion_failed'`, KHÔNG âm thầm coi là thành công.
  - [ ] Hiển thị được nội dung Markdown thô ra 1 trang debug/preview trong frontend (để tự kiểm tra chất lượng convert bằng mắt).

### 1.3. Xoá / quản lý tài liệu đã upload
- [ ] Danh sách tất cả tài liệu đã upload (tên, loại, ngày, trạng thái xử lý).
- [ ] Xoá tài liệu → phải hỏi xác nhận vì sẽ xoá luôn `questions`/`vocabulary` liên quan (cascade), hoặc cho chọn "chỉ xoá file, giữ vocab/câu hỏi đã trích".

---

## MODULE 2 — Trích xuất câu hỏi Part 5/6/7 (P0)

### 2.1. Chunking theo Part
- [ ] Nhận diện đúng ranh giới Part 5 / Part 6 / Part 7 trong Markdown (dựa heading hoặc pattern số câu "101.", "131.", "147-151" v.v).
- [ ] Nếu không nhận diện được ranh giới rõ ràng → KHÔNG tự bịa, phải để trạng thái "cần review thủ công" và hiển thị cảnh báo cho người dùng, kèm đoạn Markdown thô để tự cắt tay nếu cần.

### 2.2. Trích câu hỏi Part 5 (điền từ, 4 đáp án)
- Output mỗi câu: `question_text`, 4 `options`, `correct_answer` (có thể null), `grammar_topic`, `explanation`.
- **DoD:**
  - [ ] Số câu trích ra phải khớp (hoặc gần khớp, chênh lệch được log rõ) với số câu hỏi thực tế trong đề (ví dụ đề có 30 câu Part 5 thì phải trích ra 30, nếu thiếu phải log/cảnh báo con số thiếu, không được âm thầm bỏ sót).
  - [ ] `grammar_topic` không được để trống hàng loạt (nếu Gemini trả về generic/không rõ, phải có fallback giá trị "unclassified" thay vì null im lặng).
  - [ ] Test với ít nhất 1 đề thật, đối chiếu tay 5 câu ngẫu nhiên xem trích đúng nội dung/đáp án không.

### 2.3. Trích câu hỏi Part 6 (điền đoạn văn, có 4 câu hỏi/đoạn)
- [ ] Giữ đúng liên kết giữa đoạn văn (passage) và 4 câu hỏi con của nó — không được xáo trộn câu hỏi sang nhầm đoạn khác.
- [ ] Gắn `passage_type` và `topic_tag` cho từng đoạn.

### 2.4. Trích câu hỏi Part 7 (đọc hiểu, đơn/đa văn bản)
- [ ] Phân biệt được single passage vs double/triple passage (nếu đề có).
- [ ] Với multi-passage, câu hỏi có thể tham chiếu chéo giữa các văn bản — phải lưu được `passage_type` gộp và giữ nguyên toàn bộ ngữ cảnh cần thiết để hiển thị lại đúng khi luyện tập (không cắt mất văn bản gốc).

### 2.5. Hiển thị danh sách câu hỏi đã trích
- [ ] Trang xem danh sách câu hỏi theo tài liệu, lọc theo Part.
- [ ] Bấm vào 1 câu → xem chi tiết: câu hỏi, 4 đáp án, đáp án đúng (ẩn/hiện được), giải thích, grammar_topic/topic_tag.
- [ ] Trạng thái câu hỏi thiếu đáp án đúng (`correct_answer = null`) phải hiển thị rõ ràng, KHÔNG được hiện random 1 đáp án như thể chắc chắn đúng.

---

## MODULE 3 — Trích xuất & quản lý từ vựng (P0)

### 3.1. Trích xuất từ vựng từ đề RC
- Output mỗi từ: `word`, `ipa`, `part_of_speech`, `meaning_vi`, `example_sentence`.
- **DoD:**
  - [ ] Loại bỏ trùng lặp — nếu 1 từ xuất hiện ở nhiều tài liệu/part, tăng `frequency_count` thay vì tạo record mới trùng.
  - [ ] IPA phải có giá trị hợp lệ (không để trống hàng loạt); nếu Gemini không chắc, đánh dấu rõ để người dùng biết cần tự kiểm tra lại.
  - [ ] `meaning_vi` phải là nghĩa phù hợp NGỮ CẢNH câu trong đề, không phải nghĩa đầu tiên trong từ điển chung chung (kiểm tra tay vài từ đa nghĩa để verify).

### 3.2. Trích xuất từ vựng/cụm từ từ transcript nghe (Part 1-4)
- [ ] Tách riêng theo `appears_in_part` = listening_part_1/2/3/4.
- [ ] Ưu tiên cụm từ/collocation hay gây nhầm khi nghe (không chỉ từ đơn lẻ).

### 3.3. Trang danh sách từ vựng
- [ ] Lọc theo: tài liệu nguồn, part xuất hiện, đã học/chưa học (dựa flashcard SRS level).
- [ ] Sắp xếp theo tần suất xuất hiện (từ hay gặp nhất lên đầu — ưu tiên học trước).
- [ ] Tìm kiếm từ theo tên.

### 3.4. Đọc tiếng Anh (TTS) cho từng từ/câu ví dụ
- [ ] Dùng Web Speech API (`speechSynthesis`), không gọi AI/token cho việc này.
- [ ] Có nút phát âm riêng cho từ và riêng cho câu ví dụ.
- [ ] Xử lý trường hợp trình duyệt không hỗ trợ giọng tiếng Anh → thông báo rõ, không lỗi im lặng.

---

## MODULE 4 — Sinh câu hỏi tương tự (P1)

### 4.1. Sinh câu hỏi Part 5 tương tự dựa trên câu gốc
- [ ] Giữ đúng `grammar_topic` của câu gốc.
- [ ] Câu mới phải khác nghĩa/ngữ cảnh câu gốc — có bước kiểm tra tự động (so sánh độ tương đồng chuỗi thô) để phát hiện Gemini "lười" chỉ đổi vài từ.
- [ ] Đáp án sai (distractor) phải hợp lý về ngữ pháp (không phải sai hiển nhiên) — kiểm tra tay ít nhất 5 câu sinh ra.
- [ ] Lưu với `is_generated = 1`, `source_question_id` trỏ về câu gốc, để phân biệt với câu hỏi gốc từ đề thật.

### 4.2. Sinh câu hỏi từ vựng tương tự (dùng từ trong đề đã có)
- [ ] Cho phép chọn 1 nhóm từ vựng (theo chủ đề/part) → sinh bộ câu hỏi trắc nghiệm chọn nghĩa/chọn từ đúng dùng CHÍNH các từ đã học, không bịa từ mới lạ ngoài phạm vi đã học.

---

## MODULE 5 — Luyện theo chủ đề (P1)

### 5.1. Luyện Part 5 theo chủ điểm ngữ pháp
- [ ] Danh sách các `grammar_topic` đã có trong DB (dạng dropdown/tag), kèm số lượng câu hỏi mỗi topic.
- [ ] Chọn 1 topic → hiển thị bài luyện gồm cả câu gốc + câu AI sinh thêm (trộn ngẫu nhiên).
- [ ] Chấm điểm ngay, hiển thị giải thích khi trả lời sai.

### 5.2. Luyện Part 6/7 theo chủ đề văn bản
- [ ] Danh sách `topic_tag` (email, memo, advertisement...) kèm số lượng bài.
- [ ] Chọn topic → luyện các đoạn văn + câu hỏi thuộc topic đó.

### 5.3. Theo dõi kết quả luyện tập (tối thiểu, không cần dashboard phức tạp)
- [ ] Mỗi lần làm bài lưu vào `practice_attempts` (đúng/sai, thời gian).
- [ ] Hiển thị đơn giản: số câu đã làm, % đúng theo từng grammar_topic/topic_tag — giúp biết đang yếu chủ điểm nào.

---

## MODULE 6 — Flashcard (SRS) (P1)

### 6.1. Giao diện flashcard
- [ ] Lật thẻ xem nghĩa, phát âm TTS ngay trên thẻ.
- [ ] 2 chế độ tối thiểu đánh giá: "Nhớ" / "Chưa nhớ" (đơn giản hoá, không cần 4-5 mức độ phức tạp của Anki thật).

### 6.2. Logic SRS (đơn giản hoá SM-2)
- [ ] "Chưa nhớ" → reset `srs_level = 0`, `next_review_at` = ngay hôm sau.
- [ ] "Nhớ" → tăng `srs_level`, tăng khoảng cách `next_review_at` theo cấp số (vd 1 ngày → 3 ngày → 7 ngày → 14 ngày → 30 ngày).
- [ ] Trang "Từ cần ôn hôm nay" lấy đúng các từ có `next_review_at <= now`.
- [ ] **DoD kiểm tra:** giả lập vài chu kỳ "Nhớ liên tiếp" phải thấy khoảng cách ngày tăng dần đúng công thức, không bị đứng yên hoặc tăng vô hạn không kiểm soát.

---

## MODULE 7 — Trắc nghiệm ôn từ vựng (Quiz) (P1)

### 7.1. Quiz chọn nghĩa đúng
- [ ] Cho 1 từ, 4 đáp án nghĩa tiếng Việt (1 đúng + 3 distractor lấy từ các từ vựng khác trong DB, không tự sinh distractor vô nghĩa).
- [ ] Chấm điểm ngay, lưu `practice_attempts`.
- [ ] Có thể chọn phạm vi quiz: theo tài liệu, theo part, theo "từ chưa thuộc" (srs_level thấp).

### 7.2. Quiz nghe → chọn từ đúng (tuỳ chọn, nếu kịp)
- [ ] Phát âm từ (TTS) → người dùng chọn đúng từ trong 4 lựa chọn chữ viết gần giống nhau (để luyện phân biệt phát âm).

---

## MODULE 8 — Gõ lại từ (Typing Practice) (P1)

### 8.1. Gõ từ khi nghe/xem nghĩa
- [ ] Hiển thị nghĩa tiếng Việt (hoặc phát âm TTS) → người dùng gõ từ tiếng Anh.
- [ ] So khớp chuỗi: case-insensitive, trim khoảng trắng thừa; có gợi ý ký tự gần đúng khi sai (tuỳ chọn, không bắt buộc P0).
- [ ] Lưu kết quả vào `practice_attempts` với `attempt_type = 'typing'`.
- [ ] **DoD:** test với từ có dấu đặc biệt / từ có khoảng trắng (cụm từ 2-3 từ) phải so khớp đúng, không báo sai oan.

---

## MODULE 11 — Từ vựng phân loại theo chủ đề (Topic Album) — Part 5/6/7 + Part 1-4 (P1)

> Mục tiêu: ngoài lọc theo tài liệu nguồn/part (Module 3.3), người dùng cần duyệt từ vựng theo **chủ đề chủ điểm** (khác với `grammar_topic` vốn chỉ áp dụng cho câu hỏi Part 5), giống mô hình "album từ vựng theo chủ đề" — giúp học tập trung theo mảng nội dung thay vì học tràn lan.

### 11.1. Thêm field phân loại chủ đề cho từ vựng
- Bổ sung cột `topic_category` vào bảng `vocabulary` (khác với `appears_in_part`/`grammar_topic` đã có).
- Với Part 5/6: `topic_category` gắn theo **chủ điểm ngữ pháp lớn** mà từ đó thuộc về (ví dụ: từ loại cơ bản, hậu tố danh/tính/động/trạng từ, mệnh đề quan hệ, câu bị động, thì động từ, giới từ/liên từ, so sánh, đại từ...) — dùng để nhóm từ vựng liên quan đến 1 điểm ngữ pháp cụ thể lại với nhau.
- Với Part 7 (và có thể Part 6): `topic_category` gắn theo **chủ đề nội dung/tình huống** (ví dụ: đặt hàng/dịch vụ, cảm ơn - xin lỗi, sự kiện/lễ kỷ niệm, mua sắm - giảm giá, đề xuất - kiến nghị, dịch vụ khách hàng, kinh doanh, tài chính - ngân sách, bất động sản, tuyển dụng - nhân sự, du lịch - đi lại...).
- Với Part 1-4 (Listening): `topic_category` gắn theo **bối cảnh hội thoại/tình huống nghe** (ví dụ: văn phòng - công sở, giao thông - di chuyển, ăn uống - nhà hàng, mua sắm, y tế, công nghệ - thiết bị, sự kiện - hội nghị, nhân sự - tuyển dụng).
- Danh mục chủ đề nên là **danh sách cấu hình được** (enum trong DB hoặc bảng `topic_categories` riêng), không hardcode cứng trong code, để dễ mở rộng sau này.

### 11.2. Gán chủ đề tự động khi trích xuất
- Khi Gemini trích xuất từ vựng (prompt 8.3/8.5), yêu cầu trả thêm field `topic_category` chọn từ danh sách chủ đề đã định nghĩa sẵn (đưa danh sách chủ đề vào trong prompt để Gemini chọn đúng 1 trong số đó, tránh bịa chủ đề mới lung tung không kiểm soát được).
- Nếu Gemini không chắc chủ đề nào phù hợp → gán `topic_category = "khác/chưa phân loại"`, không được để trống.

### 11.3. Trang duyệt từ vựng theo "Album chủ đề"
- [ ] Giao diện dạng danh sách album theo chủ đề (mỗi thẻ hiển thị: tên chủ đề, tổng số từ, số từ "đã nhớ" dựa trên `flashcards.srs_level` > ngưỡng nào đó).
- [ ] Bấm vào 1 album → vào thẳng chế độ học (flashcard/quiz/typing) chỉ với từ vựng thuộc chủ đề đó.
- [ ] Lọc kết hợp: chủ đề + part + đã học/chưa học (tái sử dụng bộ lọc đã có ở Module 3.3).

### 11.4. Trang duyệt chủ điểm ngữ pháp (Grammar Topic Browser) cho Part 5/6
- [ ] Danh sách các chủ điểm ngữ pháp (tái dùng field `grammar_topic` đã có ở `questions`, cộng thêm `topic_category` mới của `vocabulary` nếu áp dụng ngữ pháp cho từ vựng) — hiển thị dạng cây/nhóm theo section lớn (ví dụ: nhóm "Từ loại cơ bản" gồm các mục con danh từ/tính từ/trạng từ/đại từ; nhóm "Động từ" gồm thể bị động/thể giả định/câu mệnh lệnh; nhóm "Mệnh đề" gồm quan hệ/trạng ngữ/danh ngữ...).
- [ ] Mỗi chủ điểm hiển thị số câu hỏi Part 5/6 liên quan + link vào luyện tập (đã có ở Module 5.1).

**DoD:**
- [ ] Danh sách `topic_categories` phải là dữ liệu có cấu trúc (bảng riêng hoặc enum rõ ràng trong code), không phải chuỗi tự do Gemini trả về tuỳ ý.
- [ ] Test thực tế: upload ≥1 tài liệu, trích xuất từ vựng, xác nhận mỗi từ có `topic_category` hợp lệ (không rỗng, không nằm ngoài danh sách đã định nghĩa).
- [ ] Trang Album hiển thị đúng số lượng từ/số đã nhớ khớp với dữ liệu thật trong DB (đối chiếu tay ít nhất 1 album).

---

## MODULE 9 — Hỗ trợ Listening Part 1-4 (P2 — làm sau nếu còn thời gian)

- [ ] Upload transcript riêng theo từng Part.
- [ ] Trích từ vựng/cụm từ hay gặp (đã có ở Module 3.2).
- [ ] (Tuỳ chọn mở rộng, KHÔNG bắt buộc MVP) nếu có file audio kèm transcript, có thể thêm nghe + đọc transcript song song — nhưng đây là tính năng mở rộng, không phải P0/P1.

---

## MODULE 10 — Hạ tầng & Chất lượng (Non-functional, P0 nhưng xuyên suốt tất cả module)

### 10.1. Cache Gemini API
- [ ] Mọi lời gọi Gemini đều tính `input_hash` (theo prompt_type + nội dung chunk) trước khi gọi, tra `ai_cache` trước.
- [ ] **DoD kiểm tra bắt buộc:** upload lại đúng 1 tài liệu / gọi lại đúng 1 thao tác trích xuất → xác nhận bằng log là KHÔNG có request Gemini mới nào được gửi (chỉ dùng cache). Đây là tiêu chí quan trọng nhất của cả dự án — AI build xong phải chứng minh được bằng log, không chỉ nói "đã cache".

### 10.2. Xử lý lỗi & rate limit Gemini
- [ ] Có retry/backoff khi gặp lỗi rate limit (429) từ Gemini free tier.
- [ ] Không được để 1 lỗi API làm crash toàn bộ pipeline convert nhiều chunk — lỗi ở 1 chunk chỉ đánh dấu chunk đó fail, các chunk khác vẫn tiếp tục.

### 10.3. Hiệu năng khi dữ liệu tăng dần
- [ ] Các trang danh sách (questions, vocabulary) phải có phân trang hoặc lazy load, không load hết toàn bộ 1 lần khi số lượng lớn dần theo thời gian dùng lâu dài.
- [ ] Index DB đúng như đã định nghĩa trong file thiết kế chính (`idx_questions_part_topic`, `idx_vocab_word`, `idx_flashcards_next_review`...).

### 10.4. Kiểm thử tổng thể trước khi báo "hoàn thành MVP"
- [ ] Chạy full flow với ít nhất 2 đề RC thật + 1 transcript LC thật, từ upload đến luyện flashcard/quiz/typing, không có bước nào lỗi ngầm.
- [ ] Liệt kê rõ ràng những gì CHƯA làm được / còn giới hạn (không được báo cáo "hoàn thành 100%" nếu còn tính năng P1/P2 chưa xong — phải nói rõ đã xong đến P mức nào).

---

## Ghi chú cho AI thực thi (GLM/GPT)

- Build và báo cáo tiến độ theo TỪNG module ở trên, không gộp báo cáo "đã xong hết" mà không đối chiếu từng DoD.
- Với mỗi module hoàn thành, phải tự liệt kê rõ: mục nào đã test thật (có bằng chứng: log, screenshot, số liệu cụ thể), mục nào chỉ code xong nhưng chưa test.
- Nếu gặp giới hạn kỹ thuật khiến không đạt DoD nào đó (vd MarkItDown không tách được layout 2 cột Part 7), phải báo rõ ràng thay vì âm thầm bỏ qua hoặc giả lập kết quả.
