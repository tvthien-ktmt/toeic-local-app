# Đặc tả chức năng nền tảng luyện TOEIC 2 kỹ năng

## 0. Phạm vi tài liệu

Tài liệu này tổng hợp các chức năng nên có ở một nền tảng luyện TOEIC Listening & Reading, đối chiếu theo những gì có thể xác minh công khai từ STUDY4 và cấu trúc TOEIC Listening & Reading của ETS.

Mục tiêu của tài liệu là làm cơ sở đặc tả chức năng cho một website luyện TOEIC, tập trung vào:

- Học kiến thức nền tảng.
- Luyện từng Part 1–7.
- Luyện theo dạng câu hỏi và chủ đề.
- Thi thử TOEIC 2 kỹ năng như một bài thi hoàn chỉnh.
- Chữa bài và phân tích lỗi.
- Theo dõi tiến bộ và điểm mục tiêu.
- Tạo ngân hàng câu hỏi, đề thi, bài học, từ vựng và giải thích.
- Thiết kế giao diện làm bài đủ chi tiết để đội frontend/backend có thể triển khai.

> **Lưu ý về BYTOEIC:** trong quá trình kiểm chứng web, không thu thập được một nguồn công khai đủ tin cậy để xác minh đầy đủ danh sách tính năng của nền tảng mà người dùng gọi là “.byetoiec / BYTOEIC”. Vì vậy, phần BYTOEIC trong tài liệu được xử lý theo hướng **không khẳng định tính năng chưa xác minh**. Các chức năng được đánh dấu “nên có” là đặc tả sản phẩm đề xuất, không phải tuyên bố rằng BYTOEIC hiện đang cung cấp chức năng đó.

---

# 1. Nền tảng tham chiếu và các đặc điểm đã xác minh

## 1.1. STUDY4

STUDY4 công khai mô tả một nền tảng luyện thi có:

- Thư viện đề thi online.
- Đề TOEIC bám format thi thật.
- Luyện từng Part và luyện full test.
- Khóa học gồm từ vựng, ngữ pháp, chiến lược làm bài và luyện nghe.
- Flashcards dùng spaced repetition.
- Bài tập từ vựng dạng trắc nghiệm, tìm cặp, nghe điền từ, chính tả.
- Công cụ nghe–chép chính tả với chế độ chép cả câu hoặc điền từ khóa.
- Từ điển tra từ trực tiếp trong bài học.
- Tạo flashcard từ nội dung được highlight.
- Luyện Part 5, Part 6, Part 7 theo dạng trắc nghiệm.
- Bài đọc có thể kèm phần dịch và giải thích đáp án.
- Mock Test và kết quả sau khi nộp bài.
- Thống kê tiến độ, điểm số và các dạng bài thường sai.
- Lộ trình học theo mục tiêu điểm.

Các điểm trên được đối chiếu từ các trang chính thức của STUDY4 về trang chủ, thư viện đề, khóa Complete TOEIC, flashcards và hướng dẫn học.

## 1.2. TOEIC Listening & Reading theo ETS

Bài thi TOEIC Listening & Reading hiện được ETS mô tả gồm:

- Listening: 100 câu, 45 phút.
- Reading: 100 câu, 75 phút.
- Tổng 200 câu.
- Listening gồm Part 1–4.
- Reading gồm Part 5–7.
- Bài thi chính thức là multiple-choice.
- Listening: Photographs, Question–Response, Conversations, Talks.
- Reading: Incomplete Sentences, Text Completion, Reading Comprehension.

Với đặc tả giao diện thi online, nên mô phỏng đúng **logic hai section có thời gian riêng**, đồng thời cho phép Reading làm câu theo tốc độ của thí sinh.

---

# 2. Bản đồ chức năng tổng thể của website

Một nền tảng luyện TOEIC hoàn chỉnh nên được chia thành các nhóm:

1. Website public.
2. Tài khoản và hồ sơ.
3. Dashboard cá nhân.
4. Khóa học.
5. Lộ trình học.
6. Từ vựng.
7. Ngữ pháp.
8. Luyện Listening.
9. Luyện Reading.
10. Ngân hàng câu hỏi.
11. Thư viện đề thi.
12. Thi thử full TOEIC.
13. Chữa bài.
14. Phân tích điểm.
15. Theo dõi lỗi sai.
16. Flashcards cá nhân.
17. Highlight.
18. Notes / ghi chú.
19. Từ điển trong bài.
20. Lịch sử luyện tập.
21. Target score.
22. Lộ trình cá nhân hóa.
23. Gamification ở mức tùy chọn.
24. Notification.
25. Subscription / khóa học trả phí nếu sản phẩm có thương mại hóa.
26. Admin CMS.
27. Question Bank Admin.
28. Test Builder.
29. Analytics Admin.
30. Audit / logging.

---

# 3. Module 1 — Website Public

## 3.1. Trang chủ

### Thành phần

- Header.
- Logo.
- Menu chính.
- Nút đăng nhập.
- Nút đăng ký.
- Nút vào luyện tập.
- Nút xem đề thi.
- Khu vực giới thiệu TOEIC.
- Khu vực lợi ích.
- Khu vực cấu trúc bài thi.
- Khu vực đề thi phổ biến.
- Khu vực khóa học.
- Khu vực flashcards.
- Khu vực thống kê.
- Review người học nếu sản phẩm có.
- FAQ.
- Footer.

### Header

- Logo click về Home.
- Menu “Đề thi online”.
- Menu “Luyện tập”.
- Menu “Từ vựng”.
- Menu “Ngữ pháp”.
- Menu “Lộ trình”.
- Menu “Khóa học”.
- Search global.
- Login.
- Register.
- Responsive hamburger trên mobile.

### Search global

Cho phép tìm:

- Tên đề.
- Tên sách.
- Part.
- Chủ đề.
- Dạng câu hỏi.
- Từ vựng.
- Ngữ pháp.
- Bài học.

Các thao tác nhỏ:

- Gõ keyword.
- Debounce khi search.
- Gợi ý realtime.
- Hiển thị loại kết quả.
- Hiển thị số lượng kết quả.
- Enter để xem trang kết quả.
- Clear keyword.
- Search lịch sử.

---

# 4. Module 2 — Tài khoản người dùng

## 4.1. Đăng ký

- Email.
- Password.
- Confirm password.
- Username nếu sản phẩm cần.
- Target score.
- Trình độ hiện tại.
- Thời gian dự kiến thi.
- Mục tiêu thi.
- Đồng ý điều khoản.
- Captcha/risk control nếu cần.
- Email verification.

## 4.2. Đăng nhập

- Email/username.
- Password.
- Remember session.
- Show/hide password.
- Forgot password.
- Login error.
- Lock/rate limit khi thử sai quá nhiều lần.

## 4.3. Quên mật khẩu

- Nhập email.
- Gửi reset link.
- Token có hạn sử dụng.
- Nhập password mới.
- Confirm password.
- Logout các session cũ nếu policy yêu cầu.

## 4.4. Hồ sơ

- Avatar.
- Tên.
- Email.
- Trình độ.
- Target Listening.
- Target Reading.
- Target tổng.
- Ngày dự kiến thi.
- Mục tiêu theo tuần.
- Thời gian học mỗi ngày.

## 4.5. Cài đặt

- Theme sáng/tối.
- Ngôn ngữ giao diện.
- Font size.
- Audio autoplay.
- Playback speed mặc định.
- Hiển thị dịch mặc định.
- Hiển thị transcript mặc định.
- Sound effect.
- Notification.
- Privacy.
- Session/device management.

---

# 5. Module 3 — Dashboard cá nhân

Dashboard cần trả lời ngay 6 câu hỏi:

1. Tôi đang ở mức nào?
2. Target của tôi là bao nhiêu?
3. Tôi đã học được bao nhiêu?
4. Tôi yếu Part nào?
5. Tôi đang sai dạng nào?
6. Hôm nay tôi phải học gì?

## 5.1. KPI cards

