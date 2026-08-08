# PROMPT — Dán vào Claude Code (đã có mattpocock-skills) trong thư mục `d:\TOIEC Web\toeic-local-app`

> Cách dùng: mở terminal Claude Code tại `d:\TOIEC Web\toeic-local-app` (KHÔNG phải tại thư mục `mattpocock-skills` mày đã clone riêng — skill cần nằm trong chính project để `/setup-matt-pocock-skills` chạy đúng). Nếu chưa cài skill vào project này, chạy trước:
>
> ```powershell
> cd "d:\TOIEC Web\toeic-local-app"
> npx skills@latest add mattpocock/skills
> ```
> Khi installer hỏi, chọn ít nhất: `setup-matt-pocock-skills`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, `domain-modeling`. Sau đó chạy 1 lần: `/setup-matt-pocock-skills` (chọn issue tracker = local files nếu không dùng GitHub Issues/Linear).
>
> Xong bước cài đặt thì dán toàn bộ khối bên dưới vào session Claude Code.

---

Bạn là kỹ sư phần mềm đang tiếp quản dự án **TOEIC Local App** (`d:\TOIEC Web\toeic-local-app`, FastAPI + React/Vite + SQLite). Trước khi viết bất kỳ dòng code nào, hãy làm đủ các bước sau, THEO ĐÚNG THỨ TỰ:

## Bước 1 — Đọc hiểu codebase và spec hiện có

1. Đọc `BAO_CAO_DU_AN_TOEIC_LOCAL_MVP.md`, `toeic-local-mvp-design.md`, `toeic-local-feature-checklist.md`, `toeic-local-ocr-addon.md` ở root repo — đây là spec gốc, phải tuân thủ đúng convention đặt tên bảng/field/route đã có, không đổi lại.
2. Đọc thực tế các file mã nguồn chủ chốt: `backend/app/models.py`, `backend/app/db.py`, `backend/app/routers/textbooks.py`, `backend/app/routers/ai_generator.py`, `backend/app/services/textbook_service.py`, `backend/app/services/gemini_service.py`, `backend/app/scripts/batch_generate_ai_for_builtin.py`, và các trang frontend liên quan (`ExamTakePage.tsx`, `ExamResultModal.tsx`, `DashboardPage.tsx`).
3. Xác nhận trạng thái DB thật hiện tại: chạy query đếm số câu hỏi theo `grammar_topic`, số record `vocabulary` theo `topic_category`. Đây là dữ liệu thật sẽ dùng làm ví dụ trong bài giảng — không được giả định số liệu trong báo cáo cũ mà không kiểm tra lại DB thật.

## Bước 2 — Đọc và tổng hợp 4 nguồn kiến thức TOEIC RC

Đọc toàn bộ nội dung 4 file trong `d:\TOIEC Web\Knowlegle_RC\`:
- `ChatGPT.txt`
- `Gemini.txt`
- `Grok.txt`
- `Claude.txt`

Mỗi file là bản tổng hợp độc lập (do 4 AI khác nhau viết) về kiến thức Part 5/6/7 TOEIC: chủ điểm ngữ pháp, dạng câu hỏi, chủ đề từ vựng hay gặp. Hãy:

1. Trích ra từ mỗi file danh sách item có cấu trúc: `{nguồn, loại (ngữ pháp / dạng câu hỏi / chủ đề từ vựng), tên, mô tả ngắn}`.
2. Đối chiếu chéo 4 nguồn, gộp các mục trùng ý nghĩa nhưng đặt tên khác nhau thành 1 "canonical topic" duy nhất. Ghi chú rõ nguồn nào có nhắc, nguồn nào không, có mâu thuẫn gì không — KHÔNG được chọn 1 nguồn rồi bỏ qua phần còn lại.
3. Đối chiếu danh sách canonical topic với dữ liệu thật đã đếm ở Bước 1.3 — xác nhận topic nào có sẵn câu hỏi thật trong DB, topic nào chưa có.

Việc tổng hợp này chính là input cho spec Module 12 dưới đây — bạn cần tự làm bước phân tích này bằng chính bạn (đọc file thật), không được bịa danh sách chủ điểm từ kiến thức training chung chung thay cho việc đọc file.

## Bước 3 — Đối chiếu với spec Module 12

Đọc file `MODULE_12_MASTER_RC_ROADMAP.md` (đính kèm/đã đặt cùng thư mục repo) — đây là bản đặc tả chi tiết cho tính năng cần xây: một lớp "curriculum" (lộ trình học có thứ tự + bài giảng AI theo từng chủ điểm + chẩn đoán đầu vào + gate trước khi thi thử full 495) xây TRÊN dữ liệu Module 1–11 đã có, phục vụ đúng 1 người dùng (chạy localhost, không multi-user, không cần auth phức tạp).

## Bước 4 — Chạy đúng quy trình skill, không nhảy cóc

1. Chạy `/grill-with-docs` với chủ đề: "Triển khai Module 12 — Lộ trình Master RC 495 dựa trên kết quả đối chiếu 4 nguồn kiến thức ở Bước 2 và spec `MODULE_12_MASTER_RC_ROADMAP.md`". Mục tiêu của phiên grill này: chốt các quyết định spec còn mở (ngưỡng mastery %, số câu chẩn đoán, thứ tự phụ thuộc giữa các chủ điểm cụ thể lấy từ đối chiếu 4 nguồn), cập nhật `CONTEXT.md` với ngôn ngữ chung của dự án (vd định nghĩa chính xác "canonical topic", "mastery_map", "curriculum".
2. Chạy `/to-tickets` để bổ ra thành các ticket tracer-bullet theo đúng thứ tự Module 12.1 → 12.7 đã liệt kê trong spec, mỗi ticket khai báo rõ blocking edge (12.1 chặn 12.2/12.3, 12.4 chặn 12.5, v.v.).
3. Với mỗi ticket, chạy `/implement` (tự động dùng `/tdd` ở các seam quan trọng — đặc biệt là logic tính `mastery_map` và engine sắp xếp lộ trình 12.5, đây là 2 chỗ cần test tự động nhất vì dễ sai âm thầm).
4. Trước khi commit mỗi ticket, chạy `/code-review`.
5. Sau khi cả 7 mục Module 12 xong, chạy lại toàn bộ DoD liệt kê ở cuối `MODULE_12_MASTER_RC_ROADMAP.md`, báo cáo theo đúng format đã dùng cho Module 1–11 trong `toeic-local-feature-checklist.md` (mục nào đã test thật có bằng chứng, mục nào chỉ code xong chưa test).

## Ràng buộc bắt buộc trong suốt quá trình

- App chạy hoàn toàn localhost, phục vụ 1 người dùng — không thêm hệ thống auth/multi-user không cần thiết.
- Không tạo taxonomy chủ điểm mới không khớp với `grammar_topic`/`topic_category` đã có trong DB thật — phải map vào field cũ theo đúng yêu cầu 12.1.2.
- Mọi nội dung bài giảng AI sinh phải qua `ai_cache` hiện có (`gemini_service.py`) — không tạo cơ chế cache riêng thứ hai.
- Không được tự bịa ví dụ/câu hỏi khi DB chưa có dữ liệu thật cho 1 chủ điểm — phải báo rõ thiếu dữ liệu.
- Sau mỗi module con (12.1 → 12.7), dừng lại báo cáo tiến độ kèm bằng chứng cụ thể (số liệu, log) trước khi sang module tiếp theo — không gộp báo "xong hết" một lần cuối.
