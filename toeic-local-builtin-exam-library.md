# TOEIC Local App — Chức năng MỚI: Thư Viện Đề Có Sẵn (Built-in Exam Library)

> Khác hoàn toàn với luồng Upload hiện có (dành cho đề người dùng tự sưu tầm). Đây là bộ đề CÓ SẴN trong `textbook/` (ETS 2017-2026, YBM, Hacker, Xanh Cam...), người dùng vào web chọn thi ngay, không cần upload. Dữ liệu này cần 1 pipeline nạp riêng (ingest 1 lần), tách biệt hoàn toàn khỏi bảng `documents` của luồng upload.

---

## 1. Đặc điểm dữ liệu thật đã khảo sát (quan trọng — đọc trước khi code)

- **1 file `.md` thường gộp 10 TEST**, tách nhau bằng heading `# TEST 01`, `# TEST 02`, ... `# TEST 10`. Một số bộ có thể chỉ 1 test/file — không giả định cố định số lượng, phải tự đếm số heading `# TEST` tìm được.
- **Thứ tự câu hỏi trong text bị xáo trộn theo kiểu xen kẽ 2 cột** (ví dụ: 101, 105, 102, 106, 103, 107...) — do OCR đọc 2 cột PDF gốc. **Không dựa vào thứ tự xuất hiện trong text để sắp xếp câu hỏi — luôn sort lại theo đúng số thứ tự sau khi trích xuất.**
- **Có file đáp án riêng** (`*Đáp án*.md`), format rất sạch và nhất quán: `101. (A) | 102. (B) | ...` theo từng dòng 10 câu, chia theo `## Test N`. Đây là nguồn đáp án ĐÁNG TIN CẬY TUYỆT ĐỐI — dùng trực tiếp, KHÔNG cần AI đoán đáp án đúng cho bộ đề này (khác hẳn luồng upload, nơi thường không có đáp án kèm theo).
- **Tên file không đồng nhất** giữa các bộ sách — match file câu hỏi với file đáp án theo VỊ TRÍ THƯ MỤC (cùng 1 folder `textbook/<Series>/<Volume>/`), không theo quy tắc đặt tên cố định.
- Một vài file đáp án dùng số 8 thay cho chữ B do OCR lỗi (đã thấy: `"(8) wealthy"` thay vì `"(B) wealthy"` trong dữ liệu câu hỏi thật) — cần chuẩn hoá `8 → B` khi parse (OCR hay nhầm 2 ký tự này vì hình dạng giống nhau).

---

## 2. Chiến lược Parse — dùng phương pháp TÌM THEO SỐ ĐÃ BIẾT TRƯỚC (không dùng regex "tìm số bất kỳ" như đã thất bại nhiều lần với Part 5 upload)

> Đây là bài học quan trọng nhất rút ra từ hàng chục vòng debug parser Part 5 trước đó: quy tắc regex "tìm số bất kỳ 1-3 chữ số" luôn dễ vỡ vì nhầm lẫn với số liệu ngẫu nhiên trong câu (ví dụ "30 minutes", "60,000 tons"). Với bộ đề có sẵn này, ta **biết trước chính xác dải số cần tìm** (mỗi TEST luôn có câu 101-200: Part5=101-130, Part6=131-146, Part7=147-200) — nên thay vì "tìm số bất kỳ", ta **tìm CHÍNH XÁC từng số kỳ vọng theo thứ tự (101, rồi 102, rồi 103...)**. Cách này miễn nhiễm hoàn toàn với số liệu ngẫu nhiên trong câu, vì ta không tìm "số nào đó", mà tìm đúng "câu 105" bằng chuỗi literal `\b105[\.\_\:]`.

```python
def extract_test_by_known_sequence(test_text: str, expected_numbers: range) -> dict:
    """
    expected_numbers: vd range(101, 201) — biết trước chính xác, không đoán.
    Với mỗi số kỳ vọng, tìm vị trí xuất hiện literal của nó trong text.
    """
    positions = {}
    for n in expected_numbers:
        m = re.search(rf'\b{n}[\.\_\:]\s', test_text)
        if m:
            positions[n] = m.start()
        # nếu không tìm thấy, để trống — đây là câu bị OCR làm mất số,
        # sẽ xử lý riêng (xem mục 2.1), KHÔNG được lấy nhầm số khác gán bừa vào

    # Sắp xếp lại đúng theo SỐ THỨ TỰ (không theo vị trí xuất hiện trong text —
    # vì đã biết bị xáo trộn cột), rồi cắt text giữa 2 vị trí liền kề theo đúng SỐ
    sorted_nums = sorted(positions.keys())
    ...
```

### 2.1. Xử lý câu bị mất số (OCR làm mờ/mất số thứ tự)
- Nếu 1 số trong dải kỳ vọng KHÔNG tìm thấy vị trí nào → đánh dấu câu đó "cần review thủ công" hoặc gửi đoạn text xung quanh (dựa vào 2 số liền kề tìm được) cho Gemini xử lý riêng CHỈ câu đó — không phải cả bộ đề.
- Vì đã có file đáp án đúng 100% riêng biệt, kể cả trường hợp này AI chỉ cần tách `question_text` + 4 đáp án, KHÔNG cần đoán `correct_answer` (đã có sẵn từ file đáp án, match theo số thứ tự).

