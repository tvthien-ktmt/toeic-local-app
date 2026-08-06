# TOEIC Local App — Bổ sung: Parser Part 5 cục bộ (0 AI) + Debug bug trích xuất không ra kết quả

---

## PHẦN 1 — Parser Part 5 bằng Regex thuần (không cần Gemini cho bước tách cấu trúc)

> Đúng như bạn nhận xét: đề TOEIC Part 5 luôn có format cố định (số thứ tự 3 chữ số + câu có chỗ trống + 4 đáp án A/B/C/D). Có thể tách được câu hỏi + 4 đáp án **hoàn toàn bằng regex, không cần gọi Gemini** cho bước này — tiết kiệm 100% token cho phần cấu trúc câu hỏi. Gemini (nếu cần) chỉ nên dùng SAU đó để làm giàu dữ liệu (phân loại ngữ pháp, giải thích, dịch câu) — 2 việc hoàn toàn tách biệt.

### 1.1. Chiến lược parse theo 2 lớp (Hybrid — quan trọng)

Vì OCR không hoàn hảo (như đã thấy: marker `(A)` hay bị mất, đôi khi cả 4 marker A/B/C/D đều mất, chỉ còn 4 từ liền nhau), **không nên kỳ vọng regex xử lý được 100% trường hợp**. Thiết kế đúng là:

```
Với mỗi câu hỏi đã tách theo số thứ tự (\d{3}\.):
   │
   ▼
Thử parse bằng regex cục bộ (0 token)
   │
   ├─ Parse THÀNH CÔNG (đủ 4 đáp án rõ ràng, tách được đúng câu hỏi)
   │     → Lưu thẳng vào DB, is_ai_verified = False, KHÔNG gọi Gemini
   │
   └─ Parse THẤT BẠI hoặc không chắc chắn (thiếu marker, đáp án dính chữ lẫn nhau...)
         → CHỈ với những câu này, gửi riêng cho Gemini để nhờ tách hộ
         → Đánh dấu is_ai_verified = True
```

Đây là điểm mấu chốt: **không phải "bỏ AI hoàn toàn"**, mà là "chỉ dùng AI cho phần khó, phần dễ (đa số câu hỏi) xử lý local free". Với 1 đề rõ nét, có thể 80-90% câu hỏi parse được ngay bằng regex, chỉ 10-20% cần AI hỗ trợ — giảm token đáng kể so với gửi TOÀN BỘ 30 câu cho Gemini như hiện tại.

### 1.2. Thuật toán regex cụ thể

**Bước 1 — Tách từng câu hỏi theo số thứ tự** (đáng tin cậy nhất, luôn giữ được qua OCR vì là số in đậm rõ ràng):
```python
import re
# Tách theo ranh giới "số 3 chữ số + dấu chấm", giữ lại số đó ở đầu mỗi block
blocks = re.split(r'(?=\b(\d{3})\.\s)', full_text)
```

**Bước 2 — Tìm vị trí chỗ trống trong câu** (dấu gạch ngang liên tiếp, gạch dưới, hoặc ký tự OCR hay nhầm như `~`, `_`):
```python
blank_pattern = r'[-_~]{3,}|\.{3,}'
```
Phần TRƯỚC vị trí này + phần SAU (đến hết câu, kết thúc bằng dấu `.` `?` `!`) ghép lại = `question_text` thật (giữ nguyên chỗ trống làm placeholder hiển thị `_____`).

**Bước 3 — Tách 4 đáp án, ưu tiên dùng marker `(B)`/`(C)`/`(D)` làm điểm neo** (dựa trên bằng chứng thực tế: marker B/C/D thường sống sót qua OCR tốt hơn marker A):
```python
marker_pattern = r'\(?[B-D]\)?\.?\s'
markers_found = list(re.finditer(marker_pattern, remaining_text_after_question))
```
- Nếu tìm đủ 3 marker B, C, D theo đúng thứ tự → phần trước marker B = đáp án A (dù có hay không có "(A)" đứng trước), phần giữa B-C = đáp án B, C-D = đáp án C, sau D đến hết = đáp án D.
- Nếu KHÔNG tìm đủ 3 marker theo đúng thứ tự (ví dụ OCR làm mất luôn cả B/C/D) → coi là **parse thất bại**, đẩy câu này sang nhánh Gemini xử lý riêng.

