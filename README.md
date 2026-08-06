# 🎯 TOEIC Local Web App — Luyện Thi TOEIC RC & Thi Thử Online

Web App luyện thi TOEIC Reading (RC 75 phút & Luyện tập tự do) với trọn bộ 17 bộ sách thi cố định (ETS 2017-2026, Hacker, YBM 2025-2026, Xanh Cam), tính năng xem đáp án sau nộp bài và trợ lý **✨ AI Giải Thích & Nhắc Lại Kiến Thức**.

---

## 🚀 Tính Năng Nổi Bật

1. **Kho Đề Thi Cố Định Trọn Bộ:**
   - 17 bộ sách TOEIC chuẩn (`ETS 2017` đến `ETS 2026`, `HACKER Vol 3`, `YBM 2025`, `YBM 2026`, `YBM Vol 1-3`, `Xanh Cam Vol 1-2`).
   - Hơn 151+ đề thi hoàn chỉnh với 100% đáp án chuẩn.
2. **2 Chế Độ Luyện Thi:**
   - ⏱️ **Thi Thật RC 75 Phút**: Có đồng hồ đếm ngược 75 phút, ma trận 100 câu hỏi, tự động nộp bài khi hết giờ.
   - 🎯 **Luyện Tập Tự Do**: Không giới hạn thời gian, tự do luyện tập từng Part.
3. **Giải Thích Chi Tiết Bằng AI (Gemini Flash AI):**
   - Phân tích chi tiết từng câu hỏi (cả câu đúng và câu sai).
   - Ôn tập & nhắc lại kiến thức ngữ pháp trọng tâm.
   - Cung cấp mẹo làm bài (Exam Tips) và dịch nghĩa câu Tiếng Việt.

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Khởi Động Backend (FastAPI + SQLite)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Khởi Động Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### 3. Tự Động Seed Dữ Liệu Đề Thi (Textbook Auto-Seeding)
- Khi ứng dụng khởi động lần đầu, hệ thống sẽ **tự động phát hiện và nạp dữ liệu** từ thư mục `textbook/` ở gốc repository vào cơ sở dữ liệu SQLite.
- Đường dẫn thư mục đề thi được tính tự động tương đối so với project root (`./textbook`), hoặc có thể tuỳ chỉnh qua biến môi trường `TEXTBOOK_ROOT_DIR` trong file `backend/.env`.
- Để nạp lại (re-seed) thủ công dữ liệu đề thi bất kỳ lúc nào:
  ```bash
  curl -X POST http://localhost:8000/api/textbooks/init
  ```
