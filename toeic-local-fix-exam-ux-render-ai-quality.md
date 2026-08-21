# TOEIC Local App — Fix 3 vấn đề: UX làm bài, Render Part 6/7, Chất lượng AI giải thích

---

## VẤN ĐỀ 1 — Bắt buộc làm hết 100 câu mới nộp được, chưa rõ lưu lịch sử/làm lại

### 1.1. Bỏ ràng buộc bắt buộc trả lời hết mới được nộp
- [ ] Cho phép nộp bài bất kỳ lúc nào, kể cả còn câu chưa làm. Nếu còn câu trống, hiện popup xác nhận: *"Bạn còn X câu chưa trả lời. Các câu này sẽ tính là sai/bỏ qua. Nộp bài luôn?"* — người dùng tự quyết định, không chặn cứng.
- [ ] Câu bỏ trống tính là sai khi chấm điểm, hiển thị riêng biệt trong bảng kết quả (khác với câu chọn sai) để người dùng biết mình BỎ chứ không phải LÀM SAI.

### 1.2. Lưu lịch sử đầy đủ, cho làm lại không giới hạn
- [ ] Mỗi lần nộp bài (dù đầy đủ hay dở dang) đều tạo 1 bản ghi `builtin_exam_attempts` mới — không ghi đè lần trước.
- [ ] Trang "Lịch sử" cho từng đề: liệt kê tất cả các lần đã làm (ngày giờ, điểm số, thời gian làm), cho xem lại chi tiết từng lần (đã chọn gì, đáp án đúng, giải thích) mà không tính là làm lại mới.
- [ ] Cho phép làm lại đề đã làm bất kỳ lúc nào (không giới hạn số lần), mỗi lần là 1 attempt độc lập.

### 1.3. Tính năng bổ sung nên có (tăng trải nghiệm, không phải chỉ vá lỗi)

- **"Đánh dấu để xem lại" (Mark for Review):** giống thi TOEIC thật trên máy — trong lúc làm bài, đánh dấu câu phân vân để quay lại sau, có nút "Xem các câu đã đánh dấu" trước khi nộp.
- **Lưu tiến độ dở dang (Resume):** nếu đang làm dở (đặc biệt ở chế độ luyện không giới hạn giờ) mà thoát ra giữa chừng, lần sau vào lại đề đó hỏi "Tiếp tục lần làm dở dang hay bắt đầu mới?" — tránh mất công đã làm.
- **So sánh tiến bộ qua các lần làm cùng 1 đề:** biểu đồ điểm số tăng/giảm qua các lần thi lại cùng 1 đề — trực quan hoá việc "học có tiến bộ không".
- **Không cho xem đáp án đúng cho tới khi nộp ở chế độ "Thi thật 75 phút"** (giữ đúng áp lực thi thật — đã có 1 phần ở Module 19, đảm bảo không bị lộ khi bấm "Đánh dấu để xem lại" giữa chừng).

**DoD:** Test thật: làm dở 1 đề (bỏ trống 20 câu), nộp bài, xác nhận vẫn nộp được + điểm tính đúng bỏ trống = sai + lịch sử ghi nhận đúng. Làm lại đề đó lần 2, xác nhận cả 2 lần đều lưu riêng biệt, xem lại được cả 2.

---

## VẤN ĐỀ 2 — Part 6/7 hiển thị nguyên Markdown thô, khó đọc (đặc biệt bảng/checkbox)

### Nguyên nhân
Nội dung đoạn văn Part 6/7 (memo, form, bảng biểu...) đang được hiển thị dưới dạng TEXT THÔ (markdown chưa qua render), nên các ký tự markdown (`|`, `#`, `[X]`, `[ ]`...) hiện nguyên xi thay vì render thành bảng/checkbox trực quan. Đặc biệt các form có ô tick (như phiếu đổi/trả hàng: `[X] Return` / `[ ] Exchange for ___`) hiện thành chữ thô rất khó đọc.

### 2.1. Dùng thư viện render Markdown thật (không tự hiển thị text thô)
- [ ] Cài `react-markdown` + `remark-gfm` (hỗ trợ bảng, checkbox, strikethrough theo chuẩn GitHub Flavored Markdown).
- [ ] Áp dụng cho MỌI nơi hiển thị đoạn văn Part 6/7 (trang làm bài, trang xem lại, trang chi tiết tài liệu).

### 2.2. Chuẩn hoá dữ liệu OCR sang đúng cú pháp Markdown checkbox trước khi lưu
- [ ] Khi trích xuất/ingest, thêm bước tiền xử lý: chuyển `[X]`/`[x]` → `- [x]`, `[ ]` → `- [ ]` (đúng cú pháp GFM checkbox) nếu đang đứng đầu dòng dạng danh sách lựa chọn.
- [ ] Với bảng dữ liệu (như bảng giá, bảng đơn hàng) — nếu OCR ra dạng cột lộn xộn không thể tự dựng lại bảng markdown chuẩn (`| Cột 1 | Cột 2 |`), ưu tiên hiển thị dạng danh sách key-value dễ đọc hơn là cố ép vào bảng sai lệch.

### 2.3. Test bằng đúng loại nội dung khó
- [ ] Dùng chính đoạn "Spellbound Apparel — Returns & Exchanges Form" (câu 181-185 trong `RC-TEST_1.pdf`, có ô tick Return/Exchange) làm case test — xác nhận sau khi sửa, ô tick hiển thị trực quan (checkbox thật), không còn `[X]` dạng chữ.