- Tổng số đề đã làm.
- Tổng số câu đã làm.
- Tổng thời gian học.
- Listening accuracy.
- Reading accuracy.
- Điểm ước lượng gần nhất.
- Điểm cao nhất.
- Target score.
- Khoảng cách tới target.
- Số ngày học liên tục.
- Số bài hôm nay.

## 5.2. Biểu đồ

- Điểm theo thời gian.
- Accuracy theo thời gian.
- Listening vs Reading.
- Accuracy từng Part.
- Thời gian trung bình/câu.
- Số câu đã làm mỗi ngày.
- Dạng câu sai nhiều nhất.
- Chủ đề ngữ pháp yếu.
- Vocabulary mastery.

## 5.3. Danh sách hành động nhanh

- Tiếp tục bài đang học.
- Làm đề gần nhất.
- Ôn câu sai.
- Ôn flashcards hôm nay.
- Luyện Part yếu nhất.
- Làm mini test.

---

# 6. Module 4 — Thư viện đề thi

Đây là một trong các module quan trọng nhất.

STUDY4 có trang thư viện đề TOEIC hiển thị tên đề, thời lượng, lượng người làm, số Part và số câu; cho phép tìm theo keyword.

## 6.1. Bộ lọc

- TOEIC.
- Full Test.
- Listening.
- Reading.
- Part 1.
- Part 2.
- Part 3.
- Part 4.
- Part 5.
- Part 6.
- Part 7.
- Sách.
- Bộ đề.
- Official/Mock nếu dữ liệu có phân loại.
- Difficulty.
- Mới nhất.
- Phổ biến nhất.
- Điểm thấp nhất/phù hợp target.

## 6.2. Search

- Search theo tên sách.
- Search theo test number.
- Search theo Part.
- Search theo dạng câu hỏi.
- Search theo keyword.
- Search gần đúng.
- No result state.

## 6.3. Test card

Mỗi card nên có:

- Tên đề.
- Bộ đề.
- Test number.
- Full test / sectional.
- 7 Part hoặc Part cụ thể.
- Tổng số câu.
- Thời lượng.
- Số người đã làm.
- Rating nếu có.
- Difficulty.
- Trạng thái người dùng: chưa làm / đang làm / đã hoàn thành.
- Điểm gần nhất.
- Nút bắt đầu.
- Nút xem chi tiết.
- Nút làm lại.

## 6.4. Trang chi tiết đề

- Tên đề.
- Metadata.
- Cấu trúc Part.
- Số câu từng Part.
- Thời lượng.
- Mô tả.
- Mục tiêu.
- Difficulty.
- Số lượt làm.
- Lịch sử của người dùng với đề đó.
- Best score.
- Last score.
- Nút bắt đầu full test.
- Nút luyện theo Part.

---

# 7. Module 5 — Luyện Listening

## 7.1. Part 1 — Photographs

Mỗi câu gồm:

- Ảnh.
- 4 đáp án audio/text tùy chế độ.
- Audio câu hỏi/đáp án theo dữ liệu.
- Nút play.
- Nút pause nếu mode luyện tập cho phép.
- Progress audio.
- Playback speed.
- Question number.
- Answer state.
- Mark question.
- Submit.
- Explanation sau khi chữa.

### Chế độ luyện

- Practice.
- Timed practice.
- Exam mode.
- Review mode.
- Dictation mode nếu nội dung có transcript.

## 7.2. Part 2 — Question–Response

Mỗi câu:

- Audio câu hỏi.
- 3 phương án A/B/C.
- Phát lại audio ở practice mode nếu policy sản phẩm cho phép.
- Chọn đáp án.
- Đánh dấu chưa chắc.
- Xem transcript sau khi nộp.
- Xem giải thích.

## 7.3. Part 3 — Conversations

### Layout

- Audio conversation.
- Nhóm câu hỏi dùng chung một đoạn audio.
- 3 câu hỏi cho một conversation theo cấu trúc đề hiện hành.
- Mỗi câu có 4 lựa chọn.
- Có thể hiển thị question numbers trong nhóm.
- Highlight keyword trong practice review.
- Transcript chỉ mở ở review/practice nếu thiết kế cho phép.

### Loại câu hỏi cần phân loại dữ liệu

- Main idea.
- Detail.
- Purpose.
- Location.
- Time.
- Next action.
- Inference.
- Graphic interpretation.

## 7.4. Part 4 — Talks

UI tương tự Part 3 nhưng audio là monologue/talk.

Có thể phân loại:

- Announcement.
- Advertisement.
- Voicemail.
- Speech.
- Broadcast.
- Report.
- Instructions.

---

# 8. Module 6 — Luyện Reading

## 8.1. Part 5 — Incomplete Sentences

### Màn hình

- Question number.
- Câu chưa hoàn chỉnh.
- 4 đáp án A/B/C/D.
- Chọn đáp án.
- Mark.
- Navigation previous/next.
- Question palette.
- Submit.

### Taxonomy tối thiểu

- Vocabulary.
- Part of speech.
- Verb tense.
- Verb form.
- Subject–verb agreement.
- Pronoun.
- Relative pronoun.
- Preposition.
- Conjunction.
- Adverb.
- Adjective.
- Comparison.
- Conditional.
- Gerund.
- Infinitive.
- Participle.
- Word form.
- Collocation.
- Contextual vocabulary.

## 8.2. Part 6 — Text Completion

Màn hình cần hỗ trợ:

- Hiển thị toàn đoạn.
- Các chỗ trống được đánh số.
- 4 đáp án cho từng blank.
- Navigation giữa các blank.
- Không reset đáp án khi chuyển blank.
- Đánh dấu câu chưa chắc.
- Review toàn đoạn.

Taxonomy:

- Vocabulary.
- Grammar.
- Sentence connection.
- Transitional word.
- Contextual sentence.
- Logical coherence.
- Reference.

## 8.3. Part 7 — Reading Comprehension

### Single passage

- 1 đoạn văn.
- Câu hỏi phía dưới hoặc side-by-side.
- 4 đáp án.
- Question navigator.
- Mark question.
- Highlight.
- Note.
- Dictionary.

### Double passage

- Passage A.
- Passage B.
- Scroll đồng bộ hoặc independent.
- Question panel.
- Cross-reference giữa các đoạn.

### Triple passage

- Passage A/B/C.
- Scroll độc lập.
- Question panel.
- Cross-document reference.

### Taxonomy

- Main idea.
- Detail.
- NOT/TRUE.
- Purpose.
- Inference.
- Vocabulary in context.
- Reference.
- Location.
- Date/time.
- Next action.
- Who.
- Why.
- Where.
- Cross-passage relationship.
- Information connection.
- Graphic interpretation.

---

# 9. Module 7 — Flashcards

STUDY4 công khai tính năng flashcards và cho phép tạo flashcard từ highlights.

## 9.1. Flashcard system

Mỗi thẻ có thể gồm:

- English word.
- IPA.
- Part of speech.
- Audio.
- Meaning English.
- Meaning Vietnamese.
- Image.
- Example sentence.
- Translation.
- User note.
- Source.
- Tags.

## 9.2. Hành vi học

- Show front.
- Reveal back.
- Again.
- Hard.
- Good.
- Easy.
- Known.
- Remove from review.
- Add to deck.
- Favorite.
- Edit.
- Delete.

## 9.3. Spaced repetition

Hệ thống nên lưu:

- Last reviewed.
- Next review.
- Review count.
- Ease/difficulty.
- Current interval.
- Mastery state.
- Wrong count.
- Correct streak.

---

# 10. Module 8 — Từ vựng

## 10.1. Danh sách từ

- TOEIC vocabulary.
- Business vocabulary.
- Topic vocabulary.
- User-created list.
- Words from tests.
- Words from highlights.

## 10.2. Học từ

STUDY4 mô tả 6 dạng bài luyện từ vựng trong khóa Complete TOEIC:

1. Flashcards.
2. Vocabulary multiple-choice.
3. Matching.
4. Listening vocabulary.
5. Translation/fill in the blank.
6. Dictation.

