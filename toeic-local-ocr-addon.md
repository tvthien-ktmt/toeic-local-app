# TOEIC Local App — Bổ sung: Module OCR cho PDF dạng Scan/Ảnh (không tốn token AI)

> File này bổ sung cho `toeic-local-mvp-design.md` và `toeic-local-feature-checklist.md`. Vấn đề phát sinh: nhiều file PDF đề TOEIC sưu tầm thực chất là **ảnh scan**, không có text layer, nên MarkItDown mặc định trả về rỗng. Cần thêm bước OCR **hoàn toàn local**, không gọi bất kỳ AI API nào (0 token), trước khi đưa vào pipeline MarkItDown/chunking đã có.

---

## 1. Vấn đề cụ thể cần giải quyết

1. **Phát hiện PDF là scan/ảnh** (không có text layer) để biết khi nào cần OCR.
2. Đề TOEIC (Part 5/6/7) thường có **layout 2 cột cố định** (xem ảnh mẫu người dùng cung cấp: cột trái câu 101-104, cột phải câu 105-108 cùng hàng ngang). Nếu OCR đọc thẳng cả trang mà không tách cột, thứ tự văn bản sẽ bị trộn lẫn giữa 2 cột theo hàng ngang, phá hỏng toàn bộ nội dung.
3. Toàn bộ bước OCR này phải chạy **local, miễn phí, không dùng LLM Vision** — vì mục tiêu ban đầu của dự án là tiết kiệm token Gemini free tier. OCR không phải là bước cần AI hiểu ngữ nghĩa, chỉ cần nhận dạng ký tự — dùng Tesseract là đủ.

---

## 2. Lựa chọn công nghệ cho module OCR

| Thành phần | Lựa chọn | Lý do |
|---|---|---|
| Render PDF trang → ảnh | `pdf2image` (cần cài thêm `poppler` binary) hoặc `PyMuPDF` (`fitz`, không cần cài binary ngoài, dễ hơn trên Windows) | PyMuPDF (`pip install pymupdf`) đơn giản hơn cho Windows vì không cần cài Poppler riêng |
| OCR nhận dạng chữ | `pytesseract` (wrapper Python cho Tesseract OCR engine) | Miễn phí, local 100%, đủ tốt với văn bản in rõ như đề thi, cài đặt nhẹ hơn PaddleOCR nhiều |
| Tesseract binary | Cài Tesseract-OCR cho Windows (installer riêng, không phải pip) + gói ngôn ngữ `eng` | Bắt buộc phải cài binary gốc, `pytesseract` chỉ là wrapper gọi ra binary này |
| Xử lý cột | Tự viết logic cắt ảnh trang làm 2 nửa trái/phải theo chiều dọc trước khi OCR từng nửa | Đơn giản, đủ dùng vì layout TOEIC luôn cố định 2 cột đều nhau, không cần model layout detection AI |

> Cài đặt cần thiết: `pip install pymupdf pytesseract Pillow` + tải và cài Tesseract-OCR binary cho Windows từ trang chính thức (UB Mannheim build), thêm đường dẫn vào PATH hoặc set `pytesseract.pytesseract.tesseract_cmd`.

---

## 3. Luồng xử lý mới (thay thế/mở rộng Module 1.2 cũ)

