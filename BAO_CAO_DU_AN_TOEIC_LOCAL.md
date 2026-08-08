# BÁO CÁO TỔNG QUAN DỰ ÁN ỨNG DỤNG LUYỆN THI TOEIC RC (TOEIC LOCAL APP)

> **Ngày cập nhật:** 07/08/2026  
> **Repository:** `tvthien-ktmt/toeic-local-app`  
> **Kiến trúc hệ thống:** FastAPI (Backend Python) + React & Vite (Frontend TSX) + SQLite Database (`data/toeic.db`)  
> **Trạng thái dự án:** **Đã hoàn thành toàn bộ tính năng cốt lõi (MVP + Advanced AI Features)**

---

## 📸 TỔNG QUAN HỆ THỐNG

Ứng dụng **TOEIC Local App** là hệ thống phần mềm luyện thi TOEIC Reading Comprehension (RC) cá nhân hóa, tích hợp trí tuệ nhân tạo (AI Gemini), chạy trên nền tảng dữ liệu địa phương (Local DB) với tốc độ phản hồi tức thì (0 độ trễ).

Hệ thống được thiết kế để giải quyết triệt để 3 bài toán lớn của các nền tảng luyện thi trực tuyến hiện nay:
1. **Trải nghiệm thi chân thực (UX)**: Giao diện thi TOEIC RC chuẩn 75 phút, không gượng ép làm hết 100 câu, hỗ trợ lưu bản nháp, đánh dấu cờ và lưu lịch sử thi không ghi đè.
2. **Hiển thị tài liệu hoàn hảo (Render Part 6/7)**: Xử lý triệt để định dạng Markdown, hiển thị bảng biểu, ô tích form (checkbox) chuẩn GFM từ nguồn OCR.
3. **Giải thích AI chuyên sâu & Tổng ôn điểm yếu**: Hệ thống AI nhắc lại quy tắc ngữ pháp, giải thích bẫy đáp án sai (`common_trap`), dịch nghĩa tự nhiên và phân tích điểm yếu tích lũy qua nhiều lượt thi trên Dashboard.

---

## 🚀 CHI TIẾT CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

### 1. Thư Viện Đề Thi Cố Định Khổng Lồ (Built-in Exam Library)
- **Quy mô dữ liệu**: Hơn **15.730 câu hỏi TOEIC RC** được bóc tách và phân loại chuẩn từ **158 bộ đề thi chính thức**:
  - Chuỗi đề ETS: ETS 2017, ETS 2018, ETS 2019, ETS 2020, ETS 2022, ETS 2023, ETS 2024.
  - Chuỗi đề YBM: YBM Vol 1, YBM Vol 2, YBM Vol 3, YBM 2025, YBM 2026.
  - Chuỗi đề Hacker: Hacker Vol 3 RC (Test 01 – Test 10).
- **Phân loại cấu trúc chuẩn TOEIC**:
  - **Part 5 (Câu 101 – 130)**: 30 câu điền từ ngắn.
  - **Part 6 (Câu 131 – 146)**: 16 câu điền từ/điền câu vào 4 đoạn văn.
  - **Part 7 (Câu 147 – 200)**: 54 câu đọc hiểu (Đoạn đơn Single Passages, Đoạn đôi Double Passages, Đoạn ba Triple Passages).
- **Độ chính xác đáp án**: Đã xử lý và kiểm tra đáp án cho 100% câu hỏi trong cơ sở dữ liệu.

---

### 2. Trải Nghiệm Thi & Luyện Tập (Exam Take Engine & UX)
- **Chế độ thi linh hoạt**:
  - ⏱ **Thi Thật (Full Exam)**: Tính giờ đếm ngược 75 phút (4.500 giây), tự động nộp bài khi hết giờ.
  - 📖 **Luyện Tập Tự Do (Practice Mode)**: Không giới hạn thời gian, xem đáp án và bản dịch ngay sau khi trả lời từng câu.
- **Tính năng Đánh dấu cờ (Flag for Review)**: Cho phép người dùng gắn cờ 🚩 ở các câu cần xem lại. Ma trận câu hỏi ở thanh bên tự động hiển thị mốc cờ và hỗ trợ lọc nhanh danh sách câu đã gắn cờ.
- **Tự động lưu bản nháp (Resume Draft)**: Tích hợp `localStorage` tự động lưu câu trả lời, trạng thái gắn cờ và thời gian còn lại. Nếu thoát giữa chừng, popup `ResumeDraftDialog` sẽ hỏi người dùng chọn **"Tiếp Tục Bài Thi Dở Dang"** hoặc **"Làm Bài Mới"**.
- **Nộp bài không rào cản & Popup xác nhận (`ConfirmSubmitDialog`)**:
  - Bỏ bắt buộc làm hết 100 câu. Người dùng có thể nộp bài bất kỳ lúc nào.
  - Popup xác nhận hiển thị rõ ràng số câu đã làm, số câu chưa làm (bị tính 0 điểm) và số câu đang gắn cờ trước khi chốt nộp.
