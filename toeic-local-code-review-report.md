# Code Review Report — toeic-local-app (dựa trên code thật trong repo, commit hiện tại)

> Báo cáo này viết sau khi đọc trực tiếp source code tại `https://github.com/tvthien-ktmt/toeic-local-app` (clone về đọc từng file, không dựa vào báo cáo agent tự viết). Mỗi bug đều có trích dẫn file:line cụ thể để tự đối chiếu.

---

## TÓM TẮT MỨC ĐỘ NGHIÊM TRỌNG

| # | Bug | Mức độ | Module ảnh hưởng |
|---|---|---|---|
| 1 | Truncate input gửi Gemini còn 3000-3500 ký tự, cắt mất phần lớn nội dung mỗi Part | 🔴 CRITICAL | Module 2, 3 (lõi của cả app) |
| 2 | Synonym Quiz dùng dictionary cứng 9 từ, không dùng dữ liệu Gemini thật | 🔴 HIGH | Module 14.3 |
| 3 | Dashboard "Accuracy theo Part" bị lệch filter, Part 6/7/Listening luôn ra 0 | 🟠 MEDIUM | Module 13 |
| 4 | requirements.txt thiếu nhiều dependency thực tế được import | 🟠 MEDIUM | Toàn bộ (setup) |
| 5 | Phát hiện layout 2 cột phụ thuộc text layer có sẵn — PDF scan ảnh thật (0% text) có thể không được tách cột | 🟡 LOW-MEDIUM | Module OCR Addon |
| 6 | Điều kiện phát hiện "tài liệu lỗi cần xử lý lại" quá hẹp, dễ bỏ sót | 🟡 LOW | Module 1.1 |
| 7 | `json.loads()` không try/except riêng, lỗi JSON làm mất trắng cả chunk | 🟡 LOW-MEDIUM | Module 2, 3 |

---

## BUG #1 (CRITICAL) — Input gửi Gemini bị cắt còn 3000-3500 ký tự, làm mất phần lớn đề thi

**File:** `backend/app/services/extraction_service.py`, dòng 150, 199, 248

```python
Nội dung:
{part_text[:3500]}"""   # dòng 150 (Part 5), dòng 199 (Part 6/7)
...
Nội dung:
{part_text[:3000]}"""   # dòng 248 (vocab, áp dụng cho MỌI part)
```

**Vấn đề:** Mỗi chunk theo Part (Part 5 = 30 câu, Part 6 = 16 câu trong 4 đoạn văn, Part 7 = ~54 câu trong nhiều đoạn văn dài) dễ dàng vượt quá 3000-3500 ký tự. Với đề `RC-TEST_1.pdf` thật của bạn — chỉ riêng Part 5 (câu 101-130) đã ước tính hơn 5.000-6.000 ký tự. Việc cắt cứng `[:3500]` nghĩa là:

- Chỉ khoảng 10-13 câu đầu của Part 5 (101 → ~113) được gửi cho Gemini, phần còn lại (114-130) **không bao giờ được gửi đi, không hề có log cảnh báo**.
- Part 6/7 có đoạn văn dài (email, hợp đồng, bài quảng cáo) — bị cắt giữa chừng nhiều khả năng cắt đứt ngay giữa 1 câu hỏi hoặc giữa JSON mà Gemini phải trả về, dẫn tới Gemini trả JSON không hợp lệ.

**Đây chính là nguyên nhân gốc của con số "questions_count: 11, vocabulary_count: 20"** thấy ở lần test full flow trước — không phải vì đề ngắn, mà vì hệ thống chỉ đọc một mẩu nhỏ đầu mỗi Part rồi âm thầm bỏ qua toàn bộ phần còn lại.

**Vì sao đây là lỗi nghiêm trọng nhất:** đây là module lõi nhất của cả app (P0 — trích xuất câu hỏi/từ vựng). Mọi module khác (flashcard, quiz, album chủ đề, dashboard) đều phụ thuộc vào lượng dữ liệu trích ra từ bước này. Nếu bug này còn tồn tại, dùng bao nhiêu đề thi thật cũng chỉ trích được ~10-15% nội dung thực tế mỗi lần.

