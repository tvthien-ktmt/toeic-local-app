# TOEIC Local App — Performance & Clean Code Audit + Fix Prompt

> Đã quét trực tiếp codebase (grep + đọc code thật, không đoán). Dưới đây là các vấn đề CỤ THỂ tìm được, kèm file:line, xếp theo mức ưu tiên. Ưu tiên sửa đúng những gì liệt kê, không cần "tối ưu chung chung".

---

## 🔴 P0 — Load toàn bộ bảng Vocabulary vào RAM mỗi lần tạo quiz (sẽ chậm dần khi dùng lâu dài)

**File:** `backend/app/routers/quiz.py`, dòng 43, 111, 182
```python
target_words = db.query(Vocabulary).all()   # dòng 43
words = db.query(Vocabulary).all()          # dòng 111
words = db.query(Vocabulary).all()          # dòng 182
```

**Vấn đề:** Mỗi lần người dùng bấm tạo 1 câu quiz (chọn nghĩa, chọn đồng nghĩa...), code tải **TOÀN BỘ bảng từ vựng** vào RAM chỉ để lấy ngẫu nhiên vài từ làm distractor. Đây đúng là kiểu vi phạm nguyên tắc "không load cả bảng" đã đặt ra từ đầu dự án (Module 15). Hiện tại (vài trăm từ) chưa thấy chậm, nhưng sau vài tháng dùng thật (có thể vài nghìn từ), mỗi lần bấm quiz sẽ load hàng nghìn record không cần thiết — quiz sẽ ngày càng lag dù chỉ cần 3-4 từ ngẫu nhiên.

**Yêu cầu sửa:** Thay `db.query(Vocabulary).all()` bằng lấy ngẫu nhiên trực tiếp trong SQL, ví dụ:
```python
# SQLite: dùng ORDER BY RANDOM() LIMIT N thay vì tải hết rồi random ở Python
distractor_candidates = db.query(Vocabulary).filter(Vocabulary.id != target.id).order_by(func.random()).limit(10).all()
```
Áp dụng cho cả 3 vị trí trên.

---

## 🟠 P1 — Danh sách ID tải về Python rồi mới `.in_()` lại (2 vòng round-trip DB không cần thiết)

**File:** `backend/app/routers/dashboard.py` dòng 107-110, `backend/app/routers/documents.py` dòng 119, 194
```python
v_ids = [v.id for v in db.query(Vocabulary.id).filter(...).all()]
# sau đó dùng v_ids trong 1 query khác .in_(v_ids)
```

**Vấn đề:** Không sai, nhưng không tối ưu — tải toàn bộ ID về Python rồi truyền lại vào query khác, thay vì dùng subquery ngay trong SQL (1 round-trip DB thay vì 2). Ảnh hưởng nhẹ ở quy mô nhỏ, nhưng nên sửa cho đúng chuẩn khi đã động tay vào.

**Yêu cầu sửa:** Dùng subquery SQLAlchemy trực tiếp, ví dụ:
```python
v_subq = db.query(Vocabulary.id).filter(Vocabulary.appears_in_part == f"Part {part_num}").subquery()
# rồi .filter(PracticeAttempt.vocabulary_id.in_(v_subq))
```

---

## 🟠 P1 — Chưa có Virtualized List cho danh sách dài (đã ghi trong spec Module 15 nhưng chưa làm)

**Vấn đề:** Grep toàn bộ frontend không tìm thấy `react-window` hay tương đương nào được cài/dùng. Trang danh sách từ vựng, danh sách câu hỏi hiện render toàn bộ DOM node cùng lúc — khi dữ liệu tích luỹ lên vài trăm/nghìn mục sau vài tháng dùng, cuộn trang sẽ giật.

**Yêu cầu sửa:**
- Cài `react-window` (`npm install react-window`).
- Áp dụng cho: danh sách từ vựng (VocabularyPage/FlashcardPage danh sách toàn bộ), danh sách câu hỏi (DocumentDetailPage), lịch sử luyện tập nếu có hiển thị dạng danh sách dài.
- Chỉ cần áp dụng khi số lượng item > 100-200 (không cần virtualize danh sách ngắn như 10-20 album chủ đề).

---

## 🟡 P2 — 2 chỗ `setTimeout` không được dọn dẹp khi component unmount

**File:** `frontend/src/pages/DocumentDetailPage.tsx` dòng 107, `frontend/src/pages/FlashcardPage.tsx` dòng 79
```js
setTimeout(() => setCopied(false), 2000);  // DocumentDetailPage.tsx — không lưu lại timer ID để clear
setTimeout(() => { ... }, ...);             // FlashcardPage.tsx — tương tự
```

**Vấn đề:** Nếu người dùng rời trang (chuyển route) trước khi 2 giây/khoảng thời gian đó trôi qua, React sẽ cảnh báo "cập nhật state trên component đã unmount" — không gây crash nhưng là code không sạch, và nếu bấm nhanh liên tục (ví dụ lật flashcard liên tục) có thể chồng chất nhiều timeout cùng lúc gây giật nhẹ khi dùng lâu.

**Yêu cầu sửa:** Lưu lại timer ID bằng `useRef`, clear trong cleanup function của `useEffect`, hoặc clear timer cũ trước khi tạo timer mới nếu hành động lặp lại nhanh (debounce).

---

## Ghi chú kiểm tra thêm (không phải bug cụ thể, nhưng nên rà lại)

- [ ] Xác nhận các session SQLAlchemy (`db: Session`) đều được đóng đúng cách sau mỗi request (FastAPI `Depends(get_db)` thường tự đóng, nhưng cần xác nhận không có chỗ nào tự mở `SessionLocal()` riêng mà quên đóng — đặc biệt trong các script cũ nếu còn sót logic tương tự).
- [ ] Với `ProcessPoolExecutor` trong OCR — xác nhận không có process con nào bị treo lại sau khi xử lý xong (kiểm tra Task Manager sau khi OCR xong 1 file lớn, số tiến trình Python phải về lại bình thường).

---

## DoD — bắt buộc có bằng chứng, không chỉ nói "đã tối ưu"

- [ ] Sau khi sửa P0 (quiz.py), tạo dữ liệu test giả ~1000-2000 từ vựng trong DB, đo thời gian phản hồi API tạo quiz TRƯỚC và SAU khi sửa — dán 2 con số cụ thể để thấy chênh lệch thật (không cần nếu quá mất công, nhưng ít nhất xác nhận query mới dùng `ORDER BY RANDOM() LIMIT` chứ không load hết bảng — có thể xác nhận qua `EXPLAIN QUERY PLAN` hoặc đơn giản là đọc lại code).
- [ ] Sau khi thêm virtualized list, thử với danh sách từ vựng dài (tạo test data nếu cần), xác nhận số DOM node hiển thị trong DevTools Elements tab không tăng tuyến tính theo tổng số từ (chỉ tăng theo số item đang hiển thị trên màn hình).
- [ ] Dùng lâu 1 phiên (mở app, luyện flashcard/quiz liên tục 10-15 phút), theo dõi Task Manager — RAM/CPU của tiến trình `uvicorn` và trình duyệt không tăng dần liên tục không kiểm soát (dấu hiệu memory leak).