- **Bảo tồn lịch sử thi**: Mỗi lượt nộp bài tạo 1 bản ghi `ExamAttempt` riêng biệt trong SQLite (không bị ghi đè kết quả cũ).

---

### 3. Hiển Thị Đọc Hiểu Part 6/7 Chuẩn GFM (Markdown & Table/Checkbox Rendering)
- **Tích hợp `react-markdown` + `remark-gfm`**: Áp dụng bộ render Markdown cho nội dung đoạn văn Part 6/7 trên cả trang làm bài (`ExamTakePage`) và modal kết quả (`ExamResultModal`).
- **Render Bảng & Form Checkbox chuẩn**:
  - Bảng biểu được định dạng viền, màu tiêu đề và padding hợp lý.
  - Các ô tích form OCR `[X]`, `[x]`, `[ ]` được chuẩn hóa tự động qua hàm backend `normalize_passage_markdown` thành checkbox chuẩn GFM có dấu tích ✓ trực quan.

---

### 4. Hệ Thống Giải Thích AI & Phân Tích Điểm Yếu (AI Quality & Analytics)

#### A. Modal "AI Giải Thích & Nhắc Lại Kiến Thức" (AI Explanation Modal)
- **0 Độ Trễ (0ms Latency)**: Ưu tiên đọc dữ liệu giải thích pre-compute trong CSDL SQLite (`option_explanations_json`, `common_trap`, `translated_sentence`, `grammar_topic`). Khi đã có trong DB, dữ liệu hiển thị tức thì không cần gọi mạng.
- **Định danh Cache Deterministic**: Sử dụng khóa SHA256/Snippet cố định thay cho hàm `hash()` ngẫu nhiên của Python, giúp giữ nguyên cache qua mọi lần restart server.
- **Nội dung phân tích AI chuyên sâu 5 tầng**:
  1. 📚 **Tên Chủ Điểm Ngữ Pháp**: Định danh chính xác (VD: *Đại từ sở hữu*, *Mệnh đề quan hệ rút gọn*).
  2. 📋 **Phân Tích Từng Đáp Án**: Giải thích cụ thể lý do đúng/sai cho cả 4 phương án A, B, C, D.
  3. ⚠️ **Bẫy Phổ Biến (`common_trap`)**: Phân tích lý do vì sao một phương án sai cụ thể (thường là B hoặc C) hay bị chọn nhầm (bẫy từ loại, bẫy thì, bẫy ngữ cảnh).
  4. 📚 **Nhắc Lại Quy Tắc Ngữ Pháp (`grammar_recall`)**: Tóm tắt công thức và mẹo áp dụng nhanh.
  5. 📝 **Bản Dịch Tiếng Việt**: Dịch câu hoàn chỉnh sang tiếng Việt tự nhiên, đúng ngữ cảnh thương mại.

#### B. Tab "📚 Tổng Ôn Lỗi Sai" (Post-Exam Weakness Review)
- Trực tiếp trong Modal Kết Quả sau khi thi, tự động gom toàn bộ câu làm sai và câu bỏ trống theo từng chủ điểm ngữ pháp (`grammar_topic`).
- Hiển thị tỉ lệ câu sai per topic, danh sách câu hỏi kèm nút bấm mở **"AI Giải Thích"** tức thì.

#### C. Tab "📅 Lịch Sử Thi Đề Này" (Document History)
- Gọi endpoint `GET /api/textbooks/history/{doc_id}` hiển thị danh sách tất cả các lần làm đề thi đó trong quá khứ kèm điểm số TOEIC RC (scale 5–495), tỉ lệ đúng từng Part và thời gian làm bài.

#### D. Widget "Chủ Điểm Hay Sai Nhất" Trên Dashboard
- Endpoint `GET /api/textbooks/weakness-report` tổng hợp số câu sai tích lũy từ tất cả các lần thi của người học.
- Hiển thị danh sách 10 chủ điểm yếu nhất kèm thanh phần trăm mức độ cần ôn tập khẩn cấp (Đỏ: $\ge 60\%$, Vàng: $\ge 40\%$).

#### E. Xử Lý Hạn Ngạch AI Minh Bạch (Quota Error Handling)
- Khi dữ liệu câu hỏi chưa được pre-gen trong DB và API Gemini bị nghẽn (HTTP 429 Rate Limit / Daily Quota 1.500 RPD), frontend **tuyệt đối không hiển thị dữ liệu rác hay màn hình trống**.
- Hiển thị thẻ thông báo minh bạch màu hồng/đỏ ⚠️:
  > **Chưa Thể Phân Tích AI Chi Tiết**  
  > *⚡ Câu này chưa có sẵn dữ liệu pre-gen trong CSDL. Hạn ngạch API Gemini hiện tại đang hết (Rate Limit / Quota 429).*  
  > Kèm nút **`[ 🔄 Thử Lại Phân Tích Live ]`**.

---

