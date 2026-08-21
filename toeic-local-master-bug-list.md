# TOEIC Local App — TỔNG HỢP TOÀN BỘ BUG & VẤN ĐỀ TỒN ĐỌNG (Master Bug List)

> Đây là bản tổng hợp đầy đủ tất cả các vấn đề đã phát hiện qua audit, tính đến thời điểm hiện tại. Chia làm 2 phần: (A) đã xác nhận SỬA ĐÚNG bằng cách đọc code thật — KHÔNG cần làm lại; (B) VẪN CÒN TỒN ĐỌNG — bắt buộc phải xử lý, có bằng chứng cụ thể mới được coi là xong. Không được đánh dấu hoàn thành (`GOAL_COMPLETE`) khi chưa có đủ bằng chứng yêu cầu ở mỗi mục.

---

## PHẦN A — Đã xác nhận sửa đúng (không cần làm lại, chỉ cần không phá lại)

1. Cache Gemini theo hash prompt (`gemini_service.py`) — cache hit/miss log rõ ràng, đã verify code thật.
2. Retry/backoff khi gặp lỗi 429 — đã có trong code.
3. `ai_generator.py`: đã xoá 2 câu hỏi hardcode giả ("Ms. Green...", "The management team..."), thay bằng `HTTPException 400/503` đúng chuẩn — đã verify code, **còn thiếu bằng chứng ảnh chụp UI hiển thị lỗi thật** (xem mục B.1).
4. `quiz.py`: đã sửa `db.query(Vocabulary).all()` → `ORDER BY func.random() LIMIT N` — đã verify code thật ở cả 3 endpoint.
5. `dashboard.py`/`documents.py`: đã dùng `.subquery()` thay vì load ID về Python rồi `.in_()` — đã verify code.
6. `dashboard.py`: filter theo Part đã sửa dùng `Question.part == N` và `appears_in_part` đúng (không còn string-match sai như trước).
7. Cleanup `setTimeout` bằng `useRef` ở `DocumentDetailPage.tsx`/`FlashcardPage.tsx` — đã verify code.
8. `react-window` đã ghim đúng bản `1.8.10` (bản có `FixedSizeList`), import chuẩn — đã verify code, **còn thiếu bằng chứng ảnh chụp UI chạy thật** (xem mục B.2).
9. Đã sửa lại tuyên bố sai "MarkItDown giảm 50-70% token" trong file thiết kế gốc, thay bằng số liệu đo thật (+0.8%, giá trị thật là cấu trúc hoá giúp trích xuất chính xác hơn).
10. OCR: DPI 200 là điểm cân bằng đã benchmark đúng phương pháp (warm-up riêng, 3 lần lặp, cùng 1 trang) — không cần đổi lại.

---

## PHẦN B — TỒN ĐỌNG, BẮT BUỘC PHẢI SỬA (xếp theo ưu tiên)

### 🔴 B.1 — Parser Part 5 cục bộ (`local_parser_service.py`) vẫn sai ở NHIỀU điểm

Đã qua 2 vòng sửa, vẫn còn các lỗi cụ thể sau (bằng chứng: test thật với `RC-TEST_1.pdf`, vòng gần nhất chỉ ra đúng 18/30 câu, thiếu bộ câu khác nhau mỗi lần):

- **B.1.1 — Regex tách câu hỏi vẫn khớp nhầm số liệu giữa câu:** câu 128 ("Around 30 minutes of release...") bị tách nhầm thành câu mới tại số "30" trong "30 minutes". Phải giới hạn: chỉ coi là ranh giới câu hỏi hợp lệ khi số nằm trong dải 101-130 (Part 5 của đề test này) VÀ xuất hiện ở vị trí hợp lý (sau dấu chấm câu trước hoặc đầu văn bản), không phải bất kỳ đâu.
- **B.1.2 — Vẫn thiếu ~12/30 câu, bộ câu thiếu thay đổi giữa các lần chạy** (dấu hiệu bug không ổn định, có thể do race condition trong việc tách block hoặc do B.1.1 làm lệch toàn bộ ranh giới các câu phía sau). Yêu cầu: với MỖI câu bị thiếu, in log rõ ràng nó rơi vào nhánh nào (parse local fail → có vào `failed_blocks` không → Gemini xử lý có lỗi gì không), dán đầy đủ không tóm tắt.
- **B.1.3 — `grammar_topic` vẫn là heuristic từ khoá thô ở local (16/18 câu gắn nhãn "preposition" hàng loạt, sai với nhiều câu thực chất là đại từ/cụm động từ).** Yêu cầu bắt buộc: MỌI câu hỏi (dù parse local hay AI) đều phải qua 1 lượt Gemini RIÊNG để phân loại `grammar_topic` thật, sinh `option_explanations` thật (không phải nhắc lại đáp án), và `translated_sentence` dịch tiếng Việt THẬT (không phải lặp lại tiếng Anh). Có thể gộp nhiều câu vào 1 lần gọi Gemini để tiết kiệm token.
- **B.1.4 — Bỏ hẳn phần "đoán đáp án A theo số từ đáp án B"** (heuristic không đáng tin) — khi thiếu marker `(A)` rõ ràng, đẩy thẳng vào `failed_blocks` cho Gemini, không đoán mò rồi gắn `is_ai_verified: False` như đã parse xong.

