# TOEIC Local App — Bổ sung chức năng vòng 3 (Tra từ nhanh, Nhắc kiến thức ngữ pháp, Giải thích đáp án + Dịch câu)

> Bổ sung cho các file spec trước. 3 module dưới đây tập trung vào việc học ngay TRONG lúc làm bài, thay vì phải rời trang đi tra cứu ở nơi khác.

---

## MODULE 16 — Bôi đen từ tra nghĩa nhanh & thêm từ vựng liên quan

> Lưu ý: không lấy dữ liệu từ bất kỳ nguồn từ vựng độc quyền có bản quyền nào (ví dụ tài liệu ETS chính thức) để tránh vi phạm bản quyền. Từ vựng liên quan được Gemini tự tạo dựa trên kiến thức chung về từ vựng thương mại/TOEIC phổ biến, không sao chép từ tài liệu cụ thể nào.

### 16.1. Bôi đen (highlight/select) 1 từ hoặc cụm từ trong đoạn văn/câu hỏi
- [ ] Người dùng bôi đen bất kỳ từ/cụm từ nào trong đoạn văn Part 6/7 hoặc trong câu hỏi Part 5 → hiện popup nhỏ ngay tại vị trí bôi đen.
- [ ] Popup hiển thị: nghĩa tiếng Việt (theo đúng ngữ cảnh câu đang đọc), phiên âm IPA, từ loại.
- [ ] Nếu từ đã có sẵn trong `vocabulary` (đã trích xuất từ tài liệu này trước đó) → lấy trực tiếp từ DB, **không gọi lại Gemini** (tiết kiệm token, phản hồi tức thì).
- [ ] Nếu từ chưa có trong DB → gọi Gemini 1 lần để tra nghĩa theo đúng câu ngữ cảnh, lưu luôn vào `vocabulary` (gắn `source_document_id` đúng tài liệu đang đọc) để lần sau không phải gọi lại.

### 16.2. Gợi ý từ vựng liên quan (mở rộng, không phải tra cứu đơn thuần)
- [ ] Sau khi tra 1 từ, có nút "Xem thêm từ liên quan chủ đề này" → gọi Gemini sinh thêm 3-5 từ vựng business/TOEIC cùng chủ đề hoặc cùng nhóm nghĩa (ví dụ tra "invoice" → gợi ý thêm "receipt", "billing statement", "payment due date"...).
- [ ] Các từ gợi ý thêm này lưu vào `vocabulary` với `source_document_id = NULL` hoặc đánh dấu riêng (`source_type = 'suggested'`) để phân biệt với từ trích trực tiếp từ đề — tránh nhầm lẫn thống kê "từ trong đề của tôi" với "từ AI gợi ý thêm".
- [ ] Cache theo từ + ngữ cảnh (không sinh lại gợi ý ý y hệt nếu tra cùng 1 từ lần nữa).

### 16.3. Thêm nhanh vào Flashcard ngay từ popup
- [ ] Nút "Thêm vào Flashcard" ngay trong popup tra từ — không cần rời khỏi trang đang đọc đề để thêm từ thủ công.

**DoD:**
- [ ] Test bôi đen 5 từ khác nhau trong 1 đoạn Part 7 thật — xác nhận nghĩa hiển thị đúng theo ngữ cảnh câu đó (không phải nghĩa từ điển chung chung, đặc biệt với từ đa nghĩa).
- [ ] Xác nhận từ đã có trong DB thì phản hồi tức thì (không có độ trễ gọi API) — kiểm tra qua Network tab của trình duyệt hoặc log backend.
- [ ] Test gợi ý từ liên quan — xác nhận 3-5 từ gợi ý thực sự liên quan chủ đề, không lạc đề.

---

## MODULE 17 — Nhắc lại kiến thức ngữ pháp khi quên (Grammar Point Quick Reference)

### 17.1. Nhãn chủ điểm ngữ pháp có thể bấm vào được
- [ ] Ở mọi nơi hiển thị `grammar_topic` (trang chi tiết câu hỏi, kết quả sau khi làm bài, trang luyện theo chủ đề) — nhãn này trở thành 1 link/nút bấm được, không chỉ là text tĩnh.
- [ ] Bấm vào → mở 1 thẻ/modal "Ôn nhanh" hiển thị:
  - Tên chủ điểm ngữ pháp (vd "Mệnh đề quan hệ", "Thể giả định", "So sánh hơn").
  - Công thức/cấu trúc cơ bản (ngắn gọn, dạng công thức: vd "S + V + that + S + (should) + V-inf" cho thể giả định).
  - 1-2 quy tắc dùng quan trọng nhất cần nhớ.
  - 1-2 câu ví dụ minh hoạ (không lấy nguyên câu từ đề đang làm, để tránh lộ đáp án nếu đang làm bài — sinh câu ví dụ mới).

