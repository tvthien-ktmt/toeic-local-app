À, hiểu ý m rồi. M đang **vibe concept/product cho một website chỉ tập trung TOEIC Listening (LC)**, và cần một **bộ yêu cầu/brief đủ rõ để đưa cho designer/dev/AI dựng web**.

T sẽ tách thành 2 phần: **(A) website thi thử LC như thi thật** và **(B) website học + ôn LC lý tưởng để kéo điểm cao**.

---

# A. YÊU CẦU WEBSITE THI THỬ TOEIC LC NHƯ THI THẬT

## 1. Mục tiêu sản phẩm

Website phải mô phỏng trải nghiệm thi TOEIC Listening càng sát kỳ thi thật càng tốt.

Người dùng khi vào **Mock Test** phải có cảm giác:

> “Đây là một phòng thi, không phải một app học.”

Website tập trung vào **tính chính xác của format, timing, audio flow, áp lực thời gian và cách điều hướng**, thay vì các tính năng học tập.

---

## 2. Cấu trúc bài thi

Bài thi Listening gồm 100 câu, chia thành:

- **Part 1 – Photographs:** 6 câu
- **Part 2 – Question-Response:** 25 câu
- **Part 3 – Conversations:** 39 câu
- **Part 4 – Talks:** 30 câu

Tổng thời gian Listening khoảng 45 phút.

Website phải giữ nguyên cấu trúc này trong **Full Mock Test**.

---

## 3. Nguyên tắc “Exam Mode”

Khi người dùng bấm:

> **START TEST**

thì website chuyển sang giao diện thi.

Trong Exam Mode:

- Audio tự động phát.
- Không có nút pause.
- Không replay.
- Không tua audio.
- Không transcript.
- Không giải thích.
- Không hiện đáp án.
- Không hiện từ vựng.
- Không cho biết người dùng đang đúng hay sai.
- Người dùng chỉ được chọn đáp án.
- Hệ thống tự chuyển theo flow của bài thi.

Mục tiêu là tạo cảm giác:

> **Một lần nghe → phải xử lý → chọn đáp án → tiếp tục.**

---

## 4. Giao diện thi

UI phải tối giản, ít distraction.

### Header

Hiển thị:

> TOEIC LISTENING MOCK TEST
> Part 3
> Question 47 / 100

Có timer hoặc indicator tiến trình phù hợp với chế độ mô phỏng.

### Main area

Hiển thị:

- ảnh nếu là Part 1
- câu hỏi
- 4 đáp án A/B/C/D
- progress

Không hiển thị các thông tin thừa.

### Trạng thái câu hỏi

Ví dụ:

> 47
> 48
> 49
> 50

Có thể đánh dấu câu đã chọn nhưng không làm rối giao diện.

---

# 5. Audio Engine phải là phần cực kỳ quan trọng

Đây là thứ quyết định website có “giống thi thật” hay không.

Audio phải:

- tự động phát
- volume ổn định
- không pause
- không replay
- không tua
- transition tự nhiên giữa các câu
- chuyển đúng Part
- có khoảng thời gian hợp lý để người dùng đọc và chọn đáp án

Part 3/4 phải có:

> Audio → Question 1 → Question 2 → Question 3

với flow liên tục.

Không cho người dùng tự quyết định thời điểm phát audio trong Exam Mode.

---

# 6. Part 1

Hiển thị:

> 1 hình ảnh

Audio phát 4 câu mô tả:

A. ...
B. ...
C. ...
D. ...

Người dùng chọn một đáp án.

Sau đó chuyển tiếp.

Không có:

> “Replay audio”

Không có:

> “Show transcript”

---

# 7. Part 2

UI phải rất nhanh.

Ví dụ:

> Question 18

Audio:

> “When will the meeting begin?”

Sau audio:

A. At two o'clock.
B. In the conference room.
C. Yes, it was.

Người dùng chọn ngay.