**DoD:** Chụp ảnh trước/sau khi sửa cho đúng đoạn form có checkbox này, gửi để đối chiếu trực quan.

---

## VẤN ĐỀ 3 — AI giải thích/dịch chậm + hời hợt, cần nâng cấp thành tính năng cạnh tranh thật sự

### 3.1. Vì sao đang chậm — chuyển từ "gọi AI lúc người dùng xem" sang "sinh sẵn lúc ingest"
Đề có sẵn (built-in) là dữ liệu TĨNH, dùng chung mãi mãi — không có lý do gì phải gọi Gemini MỖI LẦN người dùng bấm xem giải thích. Đây chính là nguyên nhân chậm.

- [ ] Chuyển giải thích + dịch câu + phân loại ngữ pháp sang **sinh 1 lần duy nhất trong lúc chạy script ingest** (giống cách đã làm với đáp án đúng — lấy từ file có sẵn, không phải AI đoán mỗi lần).
- [ ] Lưu thẳng vào `builtin_exam_questions` (thêm cột `option_explanations_json`, `translated_sentence`, `grammar_topic` — giống cấu trúc đã có ở bảng `questions` của luồng upload).
- [ ] Khi người dùng xem lại bài, chỉ đọc từ DB — **0 độ trễ, 0 gọi API lúc đó**.

### 3.2. Nâng chất lượng prompt — không còn "giải thích cho có"
Yêu cầu prompt mới phải trả về đủ các phần sau cho MỖI câu (không phải câu chung chung):

```
{
  "grammar_topic": "Tên chủ điểm CHÍNH XÁC, cụ thể (vd: 'Đại từ sở hữu (Possessive Pronoun)', không phải chỉ 'Pronoun' chung chung)",
  "grammar_recall": "Nhắc lại NGẮN GỌN công thức/quy tắc của chủ điểm này (2-3 câu), để người học không cần rời trang tra cứu lại",
  "option_explanations": {
    "A": "Vì sao SAI cụ thể (không phải 'sai vì không đúng ngữ pháp' chung chung — nêu rõ lý do ngữ pháp/nghĩa)",
    "B": "...",
    "C": "...",
    "D": "Vì sao ĐÚNG, giải thích cách xác định đáp án từ ngữ cảnh câu"
  },
  "common_trap": "Nếu có 1 đáp án sai NHƯNG rất dễ nhầm (bẫy phổ biến), giải thích RIÊNG vì sao học viên hay chọn nhầm đáp án đó — đây là insight quan trọng để tránh lặp lại lỗi",
  "translated_sentence": "Bản dịch tiếng Việt tự nhiên, ĐÚNG NGỮ CẢNH (không dịch máy móc từng từ) của câu đã điền đáp án đúng"
}
```

- [ ] Với `common_trap`: đây là điểm khác biệt cạnh tranh — hầu hết app khác chỉ nói "đáp án đúng là B", không nói "nhiều người chọn nhầm C vì...". Đây chính là giá trị giúp người học THỰC SỰ hiểu vì sao mình sai, tránh lặp lại.
- [ ] Liên kết `grammar_topic` với bảng `grammar_reference` đã có (Module 17) — khi người dùng bấm vào tên chủ điểm, mở đúng thẻ "Ôn nhanh" đã có sẵn, không tạo nội dung trùng lặp.

### 3.3. Tính năng MỚI — "Tổng Ôn Sau Khi Thi" (điểm cạnh tranh chính, đề xuất MVP)

> Đây là tính năng có thể tạo khác biệt thật sự so với các web luyện thi khác — biến việc "làm xong 1 đề" thành 1 vòng học tập khép kín, không chỉ dừng ở chấm điểm.

- [ ] Sau khi nộp bài, ngoài bảng điểm, thêm màn hình **"Tổng ôn lỗi sai"**:
  - Nhóm TẤT CẢ câu sai/bỏ trống theo `grammar_topic` (vd: "Bạn sai 4/5 câu về Thể bị động").
  - Với mỗi nhóm, hiện luôn thẻ "Ôn nhanh" (Module 17) NGAY TẠI ĐÂY, không cần bấm rời sang trang khác.
  - Cho luyện lại NGAY các câu tương tự (dùng chức năng sinh câu tương tự đã có — Module 4) cho đúng nhóm chủ điểm đang yếu.
- [ ] **Theo dõi điểm yếu tích luỹ qua nhiều lần thi** (không chỉ 1 đề): Dashboard thêm mục "Chủ điểm hay sai nhất" tổng hợp từ TẤT CẢ các lần thi built-in exam đã làm — đây là dữ liệu giá trị nhất về lâu dài, giúp người học biết chính xác cần tập trung ôn gì trước kỳ thi thật, thay vì học tràn lan.

**DoD:**
- [ ] Chạy ingest cho 1 bộ đề mẫu, xác nhận `option_explanations`/`translated_sentence`/`common_trap` được sinh sẵn, đọc lại tức thì (0 độ trễ) khi xem lại bài.
- [ ] Đối chiếu tay 5 câu: giải thích phải cụ thể, `common_trap` phải hợp lý (không phải câu chung chung lặp lại 3 phần khác).
- [ ] Test màn hình "Tổng ôn lỗi sai" sau khi cố tình làm sai 1 nhóm chủ điểm — xác nhận nhóm đúng, hiện thẻ ôn nhanh đúng chủ điểm đó.