**Đề xuất fix:**
- Bỏ hẳn việc cắt cứng `[:3500]`/`[:3000]`. Model `gemini-flash-latest` hỗ trợ context rất lớn (hàng trăm nghìn token), 1 Part TOEIC dài nhất cũng chỉ vài nghìn ký tự — không cần cắt.
- Nếu vẫn muốn giới hạn vì lo token, phải **chia nhỏ theo lô câu hỏi cố định** (ví dụ mỗi lô 10 câu) và gọi Gemini nhiều lần trong cùng 1 Part, gộp kết quả lại — không phải cắt bỏ silent như hiện tại.
- Bắt buộc: log rõ ràng số ký tự thực tế của `part_text` so với số ký tự thực sự được gửi, để phát hiện ngay nếu có cắt bớt.

---

## BUG #2 (HIGH) — Synonym Quiz dùng dictionary cứng 9 từ, không phải dữ liệu Gemini thật

**File:** `backend/app/routers/quiz.py`, dòng 181-191, 202

```python
DEFAULT_SYNONYMS = {
    "proposal": "suggestion", "investigation": "inquiry", "renovation": "reconstruction",
    "venue": "location", "belongings": "possessions", "campaign": "initiative",
    "secure": "safe", "exceptional": "outstanding", "comprehensive": "thorough"
}
...
correct_syn = DEFAULT_SYNONYMS.get(target.word.lower(), "equivalent")
```

**Vấn đề:** Model `Vocabulary` đã có cột `synonyms`/`antonyms` (models.py dòng 52-53) đúng theo spec Module 14.3, NHƯNG:
1. Prompt trích xuất từ vựng thật (`extraction_service.py` dòng 234-248) **không hề yêu cầu Gemini trả về `synonyms`/`antonyms`** — 2 cột này trong DB sẽ luôn rỗng (`nullable=True`, không có default nào set).
2. Endpoint `/api/quiz/synonyms` **không đọc cột `synonyms` từ DB**, mà tra cứu qua dictionary cứng chỉ có 9 từ. Với BẤT KỲ từ nào ngoài 9 từ đó (tức đại đa số từ vựng thật trích ra) → `correct_syn = "equivalent"` — một chuỗi vô nghĩa được gán làm "đáp án đúng".

**Hệ quả thực tế:** Nếu bạn luyện quiz đồng nghĩa với từ vựng thật trích từ đề của bạn (ví dụ "submit", "allocation", "expenditure"...) — đáp án đúng hiển thị sẽ là chữ **"equivalent"**, không phải từ đồng nghĩa thật. Tính năng này đang **hỏng cho hầu hết trường hợp sử dụng thực tế**, dù báo cáo trước đó liệt kê "Module 14.3 hoàn thành".

**Đề xuất fix:** Bổ sung `synonyms`/`antonyms` vào prompt trích xuất từ vựng (đúng như spec `toeic-local-additional-features.md` mục 14.3 đã yêu cầu), rồi sửa endpoint `/synonyms` đọc từ `target.synonyms` (JSON parse) thay vì dictionary cứng.

---

## BUG #3 (MEDIUM) — Dashboard "Accuracy theo Part" luôn ra 0 cho Part 6, Part 7, và Listening

**File:** `backend/app/routers/dashboard.py`, dòng 28-29, so với `extraction_service.py` dòng 172, 224, 278

```python
# dashboard.py
for part_name in ["Part 5", "Part 6", "Part 7", "Part 1-4"]:
    q_ids = [... Question.topic_tag.ilike(f"%{part_name}%") ...]
```

```python
# extraction_service.py — cách topic_tag/appears_in_part thực sự được lưu
topic_tag="Part 5 Grammar"                      # dòng 172, chứa "Part 5" -> match
topic_tag=topic_tag  # = raw_data["passage_topic_tag"]  # dòng 224 — vd "job application", "office relocation"
appears_in_part=f"Part {part_num}"              # dòng 278 -> "Part 1", "Part 2"... KHÔNG PHẢI "Part 1-4"
```

**Vấn đề:**
- Part 6/7: `topic_tag` được gán bằng chủ đề nội dung do Gemini tự đặt tên (ví dụ "job application") — **không bao giờ chứa chữ "Part 6" hay "Part 7"**. Filter `ilike('%Part 6%')` sẽ luôn trả về rỗng → Part 6/7 trên Dashboard **vĩnh viễn hiển thị 0 lượt luyện, 0% chính xác**, dù bạn có luyện bao nhiêu câu Part 6/7 thật.
- Listening: vocab lưu `appears_in_part = "Part 1"`, `"Part 2"`... (số đơn lẻ), trong khi dashboard tìm chuỗi `"Part 1-4"` — không bao giờ khớp → mục Listening trên dashboard luôn rỗng.