Không hiển thị transcript của câu hỏi đã nghe.

---

# 8. Part 3

Cần thiết kế đúng logic hội thoại.

Ví dụ:

### Conversation

Audio phát.

Sau đó hiển thị:

**Q47. What are the speakers mainly discussing?**

A...
B...
C...
D...

**Q48. Why does the woman mention...?**

A...
B...
C...
D...

**Q49. What will the man most likely do next?**

A...
B...
C...
D...

Một conversation có thể đi với 3 câu hỏi.

---

# 9. Part 4

Tương tự Part 3 nhưng là:

- announcement
- speech
- message
- advertisement
- news
- workplace talk
- public announcement

Phải có nhiều dạng câu hỏi:

- main idea
- detail
- purpose
- inference
- next action
- location/time
- relationship

---

# 10. Sau khi nộp bài

Không chỉ hiện:

> **72/100**

Mà phải có trang **Result**.

Ví dụ:

> ## Your Listening Result
>
> **Estimated Score: 385 / 495**

### Performance

Part 1
**6/6**

Part 2
**21/25**

Part 3
**25/39**

Part 4
**23/30**

---

# 11. Result phải phân tích lỗi

Ví dụ:

> ### Your Weakest Areas

**Part 3 – Inference**
58%

**Part 4 – Detail**
64%

**Part 2 – Indirect Response**
68%

Sau đó:

> **Bạn đang mất điểm chủ yếu ở Part 3, đặc biệt là câu hỏi suy luận.**

---

# 12. Result phải chỉ ra “tại sao sai”

Mỗi câu sai có:

> ❌ Your answer: C
> ✅ Correct answer: B

Sau đó:

**Why?**

Transcript

Vocabulary

Paraphrase

Explanation

Ví dụ:

> Audio nói “The meeting has been postponed.”
>
> Đáp án đúng dùng “delayed”.
>
> **postponed = delayed**

Như vậy người dùng hiểu **bẫy của đề**, chứ không chỉ biết đáp án.

---

# B. YÊU CẦU WEBSITE HỌC + ÔN TOEIC LC LÝ TƯỞNG

Đây mới là phần t nghĩ nên làm thật khác.

Mục tiêu không phải:

> “Cho người dùng càng nhiều bài càng tốt.”

Mà là:

> **Biến từng lỗi thành điểm số trong tương lai.**

---

# 13. Home / Dashboard

Sau khi đăng nhập:

> **Target: TOEIC 800**

> Listening
> **365 / 495**

> Current estimated score
> **690**

> Goal
> **800**

Sau đó hệ thống tự đề xuất:

### Today's Plan

**15 min – Part 2**

**20 min – Part 3**

**15 min – Vocabulary**

**10 min – Error Review**

Người dùng không phải tự suy nghĩ:

> “Hôm nay mình nên học gì?”

---

# 14. Hệ thống phải có Learning Path

Chia việc học thành:

### Level 1 — Foundation

- nghe từ khóa
- question words
- basic response
- common workplace vocabulary

### Level 2 — Intermediate

- paraphrase
- distractors
- longer conversations
- indirect answers

### Level 3 — Advanced

- inference
- implied meaning
- fast speech
- reduced pronunciation
- difficult distractors

### Level 4 — Exam Mastery

- full Part training
- mixed difficulty
- timed practice
- full mock tests

---

# 15. Mỗi câu nghe phải có nhiều chế độ luyện

Một câu không nên chỉ tồn tại dưới dạng:

> nghe → chọn A/B/C/D

Nó nên có:

### Mode 1 — Test

Nghe một lần và trả lời.

### Mode 2 — Listen Again

Replay.

### Mode 3 — Slow Listening

0.8x / 0.9x / 1.0x

### Mode 4 — Transcript

Xem transcript.

### Mode 5 — Vocabulary

Click vào từ.

### Mode 6 — Dictation

Nghe và điền từ.