### 1.3. Cấu trúc code đề xuất

```
backend/app/services/
├── local_parser_service.py   # MỚI — chứa toàn bộ logic regex ở trên
│   ├── split_questions_by_number(text) -> List[question_block]
│   ├── extract_blank_position(question_block) -> question_text
│   ├── extract_options_by_bcd_anchor(question_block) -> Optional[List[str]]  # None nếu fail
│   └── parse_part5_locally(part5_text) -> (parsed_questions, failed_blocks)
└── extraction_service.py     # sửa lại: gọi local_parser trước, chỉ gửi failed_blocks cho Gemini
```

### 1.4. DoD

- [ ] Test với `RC-TEST_1.pdf` thật: đếm số câu parse được bằng regex thuần (0 token) vs số câu phải nhờ Gemini — báo cáo tỷ lệ cụ thể (vd "24/30 câu parse local thành công, 6 câu cần AI hỗ trợ").
- [ ] Đối chiếu tay 10 câu parse local — xác nhận `question_text` và 4 đáp án đúng 100% so với ảnh gốc.
- [ ] Xác nhận KHÔNG có lượt gọi Gemini nào cho các câu parse local thành công (kiểm tra qua log — không thấy `[SQLITE CACHE MISS]`/`[GEMINI_API]` cho những câu này).
- [ ] Riêng việc phân loại `grammar_topic`, giải thích đáp án, dịch câu (Module 18) — các bước này VẪN cần Gemini như cũ (vì cần hiểu ngữ nghĩa, regex không làm được), áp dụng cho TẤT CẢ câu hỏi (dù parse local hay parse bằng AI ở bước 1), không đổi.

---

## PHẦN 2 — Debug: bấm "Trích Xuất AI" sau khi OCR xong nhưng không ra danh sách câu hỏi

> Hôm qua chạy đúng (ra 30 câu), hôm nay không ra gì — đây là dấu hiệu **regression từ 1 trong các thay đổi gần đây** (rất có thể liên quan tới thay đổi gộp prompt Câu hỏi+Từ vựng vừa làm ở tin trước, dù bạn nói "bỏ qua chuyện đó" nhưng thay đổi đó có thể là NGUYÊN NHÂN của bug này — không thể tách rời 2 việc).

**Prompt debug:**

> Sau khi OCR xử lý xong, bấm "Trích Xuất AI" không ra danh sách câu hỏi nào (trước đó vẫn hoạt động, ra đủ 30 câu). Đây là regression mới. Debug theo thứ tự:
>
> 1. Mở DevTools Console (F12) trên trình duyệt khi bấm nút "Trích Xuất AI" — có lỗi JavaScript nào hiện ra không? Dán nguyên văn.
> 2. Xem log console của backend (terminal chạy uvicorn) ngay lúc bấm nút — có exception nào bị ném ra không? Dán nguyên văn traceback đầy đủ, không tóm tắt.
> 3. Query trực tiếp SQLite: `SELECT id, status FROM documents ORDER BY id DESC LIMIT 1;` — status hiện tại là gì (`extracted`, `extraction_failed`, hay vẫn `processing`)? Nếu là `extraction_failed`, query thêm `questions_count`/`vocabulary_count` xem có bằng 0 không.
> 4. Đây rất có thể liên quan đến thay đổi gộp prompt Câu hỏi+Từ vựng ở commit `e22805f` — kiểm tra: JSON schema Gemini trả về giờ có cấu trúc lồng nhau phức tạp hơn (chứa cả mảng câu hỏi và mảng từ vựng trong 1 object), code parse JSON ở `extraction_service.py` có được cập nhật đúng để đọc đúng cấu trúc mới này chưa, hay vẫn đang cố đọc theo cấu trúc JSON cũ (chỉ có mảng câu hỏi) dẫn đến `KeyError`/`None` khi truy cập sai field?
> 5. Dán nguyên văn 1 response JSON thật từ Gemini (in ra console trước khi parse) để tôi xem cấu trúc thực tế có khớp với code đang cố đọc hay không.
>
> Không tự sửa mù — bắt buộc dán đủ 5 mục trên trước khi đưa ra kết luận nguyên nhân.