## 10.3. Chi tiết từng dạng

### Flashcards

- Front/back.
- Audio.
- IPA.
- Meaning.
- Example.
- Difficulty classification.

### Multiple choice

- Chọn nghĩa.
- Chọn từ đúng.
- Chọn cách dùng.

### Matching

- Từ ↔ nghĩa.
- Từ ↔ hình.
- Từ ↔ example.

### Listening vocabulary

- Nghe từ.
- Chọn từ đúng.
- Chọn nghĩa.

### Fill in the blank

- Nghe/đọc context.
- Điền đáp án.
- Kiểm tra.

### Dictation

- Nghe audio.
- Nhập lại từ/cụm.
- So khớp chính tả.
- Hiển thị lỗi khác nhau.

---

# 11. Module 9 — Ngữ pháp

Nên chia thành:

- Lesson.
- Theory.
- Example.
- Practice.
- Error review.
- Mixed practice.

Mỗi chủ đề:

- Mục tiêu học.
- Lý thuyết.
- Công thức.
- Ví dụ.
- Dấu hiệu nhận biết.
- Bẫy thường gặp.
- Mini quiz.
- Câu TOEIC thật/mô phỏng.
- Giải thích từng đáp án.

Các nhóm quan trọng:

- Tenses.
- Parts of speech.
- Nouns.
- Verbs.
- Adjectives.
- Adverbs.
- Pronouns.
- Prepositions.
- Conjunctions.
- Relative clauses.
- Conditionals.
- Comparisons.
- Gerunds.
- Infinitives.
- Participles.
- Passive voice.
- Subject–verb agreement.
- Word forms.
- Sentence structure.

---

# 12. Module 10 — Dictation / Nghe chép chính tả

STUDY4 công khai công cụ nghe–viết chính tả với hai chế độ chính:

- Chép cả câu.
- Điền từ khóa.

## 12.1. Màn hình

- Audio player.
- Play.
- Pause.
- Replay.
- Playback speed.
- Text input.
- Check answer.
- Show transcript.
- Compare.
- Highlight error.
- Next sentence.

## 12.2. Chế độ chép cả câu

- Nghe toàn câu.
- Nhập toàn bộ câu.
- Check.
- So sánh expected vs actual.
- Xác định từ thiếu.
- Xác định từ sai.
- Xác định spelling error.
- Hiển thị score.

## 12.3. Chế độ điền từ khóa

- Audio.
- Sentence skeleton.
- Missing keywords.
- Nhập từng blank.
- Chấm từng blank.
- Tổng accuracy.

---

# 13. Module 11 — Từ điển trong bài

## 13.1. Trigger

Người dùng:

- Bôi đen text.
- Click từ.
- Double click.
- Chạm trên mobile.

## 13.2. Dictionary panel

- Word.
- IPA.
- Pronunciation audio.
- Part of speech.
- English meaning.
- Vietnamese meaning.
- Example.
- Collocation.
- Synonym.
- Antonym.

## 13.3. Quick actions

- Add flashcard.
- Add to word list.
- Copy.
- Highlight.
- Add note.
- Close.

---

# 14. Module 12 — Highlight

STUDY4 công khai cho phép highlight nội dung và lưu highlight để tham khảo.

Tính năng nhỏ:

- Select text.
- Highlight.
- Change highlight/remove highlight.
- Persist highlight.
- Show all highlights.
- Filter by source.
- Create flashcard from highlight.
- Add note to highlight.
- Jump back to original source.

---

# 15. Module 13 — Notes / Ghi chú

Mỗi note:

- Content.
- Source type.
- Source id.
- Question id.
- Passage id nếu có.
- Timestamp.
- Created at.
- Updated at.
- Tags.

Các thao tác:

- Add note.
- Edit.
- Delete.
- Search.
- Filter.
- Jump to source.

---

# 16. Module 14 — Chế độ luyện câu hỏi

Cần tách rõ 4 mode.

## 16.1. Practice mode

Mục tiêu: học.

Có thể:

- Xem đáp án ngay.
- Xem explanation ngay.
- Xem transcript.
- Xem translation.
- Tra từ.
- Highlight.
- Note.
- Không áp lực thời gian hoặc có timer tùy bài.

## 16.2. Timed practice

Mục tiêu: luyện tốc độ.

- Countdown.
- Question timing.
- Average time/question.
- Warning khi còn ít thời gian.
- Auto submit khi hết giờ.

## 16.3. Exam mode

Mục tiêu: mô phỏng thi.

- Không explanation trong khi làm.
- Không xem transcript trong Listening.
- Timer cố định.
- Mark question.
- Question palette.
- Submit.
- Auto submit khi hết giờ.

## 16.4. Review mode

Mục tiêu: chữa.

- Correct/incorrect.
- User answer.
- Correct answer.
- Explanation.
- Transcript.
- Translation.
- Tags.
- Vocabulary.
- Grammar topic.
- Similar questions.

---

# 17. Module 15 — Câu hỏi và question bank

Đây là module cần thiết nếu xây sản phẩm lớn.

## 17.1. Metadata câu hỏi

- Question ID.
- Question type.
- Skill.
- Part.
- Subtype.
- Difficulty.
- Topic.
- Grammar topic.
- Vocabulary topic.
- Passage ID.
- Audio ID.
- Image ID.
- Correct answer.
- Distractors.
- Explanation.
- Translation.
- Transcript.
- Source.
- Status.

## 17.2. Versioning

- Draft.
- Review.
- Approved.
- Published.
- Archived.
- Revision history.

## 17.3. Quality control

- Duplicate detection.
- Answer validation.
- Audio validation.
- Image validation.
- Missing explanation validation.
- Missing transcript validation.
- Broken media validation.

---

# 18. Module 16 — Thi TOEIC 2 kỹ năng

Đây là phần cần thiết kế gần giống một bài thi thật.

## 18.1. Cấu trúc

### Section I — Listening

- 100 câu.
- 45 phút.
- Part 1–4.

### Section II — Reading

- 100 câu.
- 75 phút.
- Part 5–7.

ETS xác nhận cấu trúc 100 câu Listening + 100 câu Reading, với 45 phút Listening và 75 phút Reading.

---

# 19. Giao diện thi TOEIC 2 kỹ năng — Desktop

## 19.1. Layout tổng thể

Nên chia màn hình thành 4 vùng:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER: TOEIC TEST   Part/Section     Timer          Submit / End    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    MAIN QUESTION AREA                               │
│                                                                      │
│   [Image / Passage / Audio / Question]                               │
│                                                                      │
│   A. Answer A                                                        │
│   B. Answer B                                                        │
│   C. Answer C                                                        │
│   D. Answer D                                                        │
│                                                                      │
├──────────────────────────────────────┬───────────────────────────────┤
│ Previous / Next / Mark / Tools       │ Question Palette              │
│                                      │ 1 2 3 4 5 6 7 8 9 ...          │
│                                      │ status by color/state         │
└──────────────────────────────────────┴───────────────────────────────┘
```

---

# 20. Header của màn hình thi

Header không nên quá nhiều thông tin.

## Thành phần

- Logo nhỏ.
- Tên bài thi.
- Section hiện tại.
- Part hiện tại.
- Question number.
- Timer.
- Nút âm lượng/audio nếu phù hợp.
- Nút submit/end.

## Timer

Phải có:

- MM:SS.
- Countdown.
- Warning state.
- Near-zero state.
- Auto-submit.

Không nên để timer quá nhỏ hoặc chìm vào background.

---

# 21. Question area — Listening

## Part 1

```text
┌──────────────────────────────────────────────┐
│ Question 1                                   │
│                                              │
│              [ PHOTO ]                       │
│                                              │
│ ○ A. [Audio option / text]                   │
│ ○ B. [Audio option / text]                   │
│ ○ C. [Audio option / text]                   │
│ ○ D. [Audio option / text]                   │
└──────────────────────────────────────────────┘
```

Trong exam mode, câu trả lời có thể hiển thị theo đúng hình thức dữ liệu của đề mô phỏng; không hiển thị transcript trước khi nộp.

## Part 2

```text
Question 12