### 2.2. Tách 10 TEST trong 1 file
```python
test_blocks = re.split(r'#\s*TEST\s*0?(\d+)', full_md_text, flags=re.IGNORECASE)
```
Với mỗi block, xác định Part 5/6/7 bên trong bằng heading `PART 5`/`PART 6`/`PART 7` (giống logic `chunking_service.py` đã có, tái sử dụng được).

---

## 3. Cấu trúc dữ liệu (bảng riêng, KHÔNG dùng chung với `documents`/`questions` của luồng upload)

```sql
CREATE TABLE builtin_exam_series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_name TEXT NOT NULL,        -- "ETS", "YBM", "HACKER", "XANH CAM"
    volume_name TEXT NOT NULL,        -- "ETS 2020 RC", "YBM Vol 2"
    source_folder_path TEXT
);

CREATE TABLE builtin_exam_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER REFERENCES builtin_exam_series(id),
    test_number INTEGER NOT NULL,     -- 1-10
    total_questions_expected INTEGER DEFAULT 100,
    total_questions_parsed INTEGER,
    parse_status TEXT DEFAULT 'pending'  -- 'complete' / 'partial' / 'failed'
);

CREATE TABLE builtin_exam_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER REFERENCES builtin_exam_tests(id),
    question_number INTEGER NOT NULL,   -- 101-200, dùng để SORT khi hiển thị
    part INTEGER,                       -- 5/6/7
    question_text TEXT,
    options_json TEXT,
    correct_answer TEXT,                -- LẤY TỪ FILE ĐÁP ÁN, không phải AI đoán
    needs_manual_review BOOLEAN DEFAULT 0  -- true nếu số bị OCR làm mất, cần AI hỗ trợ tách
);

CREATE TABLE builtin_exam_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER REFERENCES builtin_exam_tests(id),
    mode TEXT CHECK(mode IN ('practice_untimed', 'real_exam_75min')),
    score_correct INTEGER,
    score_total INTEGER,
    time_taken_seconds INTEGER,
    started_at DATETIME,
    finished_at DATETIME
);
```

---

## 4. Chức năng UI

### 4.1. Trang "Đề Có Sẵn" (menu riêng, ngang hàng với Upload)
- [ ] Danh sách theo cây: Bộ sách (ETS/YBM/Hacker/Xanh Cam) → Volume/Năm → TEST 1-10.
- [ ] Mỗi TEST hiển thị: đã làm chưa, điểm cao nhất từng đạt (nếu đã làm), số câu (nên khớp 100, cảnh báo nếu `parse_status != 'complete'`).

### 4.2. 2 chế độ làm bài (tái dùng UI Timer đã có ở Module 19)
- [ ] **Luyện tập không giới hạn giờ:** làm từng câu, xem giải thích ngay sau khi chọn (tái dùng Module 18 — giải thích đáp án).
- [ ] **Thi thật 75 phút:** giống Full Mock Test đã build (Module 19.2), nhưng nguồn câu hỏi lấy từ `builtin_exam_questions` thay vì từ `questions` (đề upload).

### 4.3. Lưu kết quả & lịch sử
- [ ] Sau khi nộp bài, lưu vào `builtin_exam_attempts`.
- [ ] Trang xem lại lịch sử các lần đã thi TEST này, biểu đồ điểm tiến bộ theo thời gian nếu làm lại nhiều lần.

---

## 5. Pipeline nạp dữ liệu (chạy 1 lần, không chạy mỗi lúc mở app)

```
backend/app/scripts/ingest_builtin_textbooks.py   # script chạy tay 1 lần, KHÔNG phải API endpoint
```
- Quét toàn bộ `textbook/<Series>/<Volume>/`, tìm cặp file câu hỏi + đáp án cùng thư mục.
- Với MỖI test trong MỖI file, chạy parser mục 2, ghi vào DB kèm `parse_status`.
- **In báo cáo tổng kết cuối script:** tổng số test parse `complete` / `partial` / `failed`, liệt kê rõ tên test nào có vấn đề để biết cần soát tay.

**DoD:**
- [ ] Chạy script trên toàn bộ 17 bộ, dán báo cáo tổng kết đầy đủ (bao nhiêu test hoàn chỉnh 100/100 câu, bao nhiêu test thiếu, thiếu bao nhiêu).
- [ ] Chọn ngẫu nhiên 2 test từ 2 bộ sách khác nhau, đối chiếu tay đủ 100 câu + đáp án đúng với file gốc.
- [ ] Xác nhận `correct_answer` lấy đúng từ file đáp án (không phải AI đoán) — kiểm tra vài câu xem đáp án hiển thị trên UI có khớp file `Đáp án.md` gốc không.
- [ ] Test thi thử 75 phút 1 lần đầy đủ, xác nhận hết giờ tự nộp bài, điểm số tính đúng, lưu lịch sử đúng.