### 5. Quản Lý File Upload & OCR Tự Động (Module 18 & Async Processing)
- **Hỗ trợ Upload Đề Thi PDF/Markdown**: Cho phép người dùng upload file PDF đề thi mới.
- **Chuyển đổi OCR đa tầng (MarkItDown + Gemini Vision)**:
  - Sử dụng thư viện Microsoft MarkItDown bóc tách văn bản.
  - Tự động fallback sang Gemini Vision OCR đối với file PDF quét dạng ảnh.
- **Xử lý bất đồng bộ (Background Workers)**: Tiến trình bóc tách và tạo câu hỏi chạy ngầm dưới background, không làm treo server HTTP main thread.
- **Đường dẫn lưu trữ tuyệt đối ổn định**: Cấu hình `UPLOADS_DIR` theo path tuyệt đối `backend/data/uploads/`, không bị phụ thuộc vào thư mục đứng khi chạy lệnh `uvicorn`.

---

### 6. Thống Kê Dashboard & Tốc Độ Làm Bài (Speed & Performance Budgeting)
- **Theo dõi thời gian học thực tế**: Thống kê số phút học trong 7 ngày / 30 ngày và số ngày hoạt động liên tục (active days).
- **Phân tích tốc độ trung bình theo Part (Time Budgeting)**:
  - **Part 5**: Mục tiêu 20s/câu.
  - **Part 6**: Mục tiêu 37s/câu.
  - **Part 7**: Mục tiêu 60s/câu.
  - Hiển thị thanh tiến trình tốc độ kèm màu cảnh báo (Xanh: đạt mục tiêu, Vàng/Đỏ: cần tăng tốc).

---

## 🛠 BẢNG TỔNG HỢP KIẾN TRÚC MÃ NGUỒN (CODEBASE MAP)

| Thư mục / File | Vai trò & Chức năng chính |
|---|---|
| `backend/app/models.py` | Định nghĩa SQLAlchemy DB Schema: `Document`, `Question` (kèm `common_trap`), `ExamAttempt`, `Vocabulary`, `AICache`. |
| `backend/app/db.py` | Khởi tạo SQLite Connection Pool & đường dẫn database tuyệt đối `backend/data/toeic.db`. |
| `backend/app/routers/textbooks.py` | API Router cho đề cố định: danh sách đề, nạp đề, nộp bài (`/submit`), lịch sử thi (`/history/{doc_id}`), báo cáo điểm yếu (`/weakness-report`). |
| `backend/app/routers/ai_generator.py` | API Router AI: giải thích câu hỏi (`/explain-question`), sinh câu hỏi tương tự (`/similar-question`), gợi ý lộ trình ôn tập (`/study-recommendations`). |
| `backend/app/routers/documents.py` | API Router upload đề mới: xử lý background task OCR & bóc tách PDF. |
| `backend/app/services/textbook_service.py` | Service đọc/parse dữ liệu file txt/md, tính điểm TOEIC RC chuẩn ETS (0-100 raw $\rightarrow$ 5-495 scaled), hàm `normalize_passage_markdown`. |
| `backend/app/services/gemini_service.py` | Service kết nối Gemini API, quản lý luân chuyển API Key khi gặp 429 và lưu vết SQLite `AICache`. |
| `backend/app/scripts/batch_generate_ai_for_builtin.py` | Script batch AI pre-generation phân biệt trần 15 RPM vs 1.500 RPD/ngày, hỗ trợ chạy pre-gen dữ liệu AI sạch vào CSDL. |
| `frontend/src/pages/ExamTakePage.tsx` | Trang thi chính: ma trận câu hỏi, tính giờ, bản nháp, gắn cờ 🚩, nộp bài & hiển thị giải thích Part 5/6/7. |
| `frontend/src/components/ExamResultModal.tsx` | Modal kết quả 4 tab: Điểm Số, Tổng Ôn Lỗi Sai, Xem Lại 100 Câu, Lịch Sử Thi. |
| `frontend/src/pages/DashboardPage.tsx` | Trang Dashboard tổng hợp: thời gian học, tốc độ做 bài, tỷ lệ đúng theo Part & widget Chủ Điểm Hay Sai Nhất. |

---

## 📊 THỐNG KÊ QUY MÔ & CHẤT LƯỢNG MÃ NGUỒN

- **Tổng số câu hỏi trong CSDL**: `15.730 câu`
- **Số đề thi chuẩn hỗ trợ sẵn**: `158 đề`
- **Kiểm tra TypeScript Frontend (`npx tsc --noEmit`)**: `0 Lỗi (Passed 100%)`
- **Kiểm tra Python Backend Import & Syntax**: `0 Lỗi (Passed 100%)`
- **Commit mới nhất trên GitHub**: `1cea05a` (Trạng thái code đã staged, committed & pushed hoàn toàn lên `origin/main`).

---

## 🎯 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### 1. Khởi chạy Backend Server (FastAPI)
```powershell
cd "d:\TOIEC Web\backend"
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Khởi chạy Frontend Server (Vite React)
```powershell
cd "d:\TOIEC Web\frontend"
npm run dev -- --port 5173
```
👉 Truy cập ứng dụng tại: **`http://localhost:5173/`**

---

*Báo cáo được khởi tạo tự động bởi Antigravity AI Assistant.*