[ AUDIO PLAYER / recorded prompt ]

○ A. Response A
○ B. Response B
○ C. Response C
```

## Part 3/4

```text
┌───────────────────────────────┐
│ Audio player                  │
│ ▶  ━━━━━━━━━━━━  00:00        │
└───────────────────────────────┘

Question 50
Question text

○ A
○ B
○ C
○ D
```

Các câu dùng chung một audio phải được liên kết thành một group.

---

# 22. Question area — Reading

Reading nên tối ưu cho việc đọc nhiều văn bản.

## Part 5

Một cột rộng, tập trung vào câu hỏi.

```text
Question 102

The manager ______ the report before noon.

○ A. review
○ B. reviews
○ C. reviewing
○ D. reviewed
```

## Part 6

Nên hiển thị:

```text
┌─────────────────────────────────────────┐
│ Passage                                  │
│                                          │
│ ... sentence ... [102] ...              │
│                                          │
│ A. ...                                   │
│ B. ...                                   │
│ C. ...                                   │
│ D. ...                                   │
└─────────────────────────────────────────┘
```

## Part 7

Đối với passage dài, UI tốt nhất là:

```text
┌───────────────────────────┬──────────────────────────────┐
│ PASSAGE                   │ QUESTIONS                   │
│                           │                              │
│ Email / article / notice  │ Q 147                        │
│                           │ ○ A                          │
│ ...                       │ ○ B                          │
│ ...                       │ ○ C                          │
│ ...                       │ ○ D                          │
│                           │                              │
└───────────────────────────┴──────────────────────────────┘
```

Không để passage biến mất khi người dùng đổi câu hỏi trong cùng một set.

---

# 23. Question palette

Đây là thành phần bắt buộc cho trải nghiệm thi full test.

## Trạng thái mỗi câu

- Chưa làm.
- Đã chọn đáp án.
- Đánh dấu review.
- Câu hiện tại.
- Có thể thêm trạng thái answered + marked.

Ví dụ logic:

```text
1  2  3  4  5  6  7  8  9 10
●  ●  ○  ◐  ●  ○  ○  ◐  ●  ○
```

Quy tắc màu/trạng thái phải có legend rõ ràng để người dùng hiểu.

## Filter palette

Nên có:

- All.
- Unanswered.
- Answered.
- Marked.

Có thể thêm:

- Wrong after review.
- Slow questions.

Nhưng các filter phân tích không nên xuất hiện trong exam mode nếu làm rối giao diện.

---

# 24. Thanh điều hướng câu hỏi

Các nút:

- Previous.
- Next.
- Mark for review.
- Clear answer.
- Jump to question.

Trong Reading có thể cho phép chuyển câu tự do.

Trong Listening mô phỏng nghiêm túc, logic chuyển câu phải phụ thuộc chế độ mô phỏng. Nếu muốn bám sát trải nghiệm thi thật, không nên đưa các control làm thay đổi logic phát audio của bài Listening.

---

# 25. Modal trước khi bắt đầu thi

Trước khi bắt đầu phải có trang xác nhận:

- Tên đề.
- Số câu.
- Listening 45 phút.
- Reading 75 phút.
- Tổng 200 câu.
- Chế độ thi.
- Warning về auto-submit.
- Warning về không xem đáp án trong khi thi.
- Nút Start Test.
- Nút Cancel.

Checkbox:

- “Tôi đã đọc hướng dẫn”.

---

# 26. Chuyển Section Listening → Reading

Khi Listening kết thúc:

- Hiển thị section completed.
- Xác nhận số câu đã trả lời.
- Xác nhận số câu bỏ trống.
- Chuyển Reading.

Trong full simulation nên đảm bảo:

- Reset timer cho Reading.
- Bắt đầu countdown 75 phút.
- Không mất dữ liệu Listening.
- Không cho phép thay đổi đáp án Listening sau khi section đã khóa nếu mode mô phỏng yêu cầu section-lock.

---

# 27. Giao diện thi Reading — chi tiết

## 27.1. Sticky header

Khi scroll passage dài:

- Timer vẫn nhìn thấy.
- Section vẫn nhìn thấy.
- Current question vẫn hiển thị.

## 27.2. Sticky question navigation

Có thể đặt palette ở:

- Right sidebar.
- Bottom drawer.
- Floating button trên mobile.

## 27.3. Passage interaction

- Scroll.
- Zoom text.
- Highlight nếu exam mode cho phép sản phẩm.
- Không cho dịch tự động trong exam mode nếu muốn giữ tính chất thi thật.

---

# 28. Giao diện mobile

Không nên bê nguyên layout desktop xuống mobile.

## 28.1. Header

```text
┌──────────────────────────────┐
│ Part 7        48:23    ☰    │
└──────────────────────────────┘
```

## 28.2. Question

Full width.

## 28.3. Answer options

Button/card lớn, dễ chạm.

## 28.4. Palette

Mở bằng bottom sheet:

```text
┌──────────────────────────────┐
│ Question navigation          │
│ 1 2 3 4 5 6 7 8 9 10        │
│ 11 12 13 14 15 ...           │
└──────────────────────────────┘
```

## 28.5. Passage

- Passage chiếm full width.
- Questions ở phía dưới.
- Nút jump question.
- Giảm khoảng trắng không cần thiết.

---

# 29. Accessibility cho giao diện thi

Phải có:

- Keyboard navigation.
- Tab order rõ ràng.
- Enter/Space để chọn.
- Focus state rõ.
- Không chỉ dùng màu để biểu diễn trạng thái.
- Screen reader labels.
- Contrast đủ cao.
- Font scaling hợp lý.
- Error state rõ ràng.

---

# 30. Kết quả sau khi nộp bài

Đây là màn hình có giá trị học tập lớn nhất sau test.

## 30.1. Summary

- Estimated total score.
- Listening score.
- Reading score.
- Total correct.
- Total wrong.
- Total unanswered.
- Accuracy.
- Time used.
- Average time/question.
- Completion state.

## 30.2. So với target

```text
Target:      700
Latest:      642
Difference:  -58
```

Có thể tách:

- Listening gap.
- Reading gap.

---

# 31. Phân tích kết quả theo Part

Ví dụ:

| Part | Correct | Wrong | Accuracy | Avg time | Assessment |
|---|---:|---:|---:|---:|---|
| 1 | 5/6 | 1 | 83% | 18s | Tốt |
| 2 | 19/25 | 6 | 76% | 17s | Khá |
| 3 | 26/39 | 13 | 67% | 39s | Cần luyện |
| 4 | 21/30 | 9 | 70% | 42s | Cần luyện |
| 5 | 24/30 | 6 | 80% | 31s | Tốt |
| 6 | 11/16 | 5 | 69% | 43s | Cần luyện |
| 7 | 35/54 | 19 | 65% | 61s | Yếu |

Lưu ý: số điểm minh họa ở trên chỉ là ví dụ UI, không phải điểm của người dùng.

---

# 32. Phân tích theo dạng câu hỏi

Ví dụ:

- Main idea: 74%.
- Detail: 81%.
- Inference: 52%.
- Vocabulary in context: 63%.
- Purpose: 68%.
- Grammar: 77%.
- Word form: 54%.
- Preposition: 60%.

Mục tiêu là trả lời:

> Không chỉ biết người học sai Part 7, mà phải biết sai loại câu nào trong Part 7.

---

# 33. Trang chữa từng câu

Mỗi câu cần có cấu trúc:

```text
Question 153

[PASSAGE / AUDIO / IMAGE]

User answer: B
Correct answer: D

Result: Incorrect

Explanation:
...

Why A is wrong:
...

Why B is wrong:
...

Why C is wrong:
...

Why D is correct:
...

Vocabulary:
...

Grammar:
...