**Đề xuất fix:** Dashboard cần filter theo `Question.part` (cột số nguyên có sẵn: 5, 6, 7) thay vì string-match `topic_tag`; với Listening cần filter `appears_in_part.in_(["Part 1","Part 2","Part 3","Part 4"])` thay vì tìm chuỗi `"Part 1-4"` không tồn tại ở đâu cả.

---

## BUG #4 (MEDIUM) — `requirements.txt` thiếu nhiều dependency thực tế cần dùng

**File:** `backend/requirements.txt` (toàn bộ nội dung):
```
fastapi>=0.110.0
uvicorn>=0.28.0
sqlalchemy>=2.0.28
pydantic>=2.6.4
markitdown>=0.0.1a2
python-multipart>=0.0.9
```

**Vấn đề:** Code thực tế `import` các thư viện sau nhưng KHÔNG có trong file này:
- `fitz` (PyMuPDF) — dùng trong `markitdown_service.py`, `ocr_service.py`
- `pytesseract`, `PIL` (Pillow) — dùng trong `ocr_service.py`
- `python-dotenv` — dùng trong `gemini_service.py`
- `easyocr` — dùng (optional/try-except) trong `ocr_service.py`, nhưng nếu muốn dùng làm primary OCR thì vẫn nên khai báo

**Hệ quả:** Clone repo này về máy khác (hoặc máy bạn cài môi trường mới) và chạy `pip install -r requirements.txt` sẽ **thiếu module, code sẽ crash ngay khi import** `ocr_service.py`/`gemini_service.py`. Đây là lỗi phổ biến khi AI agent code trực tiếp trên máy đã có sẵn thư viện (cài bằng tay qua các lệnh `pip install` rời rạc trước đó) mà quên đồng bộ vào `requirements.txt`.

**Đề xuất fix:** Chạy `pip freeze > requirements.txt` trên môi trường đang chạy được, rồi dọn lại các phiên bản cho gọn.

---

## BUG #5 (LOW-MEDIUM) — Phát hiện layout 2 cột phụ thuộc vào text layer có sẵn, có thể fail với ảnh scan thật 100%

**File:** `backend/app/services/ocr_service.py`, hàm `detect_two_column_layout()` dòng 62-82

```python
def detect_two_column_layout(page: fitz.Page) -> bool:
    blocks = page.get_text("blocks")
    if not blocks or len(blocks) < 2:
        return False
    ...
```

**Vấn đề:** Hàm này dùng `page.get_text("blocks")` — tức là dựa vào **text layer có sẵn trong PDF**. Với 1 file PDF là ảnh scan/chụp thật 100% (không có text layer nào cả, giống ảnh Part 5 bạn từng chụp gửi) — `get_text("blocks")` sẽ trả về rỗng, khiến `detect_two_column_layout` luôn trả về `False`. Khi đó code rẽ vào nhánh "Single-Column Layout" (dòng 178-185), chạy OCR nguyên cả trang cùng lúc — **tái diễn đúng bug trộn 2 cột ban đầu** (câu 101 lẫn với câu 105) mà toàn bộ module OCR này được thiết kế ra để giải quyết.

**Lưu ý quan trọng:** file `RC-TEST_1.pdf` bạn test có text layer thật (126.566 ký tự qua MarkItDown), nên bug này **chưa từng bị kích hoạt trong các lần test qua** — nó chỉ lộ ra khi có 1 file PDF là ảnh chụp/scan thật 100% không có text layer nào. Đây là rủi ro còn treo lơ lửng, cần test riêng với 1 ảnh chụp thật trước khi yên tâm.

**Đề xuất fix:** Với trường hợp hoàn toàn không có text (`blocks` rỗng), cần fallback sang cách nhận diện cột dựa trên chính ẢNH (ví dụ: render ảnh, tìm khoảng trắng dọc lớn ở giữa trang bằng phân tích pixel), thay vì mặc định coi là 1 cột.

---

## BUG #6 (LOW) — Điều kiện phát hiện "tài liệu lỗi cần xử lý lại" quá hẹp

**File:** `backend/app/routers/documents.py`, dòng 94