### Mode 7 — Shadowing

Nghe → nói lại.

Như vậy một câu có thể biến thành một **learning object hoàn chỉnh**.

---

# 16. Transcript phải cực kỳ thông minh

Không nên chỉ hiện một đoạn text dài.

Transcript phải cho phép click từng từ/cụm:

> **postpone**

→ pronunciation
→ meaning
→ synonym
→ collocation
→ examples

Ví dụ:

> postpone **a meeting**
> postpone **an appointment**
> postpone **the delivery**

Điều này giúp học **cụm từ TOEIC**, không phải học từ đơn lẻ.

---

# 17. Phần Listening Breakdown

Sau khi sai câu:

Website phải trả lời:

> **Bạn sai vì lý do gì?**

Có thể chọn:

- Không nghe ra từ
- Nghe được nhưng không hiểu
- Không biết vocabulary
- Không hiểu paraphrase
- Bị distractor đánh lừa
- Không kịp đọc câu hỏi
- Không suy luận được
- Mất tập trung

Sau khoảng 100–200 câu, hệ thống tạo:

> ## Your Listening Diagnosis

Ví dụ:

**35% lỗi:** Vocabulary
**28%:** Paraphrase
**20%:** Inference
**10%:** Distractors
**7%:** Speed

Đây là phần cực kỳ giá trị.

---

# 18. Error Bank

Mọi câu sai tự động lưu vào:

> **MY MISTAKES**

Ví dụ:

**Part 3 – Inference**

Sai 2 lần

> Audio
> Transcript
> Explanation

Hệ thống tự đưa câu này quay lại ôn theo spaced repetition.

Ví dụ:

> Review after 1 day
> Review after 3 days
> Review after 7 days
> Review after 14 days

---

# 19. Adaptive Practice

Website phải tự điều chỉnh độ khó.

Ví dụ:

Người dùng đạt:

> Part 1 = 97%

→ giảm bài Part 1.

Người dùng đạt:

> Part 3 inference = 54%

→ tăng bài này.

Dashboard sẽ nói:

> **You should spend 63% of today's study time on Part 3.**

Tức là:

> **Không học theo số lượng. Học theo điểm yếu.**

---

# 20. Part 2 phải có hệ thống “Trap Training”

Đây là một module riêng.

Phân loại:

- WH-question
- Yes/No question
- Indirect question
- Negative question
- Choice question
- Statement
- Similar-sounding distractor
- Same-word distractor
- Wrong-context distractor

Ví dụ:

> “Where is the meeting?”

A. At three o'clock.
B. In Room 204. ✅
C. I attended it yesterday.

Website giải thích:

> A chứa thông tin thời gian nhưng câu hỏi hỏi **WHERE**.

Người học phải dần hình thành phản xạ:

> **Question type → expected answer type**

---

# 21. Part 3 & 4 nên dạy “prediction”

Trước khi audio chạy:

Website cho:

> Who are the speakers?

> What is the problem?

> What information should you listen for?

Người học dự đoán trước.

Sau đó mới nghe.

Đây là một kỹ năng riêng:

> **Predict → Listen → Confirm → Answer**

---

# 22. Vocabulary phải được lấy từ chính Listening

Không nên có một kho:

> 10,000 random TOEIC words.

Mà hệ thống lấy từ:

> câu người dùng vừa sai
> transcript họ vừa nghe
> chủ đề họ thường gặp

Ví dụ người dùng sai nhiều từ:

> shipment
> invoice
> delivery
> warehouse

Hệ thống tạo:

> **Your Weak Vocabulary: Logistics**

Sau đó tạo mini lesson.

---

# 23. AI Tutor

Mỗi câu có nút:

> **Ask AI**

Người dùng hỏi:

> “Tại sao B đúng?”

AI giải thích.

Hoặc:

> “Tại sao tôi luôn sai dạng này?”

AI dựa trên lịch sử lỗi.