[Add Flashcard]
[Add Note]
[Highlight]
[Practice Similar Questions]
```

---

# 34. Chế độ review lỗi sai

Người dùng có thể mở:

- Chỉ câu sai.
- Chỉ câu bỏ trống.
- Chỉ câu marked.
- Chỉ Part 5.
- Chỉ vocabulary questions.
- Chỉ grammar questions.
- Chỉ inference questions.

Các button:

- Review all.
- Practice again.
- Add to flashcards.
- Add to error notebook.

---

# 35. Error Notebook — Sổ lỗi sai

Mỗi error record nên lưu:

- Question ID.
- User answer.
- Correct answer.
- Error category.
- Reason.
- User note.
- Number of times wrong.
- Last wrong time.
- Number of retries.
- Current mastery.

Có thể phân loại:

- Vocabulary gap.
- Grammar gap.
- Reading comprehension gap.
- Listening recognition gap.
- Distractor trap.
- Time management.
- Careless mistake.

---

# 36. Lịch sử luyện tập

Mỗi activity:

- Activity type.
- Test/lesson name.
- Start time.
- End time.
- Duration.
- Score.
- Accuracy.
- Completed percentage.
- Part.
- Device.

Filter:

- Today.
- This week.
- This month.
- Custom range.

---

# 37. Thống kê tiến độ

## 37.1. Theo ngày

- Questions/day.
- Minutes/day.
- Accuracy/day.
- Score/day.

## 37.2. Theo tuần

- Weekly score.
- Weekly hours.
- Parts practiced.
- Mistakes.

## 37.3. Theo Part

- Attempt count.
- Accuracy.
- Average time.
- Improvement.

## 37.4. Theo topic

- Grammar topic.
- Vocabulary topic.
- Question type.

STUDY4 công khai rằng quá trình luyện thi có thể được thống kê theo ngày và theo dạng câu hỏi, vì vậy đây nên được xem là chức năng cốt lõi chứ không phải phần phụ.

---

# 38. Lộ trình học cá nhân hóa

## Input

- Current estimated score.
- Target score.
- Exam date.
- Daily study time.
- Listening level.
- Reading level.
- Weak parts.

## Engine

Ví dụ logic:

```text
Current score
      ↓
Gap analysis
      ↓
Weakness ranking
      ↓
Part allocation
      ↓
Daily task generation
      ↓
Practice
      ↓
Measure
      ↓
Recalculate roadmap
```

## Daily plan

Mỗi ngày có thể gồm:

- Vocabulary review.
- Grammar lesson.
- Listening drill.
- Reading drill.
- Error review.
- Mini test.

---

# 39. Mini Test

Một mini test không nhất thiết 200 câu.

Các dạng:

- 10 câu.
- 20 câu.
- 30 câu.
- Part-specific.
- Mixed skill.
- Weakness-based.

Ví dụ:

```text
Mini Test — Part 5
20 questions
Target: 80%+
Time: 10 minutes
```

---

# 40. Adaptive Practice

Đây là tính năng nên có khi sản phẩm phát triển cao hơn.

Ví dụ:

- Người dùng đúng > 85% một topic → tăng difficulty.
- Người dùng sai liên tục → trả về câu dễ hơn.
- Sai 3 lần cùng dạng → đề xuất lesson.
- Tốc độ chậm nhưng accuracy cao → bài timed practice.
- Accuracy thấp → practice mode + explanation.

---

# 41. Recommendation Engine

Dashboard có thể sinh:

```text
Bạn đang yếu:
1. Part 7 — Inference
2. Part 3 — Detail
3. Part 5 — Word Form

Bài luyện đề xuất hôm nay:
- 10 câu Part 7 Inference
- 10 câu Part 5 Word Form
- 1 Conversation Part 3 + transcript review
```

---

# 42. Đề xuất tính năng nhỏ nhưng rất có giá trị

## 42.1. Resume test

Nếu người dùng thoát giữa bài:

- Save answer.
- Save timer.
- Save current question.
- Resume.
- Expiry nếu test có thời hạn.

## 42.2. Auto-save

Sau mỗi thay đổi đáp án:

- Persist local state.
- Persist server state.
- Debounce request.

## 42.3. Network recovery

Khi mất mạng:

- Hiển thị offline.
- Không mất câu trả lời đã chọn.
- Retry sync.
- Resolve conflict.

## 42.4. Duplicate submit prevention

- Disable submit sau click.
- Idempotency key.
- Server-side validation.

## 42.5. Session restore

- Browser refresh.
- Reconnect.
- Resume test state.

---

# 43. Âm thanh — các control nhỏ nhất

Listening practice nên có:

- Play.
- Pause.
- Replay.
- Seek trong practice mode.
- Volume.
- Mute.
- Playback speed.
- Loading indicator.
- Audio buffering state.
- Audio failed state.
- Retry audio.

Trong exam mode cần tách rõ control nào được phép và control nào bị khóa để tránh làm sai tính chất mô phỏng.

---

# 44. Media management

Audio cần metadata:

- Audio ID.
- Duration.
- File type.
- Bitrate.
- Speaker count.
- Transcript.
- Segment timings nếu có.

Image:

- Image ID.
- Width.
- Height.
- Alt text.
- Source.
- Compression.

---

# 45. Search và filter nâng cao

Search question bank:

- ID.
- Keyword.
- Part.
- Topic.
- Difficulty.
- Correct answer.
- Source.
- Date created.
- Status.

Filter:

- Easy.
- Medium.
- Hard.
- Very hard.
- Unanswered.
- Frequently wrong.
- Recently added.
- Popular.

---

# 46. Social / community — tùy chọn

Không phải chức năng lõi, nhưng có thể thêm:

- Rank.
- Weekly leaderboard.
- Achievement.
- Study streak.
- Challenge.
- Public test score.
- Share result.

Không nên để gamification lấn át mục tiêu học tập.

---

# 47. Notification

Các notification có thể gồm:

- Đã đến giờ ôn flashcard.
- Hoàn thành daily goal.
- Chuỗi học sắp bị mất.
- Có đề mới.
- Có lesson mới.
- Target score reminder.
- Exam date reminder.

---

# 48. Admin — quản lý người dùng

- User list.
- Search.
- Filter.
- User detail.
- Status.
- Subscription.
- Activity.
- Score history.
- Login history.
- Device history.
- Ban/unban.
- Reset password flow.
- Impersonation chỉ khi policy và security cho phép.

---

# 49. Admin — quản lý câu hỏi

- Create.
- Edit.
- Preview.
- Duplicate.
- Archive.
- Publish.
- Bulk import.
- Bulk edit.
- Tag.
- Attach audio.
- Attach image.
- Attach passage.
- Add explanation.
- Add translation.
- Add transcript.
- Set correct answer.
- Set difficulty.

---

# 50. Admin — Test Builder

Cho phép kéo thả hoặc chọn:

```text
Test
 ├── Part 1
 │    ├── Q1
 │    ├── Q2
 │    └── ...
 ├── Part 2
 ├── Part 3
 ├── Part 4
 ├── Part 5
 ├── Part 6
 └── Part 7
```

Metadata:

- Test name.
- Version.
- Duration.
- Difficulty.
- Release date.
- Visibility.
- Target audience.

---

# 51. Admin — Passage Builder

Một passage có thể chứa:

- Title.
- Body.
- Source type.
- Images.
- Questions.
- Question order.
- Passage type.
- Vocabulary tags.
- Difficulty.

Một passage Part 3/4 tương tự được quản lý như một audio set.

---

# 52. Admin — Content review

Workflow:

```text
Author
  ↓
Draft
  ↓
Reviewer
  ↓
Approved
  ↓
Published
  ↓