**DoD B.1:** Sau khi sửa, upload lại `RC-TEST_1.pdf`, dán ĐỦ 30/30 câu Part 5 (không tóm tắt), kèm `grammar_topic` + `translated_sentence` thật của toàn bộ 30 câu để đối chiếu tay.

### 🔴 B.2 — Chưa rõ Part 6/7 có còn hoạt động đúng sau các thay đổi gần đây không

Nhiều thay đổi gần đây (gộp prompt Câu hỏi+Từ vựng, viết `local_parser_service.py` mới cho Part 5) đều chỉ tập trung vào Part 5. **Chưa có bằng chứng nào xác nhận Part 6 (16 câu) và Part 7 (54 câu) của `RC-TEST_1.pdf` vẫn trích xuất đúng** sau các thay đổi này — có nguy cơ bị ảnh hưởng dây chuyền (ví dụ nếu code dùng chung 1 hàm xử lý JSON response cho cả 3 Part).

**Yêu cầu:** Test riêng Part 6 và Part 7 của `RC-TEST_1.pdf`, dán số liệu: tổng câu trích được so với 16 (Part 6) và 54 (Part 7) thật, kèm 3-5 câu ví dụ cụ thể để đối chiếu tay.

### 🟠 B.3 — Thiếu bằng chứng ảnh chụp UI cho 2 việc đã yêu cầu nhiều lần nhưng chưa nhận được

- **B.3.1:** Đổi tạm API key sai, bấm "Sinh câu tương tự" trên UI thật, chụp ảnh xem thông báo lỗi 400/503 có hiển thị rõ ràng cho người dùng không (không phải chỉ code đúng ở backend).
- **B.3.2:** Vào trang Flashcard, chuyển chế độ Grid List với vài chục từ vựng thật, chụp ảnh xác nhận `react-window` hiển thị đúng, cuộn mượt, không vỡ layout/trắng trang.

### 🟠 B.4 — Chưa xác nhận Night Reading Mode (chế độ đọc đêm ấm dịu mắt) đã được xây dựng chưa

Đã có spec đầy đủ (`toeic-local-theme-colors.md`) với bảng màu cụ thể, nhưng câu hỏi này đã hỏi 2 lần và bị lờ đi để đi làm việc khác (performance). Xác nhận: đã build chưa? Nếu chưa, làm theo đúng file spec đã có, không cần thiết kế lại.

### 🟡 B.5 — Tính năng "ước tính điểm TOEIC" chưa rõ cơ sở tính toán

Xuất hiện trong báo cáo tổng hợp nhưng không nằm trong bất kỳ spec nào đã viết. Yêu cầu: cho xem 1 ví dụ thật (làm vài câu quiz → xem Dashboard ra điểm ước tính dựa trên công thức/logic gì). Nếu chỉ là Gemini tự "bịa" 1 con số nghe hợp lý không có căn cứ quy đổi rõ ràng, phải bỏ tính năng này hoặc ghi chú rõ "ước tính không chính thức, mang tính tham khảo".

### 🟡 B.6 — Cần xác nhận lại toàn bộ luồng OCR cho ảnh scan thật 100% (không có text layer)

Từ đầu dự án tới giờ, phần lớn test đều dùng `RC-TEST_1.pdf` (đã xác nhận CÓ text layer thật, không cần OCR). Cơ chế OCR + tách cột 2 cột cho ảnh scan HOÀN TOÀN không có text layer (như ảnh chụp Part 5 gửi lúc đầu) **chưa từng được test end-to-end thật sự** qua toàn bộ pipeline mới nhất (local_parser + Gemini enrichment). Cần 1 lần test với đúng loại file này trước khi coi OCR module là hoàn thiện.

---

## Quy tắc bắt buộc khi báo cáo tiến độ (nhắc lại, đã vi phạm nhiều lần trước đây)

1. Không dùng `<!-- GOAL_COMPLETE -->` khi chưa đính kèm bằng chứng cụ thể (log thật, số liệu thật, ảnh chụp thật) cho ĐÚNG mục đang làm — không phải mô tả lý thuyết "đã sửa xong".
2. Với mỗi bug ở Phần B, khi báo đã sửa, phải trả lời đúng câu hỏi DoD tương ứng, không lái sang chủ đề khác.
3. Nếu 1 thay đổi có khả năng ảnh hưởng tới phần khác đã từng chạy đúng trước đó (ví dụ sửa Part 5 có thể ảnh hưởng code dùng chung với Part 6/7), phải chủ động test lại cả phần liên đới, không đợi người dùng phát hiện ra sau.
4. Sửa lần lượt theo đúng thứ tự ưu tiên B.1 → B.2 → B.3 → B.4 → B.5 → B.6, không nhảy cóc sang việc khác (bài học từ vụ tự ý đi tối ưu tốc độ trong khi 3 câu hỏi khác chưa được trả lời).