Ví dụ:

> Bạn đã sai 8/15 câu inference trong Part 3.
>
> Lỗi phổ biến nhất của bạn là chọn thông tin được nói trực tiếp thay vì suy ra từ ngữ cảnh.

Đây sẽ là một tutor thực sự, thay vì chatbot hỏi đáp chung chung.

---

# 24. Mock Test + Learning phải kết nối với nhau

Đây là logic quan trọng nhất:

> **Mock Test**
>
> ↓
>
> phát hiện điểm yếu
>
> ↓
>
> tạo Learning Plan
>
> ↓
>
> Practice
>
> ↓
>
> Error Review
>
> ↓
>
> Mini Test
>
> ↓
>
> Mock Test mới
>
> ↓
>
> so sánh score

Website phải tạo thành **vòng lặp cải thiện điểm**.

---

# 25. Dashboard tiến bộ

Phải có:

> Score History

Ví dụ:

**620 → 645 → 670 → 690 → 715**

Và biểu đồ theo Part:

> Part 2: ↑
> Part 3: ↑↑
> Part 4: →

Ngoài ra:

> Accuracy
> Average response time
> Vocabulary retention
> Error frequency
> Question type performance

---

# 26. Tính năng “Score to Goal”

Ví dụ:

> Target: **800**

Current:

> **690**

Website phân tích:

> Bạn cần khoảng +110 điểm.

Sau đó:

> Potential improvement

**Part 2:** +15
**Part 3:** +35
**Part 4:** +25
**Vocabulary:** +20
**Speed:** +15

Và hệ thống biến nó thành:

> **Your 30-day Listening Plan**

---

# 27. Nguyên tắc UX

Website nên mang vibe:

**clean + focused + premium + academic**

Không nên:

- quá nhiều màu
- gamification trẻ con
- popup liên tục
- quảng cáo
- dashboard phức tạp
- quá nhiều nút

Màn hình phải luôn trả lời được 3 câu:

> **Tôi đang ở đâu?**
> **Tôi đang yếu ở đâu?**
> **Tiếp theo tôi phải làm gì?**

---

# 28. Tóm gọn thành PRODUCT REQUIREMENTS

### Website 1 — TOEIC LC Mock Test

**Core requirement:**

> Mô phỏng bài thi TOEIC Listening thực tế, với audio flow, format, timing và interaction gần giống kỳ thi thật nhất có thể.

Các module:

**Exam Engine**
**Audio Engine**
**Part 1–4**
**Timer / Progress**
**Scoring**
**Score Analysis**
**Question Review**
**Performance Analytics**

---

### Website 2 — TOEIC LC Learning Platform

**Core requirement:**

> Một hệ thống luyện Listening cá nhân hóa, sử dụng kết quả làm bài và lịch sử lỗi để tự động xác định điểm yếu, tạo lộ trình học, ôn lại lỗi và tăng dần độ khó nhằm tối đa hóa điểm TOEIC Listening.

Các module:

**Learning Path**
**Practice Engine**
**Transcript**
**Dictation**
**Shadowing**
**Vocabulary**
**Error Bank**
**Spaced Repetition**
**Adaptive Practice**
**AI Tutor**
**Progress Analytics**
**Mock Test**

---

## Cái quan trọng nhất

Nếu m đang **vibe sản phẩm**, thì đừng nghĩ:

> “Làm một web có 1.000 đề TOEIC LC.”

Hãy nghĩ:

> **“Tạo một hệ thống khiến một người từ 300 LC → 400 LC → 450 LC một cách có dữ liệu.”**

Và flow đẹp nhất sẽ là:

**Thi thử → Diagnosis → Personalized Plan → Practice → Fix Mistakes → Spaced Review → Mini Test → Thi thử lại → Score tăng**

Đó mới là cái lõi của một **website luyện TOEIC LC lý tưởng để đạt điểm cao**.