Archived
```

Mỗi bước phải có:

- User thực hiện.
- Timestamp.
- Version.
- Comment.

---

# 53. Analytics hệ thống

## Product metrics

- Daily active learners.
- Tests completed.
- Questions answered.
- Practice minutes.
- Completion rate.
- Return rate.

## Learning metrics

- Average score.
- Accuracy.
- Score improvement.
- Weakest Part.
- Most missed question type.
- Avg study duration.

## Content metrics

- Most attempted questions.
- Most wrong questions.
- Most replayed audio.
- Most viewed explanation.
- Most saved vocabulary.

---

# 54. Data model tối thiểu

Các entity nên có:

```text
User
UserProfile
Goal
StudyPlan
Lesson
LessonItem
Question
QuestionOption
Passage
Audio
AudioTranscript
Image
Test
TestSection
TestPart
TestQuestion
Attempt
AttemptAnswer
AttemptQuestionState
Score
FlashcardDeck
Flashcard
FlashcardReview
Highlight
Note
ErrorRecord
Vocabulary
GrammarTopic
QuestionTag
StudySession
Notification
Subscription
```

---

# 55. Quan hệ dữ liệu quan trọng

```text
User
 ├── Attempts
 ├── StudySessions
 ├── FlashcardReviews
 ├── Notes
 ├── Highlights
 ├── ErrorRecords
 └── Goals

Test
 ├── Sections
 ├── Parts
 └── Questions

Question
 ├── Options
 ├── Explanation
 ├── Passage
 ├── Audio
 ├── Tags
 └── Vocabulary
```

---

# 56. Trạng thái Attempt

Nên dùng:

```text
NOT_STARTED
IN_PROGRESS
PAUSED
SUBMITTING
COMPLETED
AUTO_SUBMITTED
EXPIRED
ABANDONED
```

Các trạng thái này rất quan trọng để tránh lỗi mất bài thi.

---

# 57. Trạng thái câu trả lời

```text
UNANSWERED
ANSWERED
MARKED
ANSWERED_AND_MARKED
```

Sau khi chấm:

```text
CORRECT
INCORRECT
UNANSWERED
```

---

# 58. Điểm số

Không nên đồng nhất “số câu đúng” với “TOEIC scaled score”.

Hệ thống nên lưu riêng:

- Raw correct count.
- Accuracy.
- Estimated Listening score.
- Estimated Reading score.
- Estimated total score.
- Scoring model version.

Điểm chính thức TOEIC của ETS là scaled score; với dữ liệu luyện thi, nếu sản phẩm hiển thị “điểm TOEIC ước lượng”, phải ghi rõ đây là **estimated score** và lưu version của thuật toán quy đổi.

---

# 59. Chống gian lận / bảo vệ trải nghiệm thi

Đối với mock test:

- Server-side timer.
- Attempt token.
- Idempotent submit.
- Anti-refresh loss.
- Integrity logging.
- Detect excessive reload.
- Restrict answer API trong exam mode.

Không nên gửi correct answer về client trước khi nộp.

---

# 60. API logic cho màn hình thi

Các nhóm API:

```text
GET    /tests/:id
POST   /attempts
GET    /attempts/:id
PATCH  /attempts/:id/state
PATCH  /attempts/:id/questions/:questionId
POST   /attempts/:id/submit
GET    /attempts/:id/result
GET    /attempts/:id/review
```

Các API liên quan:

```text
GET    /questions/:id
GET    /questions/:id/explanation
POST   /questions/:id/highlights
POST   /questions/:id/notes
POST   /questions/:id/flashcards
```

---

# 61. Local state của exam UI

Frontend nên giữ tối thiểu:

```text
attemptId
currentQuestionIndex
currentSection
currentPart
answers
markedQuestions
audioState
remainingTime
networkState
submitState
```

Không phụ thuộc hoàn toàn vào React state nếu cần phục hồi khi reload; nên có persistence strategy rõ ràng.

---

# 62. Quy tắc UX quan trọng nhất của màn hình thi

1. Người dùng luôn biết mình đang ở Part nào.
2. Người dùng luôn biết còn bao nhiêu thời gian.
3. Người dùng luôn biết đang làm câu nào.
4. Người dùng dễ quay lại câu cũ.
5. Không mất đáp án khi chuyển câu.
6. Không mất đáp án khi mạng chập chờn.
7. Không cho thao tác sai làm mất hàng loạt đáp án.
8. Không làm UI quá nhiều thành phần phụ.
9. Passage và câu hỏi phải dễ đọc trên màn hình nhỏ.
10. Listening phải ưu tiên audio và thao tác chọn đáp án.
11. Reading phải ưu tiên khả năng đọc và điều hướng passage.

---

# 63. Bộ chức năng “tối thiểu nhưng phải đầy đủ” cho phiên bản đầu tiên

Nếu triển khai website luyện TOEIC 2 kỹ năng từ đầu, bộ lõi nên bao gồm:

### A. Account

- Register.
- Login.
- Logout.
- Profile.

### B. Test library

- Search.
- Filter.
- Test detail.
- Start test.

### C. Practice

- Part 1–7.
- Answer.
- Navigation.
- Timer.
- Explanation.
- Transcript.
- Translation.

### D. Full mock test

- Listening 45m.
- Reading 75m.
- 200 questions.
- Question palette.
- Mark.
- Auto-save.
- Submit.

### E. Result

- Score.
- Accuracy.
- Part analysis.
- Question review.
- Wrong answers.

### F. Learning tools

- Flashcards.
- Highlight.
- Note.
- Dictionary.
- Error notebook.

### G. Progress

- Score chart.
- Practice history.
- Weak Part.
- Target.

---

# 64. Bộ chức năng nên đạt mức “Study4-like”

Muốn nền tảng có chiều sâu tương đương mô hình STUDY4 thì cần bổ sung:

- Course platform.
- Vocabulary course.
- Grammar course.
- 6 dạng vocabulary practice.
- Dictation.
- Highlight.
- Create flashcard from highlight.
- Test library.
- Full mock test.
- Question taxonomy.
- Detailed explanation.
- Translation.
- Transcript.
- Daily roadmap.
- Personalized roadmap.
- Analytics by day.
- Analytics by question type.
- Error notebook.
- SRS flashcard.
- Mobile responsive.

---

# 65. Bảng chức năng theo cấp độ

| Cấp độ | Chức năng | Bắt buộc |
|---|---|---|
| Core | Login/Register | Có |
| Core | Test Library | Có |
| Core | Part 1–7 | Có |
| Core | Full Test | Có |
| Core | Timer | Có |
| Core | Result | Có |
| Core | Review | Có |
| Core | Question navigation | Có |
| Core | Auto-save | Có |
| Learning | Flashcards | Nên có |
| Learning | Dictionary | Nên có |
| Learning | Highlight | Nên có |
| Learning | Notes | Nên có |
| Learning | Dictation | Nên có |
| Learning | Vocabulary games | Nên có |
| Learning | Grammar course | Nên có |
| Analytics | Dashboard | Có |
| Analytics | Score trends | Có |
| Analytics | Weakness analysis | Có |
| Analytics | Error notebook | Nên có |
| Intelligence | Personalized roadmap | Nên có |
| Intelligence | Adaptive practice | Giai đoạn sau |
| Admin | Question bank | Có |
| Admin | Test builder | Có |
| Admin | Passage builder | Có |
| Admin | Analytics | Có |

---

# 66. Những tính năng nhỏ rất dễ bị bỏ sót nhưng phải đặc tả

## Thi

- Auto-save.
- Restore after refresh.
- Restore after reconnect.
- Submit locking.
- Timer synchronization.
- Question state synchronization.
- Current question persistence.
- Mark persistence.
- Unanswered detection.
- Submit confirmation.
- Auto-submit.
- Prevent duplicate submit.

## Listening

- Audio loading.
- Audio error.
- Retry.
- Volume.
- Replay policy.
- Playback state.
- Transcript access policy.

## Reading

- Long passage scroll.
- Passage/question association.
- Current question focus.
- Scroll preservation.
- Text selection.
- Dictionary.
- Highlight.

## Review

- Exact user answer.
- Correct answer.
- Explanation.
- Why each distractor is wrong.
- Vocabulary.
- Grammar tag.
- Similar questions.

## Analytics

- Attempt count.
- Raw score.
- Estimated score.
- Accuracy.
- Average time.
- Slowest questions.
- Weakest question types.
- Progress.

---

# 67. Thiết kế database cho dữ liệu thống kê

Không nên chỉ lưu:

```text
score = 650
```

Mà nên lưu event-level data:

```text
Attempt
AttemptQuestion
AnswerEvent
QuestionTime
SectionTime
ReviewEvent
FlashcardReview
StudySession
```

Từ đó mới tính được:

- Accuracy.
- Average response time.
- Part weakness.
- Topic weakness.
- Improvement.
- Time management.

---

# 68. Logic phân tích “người học yếu ở đâu?”

Ví dụ:

```text
Part 5
  Grammar: 82%
  Vocabulary: 61%
  Word Form: 48%