```python
if not existing_doc.markdown_content or (len(existing_doc.markdown_content) < 2000 and "OCR Processed" in existing_doc.markdown_content) or existing_doc.status == "conversion_failed":
```

**Vấn đề:** Điều kiện phát hiện tài liệu bị lỗi yêu cầu CẢ 2: độ dài < 2000 ký tự VÀ có chứa đúng chuỗi `"OCR Processed"`. Đây là fix vá đúng cho lỗi cụ thể đã gặp, nhưng không tổng quát — nếu tương lai có kiểu lỗi khác (ví dụ MarkItDown trả về text ngắn hợp lệ nhưng do lỗi khác gây rỗng câu hỏi, không đi qua nhánh OCR) sẽ không bị phát hiện, hệ thống vẫn trả về bản ghi hỏng cũ mãi mãi.

**Đề xuất fix:** Kiểm tra tổng quát hơn — ví dụ: tài liệu có `status == 'extracted'` nhưng số `Question`/`Vocabulary` liên kết = 0, cũng nên coi là "cần xử lý lại", không chỉ dựa vào 1 chuỗi cụ thể trong markdown.

---

## BUG #7 (LOW-MEDIUM) — `json.loads()` không có try/except riêng, lỗi JSON làm mất trắng cả chunk

**File:** `backend/app/services/gemini_service.py`, dòng 132: `parsed_json = json.loads(cleaned_response)` không có try/except bao quanh.

**Vấn đề:** Nếu Gemini trả về JSON không hợp lệ (rất dễ xảy ra khi input đã bị cắt cụt giữa chừng do Bug #1) — lỗi `JSONDecodeError` sẽ ném lên, bị bắt bởi `except Exception as e: print(f"Lỗi extract...")` ở `extraction_service.py` (dòng 178, 229, 296) — nghĩa là **toàn bộ chunk đó bị bỏ qua hoàn toàn, 0 câu hỏi/từ vựng được lưu**, không có cách nào biết được nếu không đọc log console cẩn thận. Đây có thể là lý do thực tế khiến Part 6/7 hoàn toàn không có câu hỏi nào trong kết quả 11 câu đã thấy trước đó (nhiều khả năng toàn bộ 11 câu đều từ Part 5, Part 6/7 fail JSON do bị cắt cụt).

**Đề xuất fix:** Log riêng nội dung `cleaned_response` khi JSON parse fail, để dễ debug thay vì chỉ in tên exception.

---

## Những phần ĐÃ XÁC NHẬN hoạt động đúng (đọc code thật, không phải chỉ tin lời báo cáo)

- **Cache Gemini (`gemini_service.py` dòng 107-118):** logic hash + tra cứu `AICache` trước khi gọi API — code đúng như mô tả, đáng tin.
- **Retry/backoff 429 (`gemini_service.py` dòng 79-92):** có thật, exponential backoff đúng.
- **SRS logic:** chưa xem `srs_service.py` trong lần review này nhưng đã verify bằng log thật ở vòng trước, tạm tin.
- **Reverse typing flexible matching (`quiz.py` dòng 148-156):** logic đơn giản nhưng hợp lý, so khớp theo từ khoá.

---

## Việc cần làm ngay theo thứ tự ưu tiên

1. **Sửa Bug #1 trước tiên** — đây là bug nền tảng, sửa xong mới nên đánh giá lại bất kỳ số liệu nào khác (câu hỏi/từ vựng trích ra bao nhiêu, dashboard đúng sai) vì hiện tại toàn bộ dữ liệu đang bị thiếu nghiêm trọng.
2. Sau khi sửa Bug #1, **upload lại `RC-TEST_1.pdf` và so sánh số câu hỏi trích ra với ~100 câu thật của đề** — đây là phép test xác nhận quan trọng nhất.
3. Sửa Bug #3 (dashboard filter) và Bug #2 (synonym quiz) — cả 2 đều khiến tính năng "trông như chạy" nhưng cho kết quả sai/vô nghĩa.
4. Cập nhật `requirements.txt` (Bug #4) trước khi coi là "sẵn sàng dùng lâu dài".
5. Bug #5, #6, #7 có thể xếp sau, nhưng nên test riêng với 1 ảnh chụp/scan thật (không phải PDF có text layer) để xác nhận Bug #5 có xảy ra không.