### 17.2. Thư viện chủ điểm ngữ pháp — sinh 1 lần, dùng mãi (không phải hỏi Gemini mỗi lần bấm)
- [ ] Tạo bảng riêng `grammar_reference` (khác với `questions.grammar_topic` chỉ là nhãn phân loại): `topic_name`, `formula`, `key_rules`, `example_sentences`.
- [ ] Khi 1 `grammar_topic` mới xuất hiện lần đầu (từ việc trích xuất câu hỏi), hệ thống tự động gọi Gemini 1 lần để tạo nội dung "Ôn nhanh" cho chủ điểm đó, lưu vào `grammar_reference` — **các lần bấm sau của CHÍNH chủ điểm đó (bất kỳ câu hỏi nào), không gọi lại Gemini nữa**, chỉ đọc từ bảng này.
- [ ] Vì số lượng chủ điểm ngữ pháp TOEIC Part 5/6 thực tế không nhiều (khoảng 20-30 chủ điểm phổ biến), bảng này sẽ nhanh chóng đầy đủ và gần như không bao giờ cần gọi Gemini lại sau vài đề đầu tiên.

**DoD:**
- [ ] Bấm vào cùng 1 chủ điểm ngữ pháp ở 2 câu hỏi khác nhau — xác nhận lần thứ 2 không gọi Gemini (đọc từ `grammar_reference`, log phải thể hiện rõ cache hit).
- [ ] Đối chiếu tay 5 chủ điểm ngữ pháp phổ biến nhất (thì động từ, mệnh đề quan hệ, thể bị động, so sánh, giới từ) — xác nhận công thức/quy tắc đúng chuẩn ngữ pháp tiếng Anh thực tế, không sai kiến thức.

---

## MODULE 18 — Giải thích chi tiết đáp án (đúng/sai) + Dịch câu theo nghĩa

### 18.1. Mở rộng dữ liệu câu hỏi: giải thích riêng cho TỪNG lựa chọn, không chỉ đáp án đúng
- [ ] Mở rộng prompt trích xuất câu hỏi (Part 5/6/7) yêu cầu Gemini trả về thêm field `option_explanations`: giải thích ngắn cho CẢ 4 lựa chọn A/B/C/D — vì sao đúng (với đáp án đúng) hoặc vì sao sai cụ thể (với 3 đáp án còn lại), không chỉ giải thích chung chung "đáp án đúng là X".
- [ ] Ví dụ format: `{"A": "Sai vì đây là danh từ, vị trí cần tính từ", "B": "Đúng vì...", "C": "Sai vì...", "D": "Sai vì..."}`.

### 18.2. Dịch câu hoàn chỉnh sang tiếng Việt (khớp nghĩa theo ngữ cảnh)
- [ ] Mở rộng prompt yêu cầu thêm field `translated_sentence`: bản dịch tiếng Việt của câu hỏi ĐÃ ĐIỀN đáp án đúng vào chỗ trống, dịch tự nhiên khớp nghĩa (không dịch word-by-word máy móc).
- [ ] Với Part 6/7 (đoạn văn dài), có thể chỉ dịch câu chứa chỗ trống + 1 câu liền trước/sau để giữ ngữ cảnh, không cần dịch nguyên cả đoạn dài (tránh tốn token không cần thiết cho phần không liên quan tới câu hỏi cụ thể).

### 18.3. Hiển thị khi người dùng trả lời (đúng hoặc sai đều hiển thị)
- [ ] Sau khi chọn đáp án (dù đúng hay sai), hiển thị ngay:
  - Đáp án đúng là gì.
  - Giải thích RIÊNG cho đáp án người dùng vừa chọn (lấy từ `option_explanations[đáp_án_đã_chọn]`) — để người dùng hiểu chính xác tại sao lựa chọn CỦA HỌ sai (nếu sai), không chỉ đọc giải thích chung của đáp án đúng.
  - Bản dịch câu hoàn chỉnh (`translated_sentence`).

**DoD:**
- [ ] Vì `option_explanations` và `translated_sentence` được sinh 1 lần lúc trích xuất (không phải sinh lại mỗi lần người dùng làm bài) — xác nhận việc làm lại 1 câu hỏi nhiều lần (luyện lại) không gọi thêm Gemini, chỉ đọc dữ liệu đã lưu.
- [ ] Đối chiếu tay 5 câu: giải thích cho đáp án sai phải cụ thể, đúng lý do ngữ pháp/ngữ nghĩa thực sự (không phải câu chung chung kiểu "vì đáp án này không đúng ngữ pháp" mà không nói rõ tại sao).
- [ ] Bản dịch câu phải tự nhiên, khớp nghĩa tiếng Việt — không phải dịch máy cứng nhắc từng từ.

---

## Ghi chú cho AI thực thi

- Cả 3 module đều tuân theo nguyên tắc đã thiết lập từ đầu: **sinh 1 lần, cache mãi mãi** — không gọi lại Gemini cho nội dung đã có. Đây là điểm quan trọng nhất cần giữ nguyên xuyên suốt.
- Module 17 và 18 nên MỞ RỘNG ngay trong lần trích xuất câu hỏi hiện tại (cùng 1 lần gọi Gemini lúc extract, không cần gọi thêm request riêng) — tức là bổ sung thêm field vào đúng prompt trích xuất câu hỏi đã có (Module 2), không tạo endpoint/luồng gọi API tách biệt, để tránh tăng thêm số lần gọi Gemini không cần thiết.
- Test bằng đúng file PDF thật `RC-TEST_1.pdf` đã dùng ở các vòng review trước, để có thể so sánh trực tiếp chất lượng.
