# TOEIC Local App — Bổ sung vòng 4 (Time Budgeting theo Part & Study Progress Analytics)

---

## MODULE 19 — Giới hạn thời gian luyện tập theo từng Part (Time Budgeting)

> Đây là chiến lược phân bổ thời gian phổ biến được nhiều tài liệu luyện thi khuyên dùng cho bài thi Reading TOEIC (tổng 75 phút cho 100 câu, không có giới hạn thời gian chính thức riêng cho từng Part từ ETS — đây là gợi ý phân bổ hợp lý dựa trên độ khó/số lượng câu mỗi Part, không phải quy định bắt buộc):
> - Part 5 (30 câu, điền từ đơn): khuyến nghị khoảng 10-11 phút (~20 giây/câu).
> - Part 6 (16 câu, điền đoạn văn): khuyến nghị khoảng 10 phút.
> - Part 7 (54 câu, đọc hiểu): khuyến nghị khoảng 54-55 phút (phần tốn thời gian nhất vì phải đọc đoạn văn dài).

### 19.1. Cấu hình thời gian mục tiêu theo Part (có thể chỉnh)
- [ ] Cho phép người dùng đặt thời gian mục tiêu riêng cho mỗi Part khi bắt đầu 1 phiên luyện tập (mặc định theo gợi ý ở trên, nhưng chỉnh được vì tốc độ đọc mỗi người khác nhau).
- [ ] Hiển thị đồng hồ đếm ngược khi luyện tập theo Part, đổi màu cảnh báo (vàng/đỏ) khi gần hết hoặc vượt thời gian mục tiêu — không bắt buộc dừng bài, chỉ cảnh báo để tự luyện tốc độ.

### 19.2. Chế độ thi thử đầy đủ có tính giờ (Full Mock Test)
- [ ] Làm liên tục Part 5 → 6 → 7 với đồng hồ đếm ngược tổng 75 phút, không dừng xem giải thích giữa chừng (giữ đúng áp lực thời gian thật).
- [ ] Hết giờ tự động nộp bài, hiển thị kết quả tổng kết cuối: số câu đúng theo từng Part, tổng thời gian thực tế đã dùng cho mỗi Part (so sánh với mục tiêu).

### 19.3. Thống kê tốc độ làm bài
- [ ] Với mỗi lượt luyện tập (không chỉ mock test đầy đủ), ghi lại thời gian trung bình mỗi câu theo Part (dựa vào `practice_attempts` đã có, cần thêm cột lưu thời điểm bắt đầu/kết thúc mỗi câu).
- [ ] Hiển thị trên Dashboard: tốc độ trung bình hiện tại theo Part, so sánh với mốc khuyến nghị (vd "Bạn đang mất trung bình 35s/câu Part 5, mục tiêu là 20s/câu").

**DoD:**
- [ ] Cột thời gian mới không được phá vỡ luồng luyện tập hiện có — nếu người dùng không quan tâm tốc độ, vẫn luyện bình thường được (tính năng là bổ trợ, không bắt buộc).
- [ ] Test mock test đầy đủ: xác nhận hết giờ tự động nộp bài đúng, không mất dữ liệu đã làm dở.

---

## MODULE 20 — Theo dõi tiến độ học tập trung bình (Study Time & Progress Analytics)

> Mở rộng Dashboard (Module 13) đã có, thêm góc nhìn theo THỜI GIAN HỌC thay vì chỉ số lượng câu/từ.

### 20.1. Thời gian học trung bình mỗi ngày/phiên
- [ ] Ghi nhận thời điểm bắt đầu và kết thúc mỗi phiên sử dụng app (flashcard, quiz, luyện tập, đọc tài liệu).
- [ ] Tính: tổng thời gian học trong 7/14/30 ngày gần nhất, thời gian học trung bình/ngày, số ngày có học trong khoảng thời gian đó (để biết mức độ đều đặn).

### 20.2. Tiến độ tổng quan theo thời gian
- [ ] Biểu đồ đơn giản (dạng bảng hoặc thanh ngang, không cần biểu đồ phức tạp): số từ vựng đã thuộc tăng dần theo từng tuần, số câu hỏi đã luyện tăng dần theo từng tuần.
- [ ] Ước tính "còn bao nhiêu từ/câu chưa luyện" dựa trên tổng số đã trích xuất trong hệ thống — để biết còn bao xa so với "học hết dữ liệu đã có".

**DoD:**
- [ ] Số liệu thời gian phải tính từ dữ liệu thật (timestamp lưu trong DB), không ước lượng/giả định.
- [ ] Test: dùng thử app trong vài phút, đóng lại, mở lại xem dashboard — xác nhận thời gian phiên vừa rồi được ghi nhận đúng (đối chiếu tay bằng đồng hồ thật).

---

## Ghi chú về việc upload file lớn (450+ trang / nhiều test gộp chung)

- **KHÔNG khuyến khích** upload trực tiếp 1 file gộp nhiều đề thi (dạng sách tổng hợp). Logic chunking hiện tại dựa trên việc mỗi tài liệu chỉ có 1 lần "PART 5"/"PART 6"/"PART 7" — nếu file có nhiều đề, sẽ bị trộn lẫn câu hỏi giữa các đề khác nhau.
- Nếu muốn hỗ trợ file nhiều đề trong tương lai, cần thêm bước: tự động phát hiện ranh giới GIỮA CÁC ĐỀ (ví dụ tìm pattern "TEST 1", "TEST 2"...) trước khi mới chunking theo Part bên trong từng đề — đây là việc lớn hơn, không nên làm trong giai đoạn này.
- Trước mắt: thêm cảnh báo ở giao diện Upload nếu phát hiện PDF quá dài (ví dụ > 60-80 trang) hoặc có nhiều hơn 1 lần xuất hiện "PART 5" trong nội dung — gợi ý người dùng tách file trước khi upload, thay vì xử lý sai âm thầm.