=> Recommendation:
- học Word Form
- làm 20 câu Word Form
- ôn 30 flashcards liên quan
```

Điểm khác biệt giữa một website “chỉ có đề” và một nền tảng “học từ lỗi sai” nằm ở tầng dữ liệu này.

---

# 69. Logic phân tích Listening

Không chỉ tính Part score.

Nên lưu:

- Main idea accuracy.
- Detail accuracy.
- Inference accuracy.
- Purpose accuracy.
- Speaker intention.
- Next action.
- Graphic question.
- Audio replay count trong practice mode.
- Average answer time.

Từ đó suy ra pattern lỗi.

---

# 70. Logic phân tích Reading

Nên lưu:

- Grammar accuracy.
- Vocabulary accuracy.
- Sentence completion accuracy.
- Passage comprehension accuracy.
- Inference.
- Cross-reference.
- Vocabulary in context.
- Detail.
- Purpose.
- Time per question.
- Time per passage.

---

# 71. Mô hình UI cho trang kết quả

```text
┌────────────────────────────────────────────────────────────┐
│ RESULT                                                    │
│                                                           │
│  Estimated Score  680                                    │
│  Listening 350       Reading 330                          │
│                                                           │
├────────────────────────────────────────────────────────────┤
│ Accuracy 76% │ 200 questions │ 120 min                   │
├────────────────────────────────────────────────────────────┤
│ PART PERFORMANCE                                          │
│ P1 ████████  P2 ███████  P3 █████  ...                  │
├────────────────────────────────────────────────────────────┤
│ WEAK AREAS                                                │
│ • Part 7 Inference                                        │
│ • Part 5 Word Form                                        │
├────────────────────────────────────────────────────────────┤
│ REVIEW                                                    │
│ [Wrong] [Marked] [All]                                    │
└────────────────────────────────────────────────────────────┘
```

---

# 72. Mô hình UI cho trang lesson

```text
┌────────────────┬──────────────────────────────────────────┐
│ LESSON SIDEBAR │ CONTENT                                  │
│                │                                          │
│ Vocabulary     │ Video / Theory                          │
│ Grammar        │                                          │
│ Strategy       │ Examples                                 │
│ Part 1         │                                          │
│ Part 2         │ Practice                                 │
│ Part 3         │                                          │
│ ...            │                                          │
│ Dictation      │                                          │
└────────────────┴──────────────────────────────────────────┘
```

STUDY4 mô tả giao diện khóa Complete TOEIC theo hướng sidebar danh sách bài học và khu vực nội dung trung tâm; nội dung gồm từ vựng, ngữ pháp, chiến lược, luyện từng Part và dictation.

---

# 73. Thiết kế trải nghiệm học “Learn → Practice → Review → Repeat”

Đây nên là vòng lặp cốt lõi.

```text
Learn concept
     ↓
Practice questions
     ↓
Check result
     ↓
Analyze mistakes
     ↓
Save vocabulary / notes
     ↓
Repeat weak questions
     ↓
Retest
```

Mỗi vòng lặp phải tạo dữ liệu để điều chỉnh vòng tiếp theo.

---

# 74. Luồng người dùng hoàn chỉnh

```text
Register
  ↓
Placement / target setup
  ↓
Dashboard
  ↓
Learning roadmap
  ↓
Vocabulary + Grammar
  ↓
Part practice
  ↓
Review errors
  ↓
Mini test
  ↓
Full TOEIC test
  ↓
Score analysis
  ↓
Weakness detection
  ↓
New roadmap
  ↓
Retest
```

---

# 75. Luồng thi full test chi tiết

```text
Open test
 ↓
Test information
 ↓
Confirm instructions
 ↓
Create attempt
 ↓
Start Listening timer 45:00
 ↓
Part 1
 ↓
Part 2
 ↓
Part 3
 ↓
Part 4
 ↓
Lock Listening
 ↓
Start Reading timer 75:00
 ↓
Part 5
 ↓
Part 6
 ↓
Part 7
 ↓
Submit
 ↓
Calculate raw result
 ↓
Calculate estimated score
 ↓
Generate analytics
 ↓
Store attempt
 ↓
Show result
 ↓
Review mistakes
```

---

# 76. Checklist QA cho giao diện thi

- [ ] Timer chạy chính xác.
- [ ] Timer không reset khi chuyển câu.
- [ ] Answer được lưu.
- [ ] Mark được lưu.
- [ ] Refresh không mất bài.
- [ ] Reconnect không mất bài.
- [ ] Auto-submit hoạt động.
- [ ] Double-click Submit không tạo hai attempt result.
- [ ] Reading có thể chuyển câu tự do.
- [ ] Part 3/4 giữ đúng audio group.
- [ ] Passage Part 7 không bị mất context.
- [ ] Question palette phản ánh đúng trạng thái.
- [ ] Mobile dùng được.
- [ ] Keyboard navigation hoạt động.
- [ ] Không leak answer API.

---

# 77. Checklist QA cho kết quả

- [ ] Tổng câu = 200 với full test.
- [ ] Listening raw score đúng.
- [ ] Reading raw score đúng.
- [ ] Accuracy đúng.
- [ ] Unanswered đúng.
- [ ] Marked không bị tính sai.
- [ ] Time used đúng.
- [ ] Explanation đúng question.
- [ ] Transcript đúng audio.
- [ ] Translation đúng passage/question.
- [ ] Review filter hoạt động.
- [ ] Error notebook tạo đúng record.
- [ ] Flashcard tạo đúng nguồn.

---

# 78. Checklist QA cho content

- [ ] Mỗi question có đúng 4 options nếu là dạng A/B/C/D.
- [ ] Một và chỉ một correct answer trong dữ liệu chuẩn.
- [ ] Explanation tồn tại.
- [ ] Translation tồn tại khi cần.
- [ ] Transcript tồn tại với Listening content.
- [ ] Audio tồn tại.
- [ ] Audio duration đúng.
- [ ] Passage association đúng.
- [ ] Part association đúng.
- [ ] Question type đúng.
- [ ] Difficulty đúng.

---

# 79. Phân biệt rõ 3 loại sản phẩm

## 79.1. Website chỉ có đề

Có:

- Test library.
- Test player.
- Result.

Nhưng chưa có learning intelligence.

## 79.2. Website luyện thi

Có thêm:

- Question bank.
- Explanation.
- Review.
- Flashcards.
- Dictionary.
- Statistics.
- Error notebook.

## 79.3. Learning platform hoàn chỉnh

Có thêm:

- Course.
- Roadmap.
- Personalization.
- Adaptive practice.
- Recommendation.
- Analytics.
- Learning loop.

Nếu mục tiêu là cạnh tranh với các nền tảng luyện thi lớn, sản phẩm nên hướng tới loại thứ ba.

---

# 80. Đặc tả “TOEIC 2 kỹ năng như thi thật” — bản yêu cầu giao diện

## Listening

- Section có timer 45 phút.
- Part 1–4.
- Audio-driven experience.
- Question group cho Part 3/4.
- Đáp án A/B/C/D hoặc A/B/C tùy Part.
- Question navigator.
- Chống lộ transcript/answer trong exam mode.
- Auto-submit/section transition.

## Reading

- Section có timer 75 phút.
- Part 5–7.
- 100 câu.
- Navigation tự do.
- Passage view tối ưu.
- Question palette.
- Mark question.
- Review trước submit.

## Result

- Raw score.
- Estimated scaled score.
- Listening.
- Reading.
- Total.
- Accuracy.
- Part analysis.
- Error analysis.
- Review questions.

---

# 81. Các điểm dễ nhầm khi triển khai

## 81.1. “200 câu” nhưng thời gian không phải 120 phút thuần giao diện

ETS mô tả bài thi có khoảng 2.5 giờ tổng cộng khi tính cả phần câu hỏi thông tin hành chính; thời gian làm bài chính thức của hai section là 45 phút Listening + 75 phút Reading.

## 81.2. Raw correct không phải score chính thức

Một người đúng 70/100 Listening không được phép mặc định suy ra một scaled score chính thức duy nhất nếu không có bảng/thuật toán quy đổi phù hợp.

## 81.3. Part 7 không phải chỉ một passage

Phải có single, double và triple passage trong question bank nếu muốn dữ liệu mô phỏng đúng cấu trúc đề hiện hành.

## 81.4. Part 3/4 phải có audio group

Không nên mô hình hóa mỗi câu như một audio độc lập nếu ba câu dùng chung một conversation/talk.

## 81.5. Thi thử và học bài là hai mode khác nhau

Không được nhồi dictionary, translation, transcript, explanation vào exam mode nếu mục tiêu là mô phỏng thi.

---

# 82. Kiến trúc thông tin đề xuất

```text
TOEIC
├── Learn
│   ├── Vocabulary
│   ├── Grammar
│   ├── Listening Strategy
│   └── Reading Strategy
│
├── Practice
│   ├── Part 1
│   ├── Part 2
│   ├── Part 3
│   ├── Part 4
│   ├── Part 5
│   ├── Part 6
│   └── Part 7
│
├── Tests
│   ├── Full Tests
│   ├── Listening Tests
│   ├── Reading Tests
│   └── Mini Tests
│
├── Vocabulary
│   ├── My Flashcards
│   ├── TOEIC Word Lists
│   └── Review Today
│
├── Review
│   ├── Wrong Answers
│   ├── Marked Questions
│   ├── Error Notebook
│   └── Notes / Highlights
│
└── Progress
    ├── Dashboard
    ├── Score
    ├── Weakness
    ├── Study History
    └── Roadmap