```
Upload PDF
   │
   ▼
Thử đọc text layer qua MarkItDown như bình thường
   │
   ├─ Nếu độ dài text hợp lý so với số trang (vd > 200 ký tự/trang) → dùng luôn, xong (giữ nguyên luồng cũ, KHÔNG OCR, tiết kiệm thời gian)
   │
   └─ Nếu text rỗng hoặc quá ngắn bất thường → nghi ngờ là PDF scan/ảnh → chuyển sang nhánh OCR:
         │
         ▼
      Render từng trang PDF thành ảnh (PyMuPDF, độ phân giải đủ cao, khuyến nghị 300 DPI để OCR chính xác)
         │
         ▼
      Với mỗi trang ảnh: cắt làm 2 nửa theo chiều dọc (cột trái / cột phải)
      (Lưu ý: trang bìa/trang hướng dẫn đầu đề thường KHÔNG có 2 cột — cần logic nhận diện
       trang nào có 2 cột thật sự trước khi cắt, ví dụ dựa vào việc phát hiện khoảng trắng
       dọc lớn ở giữa trang, hoặc đơn giản hơn: cho phép người dùng xác nhận thủ công
       "trang này có 2 cột hay không" nếu logic tự động không chắc)
         │
         ▼
      OCR riêng từng cột theo đúng thứ tự: cột trái trước (từ trên xuống), rồi cột phải
         │
         ▼
      Ghép text 2 cột lại theo đúng thứ tự đọc, nối các trang lại thành 1 văn bản hoàn chỉnh
         │
         ▼
      Đưa văn bản OCR này vào đúng pipeline chunking/Gemini extraction đã có sẵn (không đổi gì ở bước sau)
```

---

## 4. Cấu trúc code đề xuất

```
backend/app/services/
├── markitdown_service.py     # giữ nguyên, xử lý PDF có text layer
├── ocr_service.py            # MỚI — xử lý PDF dạng scan/ảnh
│   ├── is_scanned_pdf(markdown_text, page_count) -> bool   # heuristic phát hiện
│   ├── render_pdf_pages_to_images(pdf_bytes) -> List[Image]
│   ├── detect_two_column_layout(image) -> bool             # heuristic đơn giản
│   ├── split_page_into_columns(image) -> (left_image, right_image)
│   └── ocr_page_to_text(image) -> str                       # gọi pytesseract
└── document_service.py       # điều phối: thử markitdown trước, fallback sang ocr_service nếu cần
```

---

## 5. Definition of Done (bắt buộc, không được báo hoàn thành nếu thiếu)

- [ ] **Test bằng đúng ảnh/PDF scan thật dạng 2 cột** (loại như ảnh Part 5 đã cung cấp) — không phải PDF text thuần đã test trước đó.
- [ ] Xác nhận logic phát hiện scan PDF hoạt động đúng: PDF text thuần vẫn đi qua nhánh MarkItDown cũ (không OCR nhầm, tốn thời gian vô ích), chỉ PDF scan mới OCR.
- [ ] Đối chiếu tay ít nhất 10 câu hỏi sau khi OCR + cắt cột: xác nhận thứ tự đúng là 101, 102, 103... không bị trộn lẫn giữa 2 cột (ví dụ câu 101 không được lẫn với nội dung câu 105 cùng hàng).
- [ ] Đo thời gian OCR thực tế cho 1 trang/1 đề đầy đủ — báo cáo con số cụ thể (vd "X giây/trang") để biết có chấp nhận được trong workflow hàng ngày không.
- [ ] Xác nhận trong suốt bước OCR **không có bất kỳ lệnh gọi Gemini API nào** được thực hiện (log rõ ràng như đã yêu cầu ở các module trước — `[MODE: LOCAL_OCR]` không lẫn với `[MODE: GEMINI_LIVE_API]`).
- [ ] Với trang không phải 2 cột (vd trang bìa, trang chỉ có 1 đoạn văn Part 7 dài), xác nhận không bị cắt đôi sai làm hỏng nội dung.

---

## 6. Ghi chú quan trọng cho AI thực thi

- Đây là module bổ sung, không thay thế toàn bộ luồng cũ — PDF có text layer thật vẫn nên ưu tiên dùng MarkItDown (nhanh hơn, chính xác hơn OCR).
- Nếu chất lượng OCR bằng Tesseract không đủ tốt sau khi test thật (nhiều lỗi nhận dạng ký tự, đặc biệt với font đề thi có chân/serif nhỏ), có thể cân nhắc nâng cấp lên PaddleOCR — nhưng đó là bước sau, không nên làm ngay vì setup nặng hơn nhiều so với deadline 7 ngày.
- Không được âm thầm bỏ qua bước cắt cột "cho đơn giản" rồi báo cáo là xong — vì đây chính là lý do OCR trở nên vô dụng nếu đọc sai thứ tự cột.
