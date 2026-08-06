# 🐛 Bug Report: "0/0 câu hỏi" khi làm bài thi — toeic-local-app

Repo: https://github.com/tvthien-ktmt/toeic-local-app

## 1. Triệu chứng
Khi bấm vào "Làm bài thi" ở bất kỳ đề nào, trang `ExamTakePage` load lên nhưng
số câu hỏi luôn hiển thị **0/0** (ô "Ma Trận X Câu Hỏi" ở sidebar phải,
counter `answeredCount / questions.length`), danh sách câu hỏi trống, không
làm được bài.

## 2. Nguyên nhân gốc (Root cause)

### Bug chính — Hardcoded absolute path chỉ tồn tại trên máy tác giả gốc
File: `backend/app/services/textbook_service.py`, dòng 9:

```python
TEXTBOOK_ROOT_DIR = r"d:\TOIEC Web\textbook"
```

Đây là đường dẫn tuyệt đối trên máy Windows của người viết code gốc
(`d:\TOIEC Web\textbook`). Trên máy của bạn (hoặc bất kỳ máy nào khác /
Linux / macOS / ổ đĩa khác), đường dẫn này **không tồn tại**.

Hàm `scan_and_seed_textbooks()` (cùng file, dòng ~292) kiểm tra:

```python
if not os.path.exists(TEXTBOOK_ROOT_DIR):
    print(f"[TEXTBOOK SERVICE] Directory not found: {TEXTBOOK_ROOT_DIR}")
    return {"status": "error", "message": "Textbook directory missing"}
```

→ Khi đường dẫn không tồn tại, hàm **âm thầm bỏ qua** việc quét và tạo
câu hỏi (`Question`) trong database, chỉ in ra console log, không hề báo
lỗi rõ ràng lên UI. Kết quả: bảng `documents` có thể được tạo (do nơi khác
tạo Document) nhưng bảng `questions` liên kết với `document_id` đó **rỗng
hoàn toàn (0 câu hỏi)**.

Trong khi đó, thư mục đề thi thật sự **đã có sẵn trong repo** tại:
```
<repo_root>/textbook/ETS/...
<repo_root>/textbook/HACKER/...
<repo_root>/textbook/XANH CAM/...
<repo_root>/textbook/YBM/...
```
chỉ là **sai đường dẫn tương đối/tuyệt đối**, không phải thiếu dữ liệu.

### Bug phụ — Che giấu số 0 thật ở màn danh mục đề thi (làm bạn không nghi ngờ gì)
File: `backend/app/routers/textbooks.py`, hàm `get_textbook_catalog()`, dòng 76:

```python
"question_count": q_count if q_count > 0 else 100,
```

Khi `q_count` (số câu hỏi thực tế trong DB) = 0, API vẫn trả về **giả**
`question_count: 100` cho danh sách đề thi ở trang chủ/catalog. Vì vậy
bạn thấy mỗi đề đều ghi "100 câu hỏi" trông rất bình thường — nhưng khi
bấm vào làm bài thật (`GET /api/textbooks/exam/{doc_id}`), API này KHÔNG
có fallback giả, trả về đúng số thực = 0 → giao diện hiện "0/0".

Đây chính là lý do bug gây khó hiểu: danh sách ngoài trông ổn (100 câu),
nhưng vào trong thì trống trơn.

### Vì sao mọi đề đều bị (không phải 1-2 đề)
Vì toàn bộ quá trình seed dữ liệu ban đầu (tạo `Document` + `Question`
cho tất cả đề ETS/HACKER/YBM/XANH CAM) đều đi qua cùng một hàm
`scan_and_seed_textbooks()` với cùng 1 `TEXTBOOK_ROOT_DIR` sai, nên **100%
số đề đều không có câu hỏi nào được nạp vào DB** → tất cả đều 0/0.

## 3. Vị trí code liên quan

| File | Dòng | Vấn đề |
|---|---|---|
| `backend/app/services/textbook_service.py` | 9 | `TEXTBOOK_ROOT_DIR` hardcode tuyệt đối kiểu Windows |
| `backend/app/services/textbook_service.py` | 304-306 | Seed thất bại âm thầm khi path không tồn tại, không raise lỗi rõ ràng |
| `backend/app/routers/textbooks.py` | 76 | Fallback giả `... else 100` che số 0 thật ở catalog |
| `backend/app/routers/textbooks.py` | 105-164 (`get_exam_questions`) | Trả đúng số thực (0) → gây hiển thị 0/0, đây là hệ quả chứ không phải nguồn lỗi |

## 4. Cách xác minh nhanh (không cần sửa code)
1. Chạy backend, gọi thử:
   ```
   POST http://localhost:8000/api/textbooks/init
   ```
   → xem log console sẽ thấy dòng:
   `[TEXTBOOK SERVICE] Directory not found: d:\TOIEC Web\textbook`
2. Gọi `GET http://localhost:8000/api/textbooks/catalog` → thấy
   `question_count: 100` cho mọi đề (giả).
3. Gọi `GET http://localhost:8000/api/textbooks/exam/{doc_id}` với 1 id
   bất kỳ → `"total_questions": 0, "questions": []` → xác nhận đúng bug.

## 5. Hướng khắc phục đề xuất

1. **Sửa `TEXTBOOK_ROOT_DIR` thành đường dẫn tương đối, tự tính từ vị trí
   file/project**, không hardcode tuyệt đối:
   ```python
   import os
   BACKEND_APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../backend/app
   PROJECT_ROOT = os.path.dirname(os.path.dirname(BACKEND_APP_DIR))               # repo root
   TEXTBOOK_ROOT_DIR = os.environ.get(
       "TEXTBOOK_ROOT_DIR",
       os.path.join(PROJECT_ROOT, "textbook")
   )
   ```
   Đồng thời cho phép override bằng biến môi trường `TEXTBOOK_ROOT_DIR`
   trong `.env` để người dùng máy khác có thể trỏ tới thư mục đề thi ở
   bất kỳ đâu.