```

---

# 83. Danh sách màn hình frontend nên có

## Public

1. Home.
2. Login.
3. Register.
4. Forgot Password.
5. Test Library.
6. Test Detail.
7. Course List.
8. Course Detail.
9. Vocabulary List.
10. Grammar List.
11. FAQ.
12. Pricing/Subscription nếu có.

## Authenticated

13. Dashboard.
14. Profile.
15. Settings.
16. Study Roadmap.
17. Vocabulary.
18. Flashcards.
19. Grammar.
20. Practice Hub.
21. Part Practice.
22. Dictation.
23. Test Player.
24. Test Result.
25. Question Review.
26. Error Notebook.
27. Highlights.
28. Notes.
29. Study History.
30. Notifications.

## Admin

31. Admin Dashboard.
32. Users.
33. Questions.
34. Question Editor.
35. Passages.
36. Audio.
37. Images.
38. Vocabulary.
39. Grammar.
40. Tests.
41. Test Builder.
42. Analytics.
43. Reports.
44. Content Review.
45. Audit Log.

---

# 84. Ưu tiên triển khai

## Phase 1 — Core exam platform

- Auth.
- Test library.
- Question bank.
- Test player.
- Timer.
- Auto-save.
- Submit.
- Result.
- Review.
- Admin question/test management.

## Phase 2 — Learning platform

- Vocabulary.
- Flashcards.
- Grammar.
- Explanation.
- Transcript.
- Translation.
- Dictionary.
- Highlight.
- Notes.
- Error notebook.

## Phase 3 — Intelligence

- Dashboard.
- Target.
- Personalized roadmap.
- Weakness analysis.
- Recommendation engine.
- Adaptive practice.

## Phase 4 — Scale

- Advanced analytics.
- Large content pipeline.
- Content moderation.
- Subscription.
- Community.
- Advanced recommendation.

---

# 85. Tóm tắt đặc trưng quan trọng của STUDY4 cần học về mặt sản phẩm

Không nên chỉ sao chép ý tưởng “có đề thi”. Điểm đáng học ở mô hình STUDY4 là sự nối liền giữa:

```text
Content
  ↓
Practice
  ↓
Explanation
  ↓
Highlight / Dictionary
  ↓
Flashcard
  ↓
Review
  ↓
Statistics
  ↓
Roadmap
  ↓
Next Practice
```

Đây là vòng lặp làm cho người dùng quay lại học thay vì chỉ vào website làm đề rồi rời đi.

---

# 86. Nguồn kiểm chứng chính

1. **ETS — About the TOEIC Listening and Reading Test**: xác nhận cấu trúc 2 section, 100 câu Listening/100 câu Reading, Listening 45 phút và Reading 75 phút.
2. **ETS — TOEIC Listening & Reading FAQ**: xác nhận 200 câu, thang điểm scaled score 5–495 mỗi section và tổng 10–990.
3. **ETS — Examinee Handbook**: xác nhận phân bổ Part và cấu trúc Reading single/multiple passages.
4. **STUDY4 — Trang chủ**: xác nhận thư viện luyện thi, flashcards, spaced repetition, thống kê tiến độ và lộ trình.
5. **STUDY4 — Thư viện đề thi TOEIC**: xác nhận giao diện thư viện, search, danh sách full test, 7 Part và 200 câu.
6. **STUDY4 — Complete TOEIC**: xác nhận dictation, flashcards, vocabulary mini-games, grammar, dictionary, mock test và statistics.
7. **STUDY4 — Hướng dẫn học Complete TOEIC**: xác nhận flashcards, vocabulary exercises, Part 5/6/7 practice, translation và highlight.

---

# 87. Kết luận đặc tả

Một website luyện TOEIC 2 kỹ năng đầy đủ không nên được thiết kế như một “trang làm đề online”. Kiến trúc đúng phải gồm ba tầng:

```text
Tầng 1 — Exam Engine
Test library → Test player → Timer → Submit → Result

Tầng 2 — Learning Engine
Vocabulary → Grammar → Practice → Explanation → Dictation → Flashcards

Tầng 3 — Intelligence Engine
Analytics → Error model → Weakness detection → Roadmap → Recommendation
```

Trong đó **Exam Engine** quyết định chất lượng giao diện thi, **Learning Engine** quyết định chất lượng ôn tập, còn **Intelligence Engine** quyết định mức độ cá nhân hóa.

Nếu mục tiêu là xây một website có trải nghiệm tương đương các nền tảng luyện TOEIC lớn, bộ màn hình quan trọng nhất cần được thiết kế cực kỹ là:

1. Test Library.
2. Test Player Listening.
3. Test Player Reading.
4. Question Palette.
5. Part 3/4 Audio Group UI.
6. Part 6 Passage UI.
7. Part 7 Single/Double/Triple Passage UI.
8. Result Dashboard.
9. Question Review.
10. Error Notebook.
11. Flashcards.
12. Learning Dashboard.
13. Roadmap.

---

# 88. Ghi chú về tính xác minh

- Những tính năng được mô tả là **đã xác minh** chỉ dựa trên nguồn công khai được truy cập trong quá trình nghiên cứu.
- Những tính năng ghi theo hướng **nên có / đề xuất** là đặc tả sản phẩm, không phải khẳng định về tính năng hiện có của một website cụ thể.
- Với “BYTOEIC/BYETOEIC/BYETOIEC”, hiện **không đủ dữ liệu công khai để xác minh đầy đủ tên nền tảng và toàn bộ chức năng**, vì vậy không nên dùng tên này làm căn cứ duy nhất khi thiết kế yêu cầu sản phẩm.