2. **Bỏ fallback giả `else 100`** ở `textbooks.py` dòng 76, trả đúng số
   thực `q_count`. Nếu muốn UX thân thiện hơn khi = 0, nên trả về cờ
   riêng (vd `"is_ready": false`) và ẩn nút "Làm bài" hoặc hiện cảnh báo
   "Đề thi chưa có câu hỏi, vui lòng chạy lại seed dữ liệu" thay vì giả số.

3. **Làm rõ lỗi khi seed thất bại**: nếu `TEXTBOOK_ROOT_DIR` không tồn
   tại, nên raise `HTTPException` hoặc trả `status: "error"` kèm thông
   báo rõ ràng ở endpoint `/api/textbooks/init`, thay vì chỉ `print()` ra
   console — để cả frontend và người dùng biết ngay có sự cố, không phải
   đoán mò qua hiện tượng "0/0".

4. Sau khi sửa path, cần **xoá dữ liệu documents/questions cũ (rỗng) và
   seed lại**, ví dụ xoá file SQLite DB hiện tại (hoặc chạy script xoá
   các `Document.is_builtin == True` không có `Question` liên kết) rồi
   gọi lại `POST /api/textbooks/init`.

---

## 6. Prompt để đưa cho AI coding agent (Claude Code / Cursor / Copilot...) sửa trực tiếp

```
Bối cảnh: Dự án FastAPI + React tên "toeic-local-app" (repo:
https://github.com/tvthien-ktmt/toeic-local-app). Khi người dùng bấm vào
làm bài thi, số câu hỏi luôn hiện 0/0 dù danh mục đề thi ngoài trang chủ
vẫn hiển thị "100 câu hỏi".

Nguyên nhân đã xác định:
1. File backend/app/services/textbook_service.py, dòng 9, biến
   TEXTBOOK_ROOT_DIR = r"d:\TOIEC Web\textbook" bị hardcode tuyệt đối
   theo máy Windows của tác giả gốc, không tồn tại trên máy khác. Vì vậy
   hàm scan_and_seed_textbooks() luôn return sớm với
   {"status": "error", "message": "Textbook directory missing"} và không
   bao giờ tạo được bản ghi Question nào trong DB, dù thư mục đề thi thật
   (textbook/ETS, textbook/HACKER, textbook/XANH CAM, textbook/YBM) đã có
   sẵn ngay trong repo ở đường dẫn tương đối <project_root>/textbook.
2. File backend/app/routers/textbooks.py, endpoint get_textbook_catalog()
   dòng 76, có dòng "question_count": q_count if q_count > 0 else 100 —
   giả mạo số câu hỏi = 100 khi thực tế là 0, khiến bug bị che giấu ở màn
   danh mục, chỉ lộ ra khi vào endpoint get_exam_questions() (/api/textbooks/exam/{doc_id})
   trả về total_questions thật = 0.

Yêu cầu sửa:
1. Sửa TEXTBOOK_ROOT_DIR trong textbook_service.py để tự tính đường dẫn
   tương đối tới thư mục "textbook" nằm ở gốc repo (project root), dùng
   os.path.abspath(__file__) để suy ra, và cho phép override qua biến
   môi trường TEXTBOOK_ROOT_DIR (đọc từ .env qua os.environ.get). Cập
   nhật luôn file .env.example thêm dòng mẫu
   TEXTBOOK_ROOT_DIR=./textbook (tuỳ chọn).
2. Xoá đoạn fallback giả "if q_count > 0 else 100" ở textbooks.py, trả
   đúng q_count thật. Thêm field "is_seeded": bool (q_count > 0) vào
   response của catalog để frontend có thể hiển thị cảnh báo/khoá nút
   "Làm bài" khi đề chưa có câu hỏi.
3. Trong scan_and_seed_textbooks(), khi os.path.exists(TEXTBOOK_ROOT_DIR)
   == False, raise rõ lỗi (vd FileNotFoundError với thông báo path cụ
   thể) thay vì chỉ print + return status error âm thầm, để log/API
   caller biết chắc chắn tại sao seed thất bại.
4. Viết/gợi ý 1 đoạn hướng dẫn ngắn trong README: sau khi clone repo lần
   đầu, cần gọi POST /api/textbooks/init (hoặc tự động seed khi
   catalog rỗng — code đã có sẵn logic auto-seed ở get_textbook_catalog,
   chỉ cần path đúng là sẽ tự chạy) để nạp toàn bộ đề thi vào SQLite DB
   trước khi làm bài.
5. Nếu DB SQLite hiện tại đã có sẵn các Document rỗng (is_builtin=True,
   không có Question liên kết) do bug cũ, viết migration/script dọn dẹp:
   xoá các Document đó (cascade sẽ tự xoá Question rỗng) để lần seed kế
   tiếp tạo lại sạch sẽ, tránh trùng lặp do content_hash/filename check.

Sau khi sửa xong, test lại bằng cách: xoá DB cũ (hoặc chạy script dọn ở
bước 5) → khởi động lại backend → gọi GET /api/textbooks/catalog → xác
nhận question_count khớp số thật > 0 cho từng đề → bấm làm bài 1 đề bất
kỳ trên frontend → xác nhận số câu hỏi hiển thị đúng (ví dụ 100/100) thay
vì 0/0.
```
