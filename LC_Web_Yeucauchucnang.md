# PRODUCT SPEC — WEBSITE LUYỆN TOEIC LISTENING (LC)

## 0. Mục tiêu sản phẩm

Xây dựng một website chuyên sâu cho **TOEIC Listening (LC)** gồm 2 hệ thống liên kết chặt chẽ:

1. **Mock Test / Exam Simulator**: thi thử TOEIC Listening với trải nghiệm gần bài thi thật nhất có thể.
2. **Learning / Practice Platform**: học, luyện kỹ năng, sửa lỗi, ôn lại và cá nhân hóa lộ trình để tăng điểm LC.

Triết lý sản phẩm:

> Người học không chỉ cần “làm nhiều câu hơn”, mà phải biết **mình đang yếu ở đâu, vì sao sai, cần học gì tiếp theo và lỗi đó đã được sửa thật chưa**.

Luồng cốt lõi:

**Diagnostic / Mock Test → Phân tích điểm yếu → Learning Plan → Practice → Error Review → Spaced Repetition → Mini Test → Mock Test lại → Đo tăng trưởng điểm**

---

# 1. SƠ ĐỒ SẢN PHẨM

## 1.1. Khu vực người dùng

### A. Dashboard

- Điểm LC hiện tại
- Điểm mục tiêu
- Tiến độ đến mục tiêu
- Lịch sử điểm
- Điểm mạnh / điểm yếu
- Kế hoạch học hôm nay
- Nhiệm vụ đang dang dở
- Streak / study time
- Câu sai cần ôn
- Từ vựng cần ôn

### B. Thi thử

- Full Listening Mock Test
- Mini Mock Test
- Thi riêng Part 1
- Thi riêng Part 2
- Thi riêng Part 3
- Thi riêng Part 4
- Timed Test
- Random Test
- Custom Test

### C. Học & Luyện

- Học theo Part
- Học theo dạng câu hỏi
- Học theo kỹ năng nghe
- Học từ vựng
- Chép chính tả / Dictation
- Nghe và điền từ / Fill-in-the-blank
- Shadowing
- Nghe hiểu theo transcript
- Paraphrase Training
- Distractor / Bẫy TOEIC
- Speed Training
- Prediction Training
- Number / Date / Name / Spelling Training
- Accent / Pronunciation Training

### D. Ôn tập

- Error Bank / Kho câu sai
- Vocabulary Review
- SRS / Spaced Repetition
- Saved Questions
- Recently Wrong
- Weak Areas
- Review by Part
- Review by Question Type

### E. Phân tích

- Score Analytics
- Part Analytics
- Question-Type Analytics
- Error-Type Analytics
- Vocabulary Analytics
- Listening Speed Analytics
- Weekly / Monthly Progress

### F. AI Tutor

- Giải thích đáp án
- Giải thích transcript
- Phân tích lỗi
- Tạo câu tương tự
- Hỏi đáp từ vựng
- Luyện nói / shadowing feedback nếu có audio recording
- Tạo kế hoạch học

---

# 2. TRIẾT LÝ UX CHUNG

## 2.1. Ba câu hỏi phải luôn được trả lời

Mọi màn hình quan trọng phải giúp người dùng trả lời được:

1. **Tôi đang học / thi cái gì?**
2. **Tôi đang yếu ở đâu?**
3. **Tiếp theo tôi nên làm gì?**

## 2.2. Tách tuyệt đối “Thi” và “Học”

### Exam Mode

Không có:

- Pause audio
- Replay audio
- Transcript
- Từ điển
- Giải thích
- Hint
- Xem đáp án
- Feedback đúng/sai ngay lập tức

### Practice Mode

Có:

- Replay
- Slow speed
- Transcript
- Vocabulary lookup
- Explanation
- Dictation
- Shadowing
- Save question
- Error tagging

Người dùng phải nhìn thấy rõ chế độ hiện tại để không nhầm giữa “thi” và “học”.

---

# 3. MODULE THI THỬ TOEIC LISTENING

# 3.1. Full Mock Test

## Mục tiêu

Mô phỏng trọn bài Listening.

## Chức năng

### Test selection

- Chọn đề cụ thể
- Random đề
- Đề chưa làm
- Đề đã làm
- Đề theo level
- Đề theo mục tiêu điểm

### Trước khi thi

Màn hình giới thiệu:

- Tên đề
- Số câu
- Các Part
- Thời lượng dự kiến
- Quy tắc Exam Mode
- Nút `Start Test`

### Exam Session

- Session ID duy nhất
- Tự động lưu trạng thái nếu trình duyệt refresh ngoài ý muốn
- Đồng hồ / progress
- Part indicator
- Question indicator
- Audio state
- Answer state

### Quy tắc

- Audio tự phát theo flow
- Không replay
- Không pause
- Không tua
- Không skip audio
- Không xem transcript
- Không xem đáp án
- Không hiện correct/incorrect
- Không gợi ý

## Kết thúc

Hiển thị:

- Tổng số câu đúng / 100
- Estimated Listening Score
- Theo Part
- Theo dạng câu hỏi
- Accuracy
- Danh sách câu sai
- Câu chưa trả lời
- Thời gian / tiến độ
- So sánh với lần thi trước
- Gợi ý học tiếp theo

---

# 3.2. Mini Mock Test

Mục tiêu: kiểm tra nhanh trong 5–15 phút.

Các preset:

- 10 câu
- 20 câu
- 30 câu
- 50 câu
- 1 conversation set
- 1 talk set

Dùng cho:

- Daily test
- Warm-up
- Progress check
- Post-learning test

---

# 3.3. Thi riêng từng Part

Phải có menu riêng:

- **Part 1 Test**
- **Part 2 Test**
- **Part 3 Test**
- **Part 4 Test**

Mỗi Part có:

- Full Part
- 10 câu
- 20 câu
- Random set
- Timed set
- Difficulty filter

Ví dụ Part 2:

- Beginner
- Intermediate
- Advanced
- Mixed
- WH Questions
- Yes/No
- Indirect Questions
- Choice Questions
- Negative Questions
- Statement → Response

---

# 3.4. Custom Test Builder

Người dùng tự tạo đề:

- Chọn Part
- Chọn số câu
- Chọn difficulty
- Chọn question type
- Chọn topic
- Chọn accent
- Chọn câu chưa từng làm
- Chỉ lấy câu từng sai
- Chỉ lấy câu đã lâu chưa ôn
- Timed / Untimed

Ví dụ:

> 30 câu → Part 3 → Inference → Advanced → Câu chưa từng làm

---

# 3.5. Question Review sau thi

Mỗi câu có:

- Question number
- User answer
- Correct answer
- Status
- Audio player trong review mode
- Transcript
- Explanation
- Vocabulary
- Paraphrase
- Trap type
- Question type
- Difficulty
- “Why I got this wrong?”
- Save
- Add to review

Các trạng thái:

- Correct
- Incorrect
- Unanswered
- Guessed

---

# 3.6. Mock Test Result

## Tổng quan

Hiển thị lớn:

> Estimated LC Score: 405 / 495

Thêm:

- Raw correct
- Accuracy
- Part scores
- Score trend
- Target score gap

## Theo Part

Ví dụ:

| Part   | Correct | Accuracy |
| ------ | ------: | -------: |
| Part 1 |     6/6 |     100% |
| Part 2 |   21/25 |      84% |
| Part 3 |   27/39 |      69% |
| Part 4 |   22/30 |      73% |

## Theo question type

Ví dụ:

- Main Idea: 84%
- Detail: 73%
- Inference: 51%
- Purpose: 79%
- Next Action: 58%

## Theo lỗi

Ví dụ:

- Vocabulary: 25%
- Paraphrase: 23%
- Distractor: 18%
- Inference: 21%
- Speed: 13%

---

# 4. MODULE HỌC THEO PART

# 4.1. Part 1 — Photographs

## Lesson categories

- People
- Objects
- Locations
- Actions
- Position
- Clothing
- Workplace
- Transportation

## Skills

- Verb recognition
- Preposition recognition
- Position words
- Singular/plural
- Active/passive distinction
- Object identification

## Practice modes

- Normal multiple choice
- Listen and identify action
- Listen and identify location
- Picture → choose sentence
- Sentence → choose matching picture
- Vocabulary drill
- Timed Part 1

## Common trap training

- Wrong subject
- Wrong action
- Same object, wrong action
- Action actually not happening
- Similar-sounding description

---

# 4.2. Part 2 — Question & Response

## Core categories

- Who
- What
- When
- Where
- Why
- How
- How much
- How many
- Yes/No
- Choice
- Indirect question
- Negative question
- Statement

## Dedicated drills

### Question-Type Drill

Ví dụ:

> Where is the report?

Người học chỉ tập xác định:

> WHERE → place/location response

### Fast Response Drill

Audio phát → chọn ngay trong thời gian ngắn.

### Distractor Drill

Tập trung vào:

- Lặp lại từ trong câu hỏi
- Đúng từ nhưng sai nghĩa
- Đúng grammar nhưng sai context
- Trả lời đúng dạng nhưng sai nội dung

### Paraphrase Drill

Question dùng “purchase” nhưng response dùng “buy”.

### Indirect Response Drill

Câu trả lời không lặp lại trực tiếp từ khóa.

---

# 4.3. Part 3 — Conversations

## Lesson units

Mỗi conversation là một learning object gồm:

- Audio
- 3 questions
- Transcript
- Speaker metadata
- Vocabulary
- Paraphrase
- Explanation

## Question types

- Main idea
- Purpose
- Detail
- Inference
- Next action
- Problem
- Location
- Time
- Relationship

## Skills training

### Prediction

Đọc câu hỏi trước → dự đoán loại thông tin cần nghe.

### Keyword Listening

Xác định từ khóa nhưng tránh “keyword trap”.

### Paraphrase Recognition

Nhận diện cách diễn đạt tương đương.

### Speaker Tracking

Theo dõi ai nói gì.

### Context Tracking

Theo dõi:

- Vấn đề ban đầu
- Thay đổi
- Quyết định
- Hành động tiếp theo

### Multi-question Memory

Nghe 1 đoạn nhưng trả lời 3 câu.

---

# 4.4. Part 4 — Talks

## Content types

- Announcement
- Advertisement
- News report
- Telephone message
- Tour / public information
- Workplace presentation
- Meeting update
- Instructions

## Training

- Main idea
- Purpose
- Detail
- Inference
- Next action
- Who/where/when
- Number/date/name

## Advanced drills

- Fast speech
- Long talks
- Dense information
- Multiple distractors
- Information change
- Implied meaning

---

# 5. MODULE HỌC TỪ VỰNG TOEIC LC

## 5.1. Vocabulary Home

Hiển thị:

- Words learned
- Words due for review
- Retention
- Weak categories
- Today's words
- Recently missed words

## 5.2. Vocabulary categories

Theo chủ đề:

- Office
- Meeting
- Travel
- Airport
- Hotel
- Restaurant
- Shopping
- Delivery
- Logistics
- Human Resources
- Finance
- Sales
- Customer Service
- Construction
- Manufacturing
- Events
- Transportation

## 5.3. Word detail

Mỗi từ phải có:

- Word
- IPA / pronunciation nếu có
- Audio
- Vietnamese meaning
- English definition
- Example sentence
- TOEIC example
- Collocations
- Synonyms
- Common paraphrases
- Common distractors
- Related words

Ví dụ:

> postpone

Collocations:

- postpone a meeting
- postpone a delivery
- postpone an appointment

Paraphrases:

- delay
- put off
- reschedule (tùy ngữ cảnh)

## 5.4. Vocabulary practice

- Flashcard
- Audio → choose meaning
- Meaning → choose word
- Word → choose audio
- Fill blank
- Spelling
- Dictation
- Matching
- Multiple choice
- Context sentence
- Paraphrase matching

## 5.5. Vocabulary from mistakes

Từ xuất hiện trong câu người dùng sai sẽ được tự động đề xuất học.

Ví dụ:

> Bạn sai 3 câu có từ “shipment”.
>
> → Add “shipment” vào Weak Vocabulary.

---

# 6. MODULE CHÉP CHÍNH TẢ — DICTATION

Đây là module cốt lõi để cải thiện khả năng “nghe được từng âm”.

## 6.1. Chế độ Basic

Audio → ô trống → gõ lại toàn bộ câu.

Có thể chọn:

- 1 câu
- 3 câu
- 5 câu
- 10 câu

## 6.2. Word-level Dictation

Audio phát → từng từ bị che.

Ví dụ:

> The shipment should \_\_\_ by Friday.

## 6.3. Phrase Dictation

Che các cụm:

- by Friday
- in the conference room
- a customer service representative

## 6.4. Full Sentence Dictation

Người học gõ lại toàn bộ câu.

Hệ thống so sánh:

- Missing word
- Extra word
- Wrong word
- Spelling error
- Number/date error
- Singular/plural error

## 6.5. Intelligent Feedback

Ví dụ:

> Expected: “The shipment should arrive by Friday.”
>
> You typed: “The shipment should arrive Friday.”
>
> Missing: **by**

Có thể đánh dấu lỗi theo màu / loại lỗi.

## 6.6. Dictation progression

Level 1:

- Slow audio
- Short sentences
- Common vocabulary

Level 2:

- Normal speed
- Workplace vocabulary

Level 3:

- Natural connected speech
- Reduced forms
- Longer sentences

Level 4:

- Part 3/4 excerpts
- No replay
- Full sentence

---

# 7. MODULE NGHE & ĐIỀN TỪ — LISTENING CLOZE

Khác Dictation: người học không phải chép cả câu, chỉ điền phần quan trọng.

Ví dụ:

> The meeting has been **\_\_** until Friday.

Hệ thống cho chọn:

- Vocabulary mode
- Grammar mode
- Key information mode
- Random blank
- User-specific weak word

Có thể tạo blank dựa trên:

- TOEIC vocabulary
- verbs
- prepositions
- collocations
- numbers
- names

---

# 8. MODULE SHADOWING

## Luồng cơ bản

1. Nghe mẫu
2. Xem transcript
3. Nghe lại
4. Thu âm giọng người học
5. Phát lại so sánh
6. Đánh giá

## Chế độ

- Full sentence
- Phrase by phrase
- Speaker turn
- Conversation
- Talk

## Nếu tích hợp speech analysis

Có thể cung cấp:

- Speaking speed
- Pause duration
- Pronunciation mismatch
- Missing words
- Intonation approximation

Nếu không có speech recognition chất lượng cao, tính năng này nên ưu tiên **self-record + compare** thay vì chấm phát âm quá tự tin.

---

# 9. MODULE NGHE CÙNG TRANSCRIPT

## Transcript Viewer

Transcript phải đồng bộ với audio.

Chức năng:

- Highlight câu đang phát
- Click câu → phát từ câu đó
- Click từ → mở vocabulary
- Toggle translation
- Hide/show transcript
- Hide/show translation

## Highlight theo loại

- Vocabulary
- Paraphrase
- Keywords
- Grammar pattern
- TOEIC trap

---

# 10. MODULE PARAPHRASE TRAINING

Mục tiêu: giúp người học nhận ra cách TOEIC đổi từ.

Ví dụ:

Audio:

> The meeting has been postponed.

Question/answer:

> The meeting has been delayed.

Bài tập:

- Match paraphrases
- Choose equivalent sentence
- Audio → choose paraphrase
- Sentence → choose audio meaning
- Replace word

Kho paraphrase nên gắn với từng câu hỏi thực tế.

---

# 11. MODULE DISTRACTOR / BẪY TOEIC

Hệ thống cần lưu “trap tag” cho từng đáp án sai.

Các trap type:

- Keyword repetition
- Same sound
- Similar pronunciation
- Wrong time
- Wrong location
- Wrong subject
- Correct information, wrong question
- Partially correct
- Extreme statement
- Context mismatch
- Grammar mismatch

## Trap Practice

Hệ thống cho một loạt câu cùng một loại bẫy.

Ví dụ:

> **Keyword Trap — 10 questions**

Sau khi làm xong:

> Bạn bị keyword trap: 7/10 câu.

---

# 12. MODULE SPEED TRAINING

Mục tiêu: tăng khả năng xử lý tiếng Anh ở tốc độ thi.

## Chế độ tốc độ

- 0.75x
- 0.85x
- 1.0x
- 1.1x
- 1.2x

Lưu ý: tốc độ chậm dùng để học, 1.0x là chuẩn kiểm tra. Tốc độ nhanh là bài training nâng sức xử lý, không thay thế tốc độ thi.

## Speed Ladder

0.85x → 0.95x → 1.0x → 1.1x

Chỉ tăng khi accuracy đạt ngưỡng.

Ví dụ:

> Accuracy ≥ 85% ở 0.95x → mở 1.0x.

---

# 13. MODULE QUESTION-TYPE TRAINING

Người dùng có thể luyện đúng một dạng câu.

Ví dụ:

> Part 3 → Inference → 20 questions

Các type:

- Main idea
- Purpose
- Detail
- Inference
- Next action
- Location
- Time
- Number
- Speaker relation
- Problem
- Solution

Mỗi question type có:

- Lesson
- Practice
- Timed practice
- Review
- Mini test

---

# 14. MODULE DAILY PRACTICE

Dashboard tự sinh “Today's Practice”.

Ví dụ:

### Today's 45-minute plan

1. 10 phút — Vocabulary Review
2. 10 phút — Part 2 Question-Response
3. 10 phút — Part 3 Inference
4. 10 phút — Dictation
5. 5 phút — Error Review

Plan phải dựa trên:

- Target score
- Current score
- Weak areas
- Recent mistakes
- Review due
- Study history

---

# 15. MODULE ERROR BANK

## Mỗi câu sai lưu metadata

- Question ID
- Date wrong
- Number of times wrong
- Part
- Question type
- Difficulty
- User answer
- Correct answer
- Trap type
- Vocabulary involved
- Error reason
- Last reviewed
- Next review
- Mastery score

## Các tab

- All Mistakes
- Recent Mistakes
- Frequently Wrong
- Due Today
- Part 2
- Part 3
- Part 4
- Vocabulary Mistakes
- Inference Mistakes

## Actions

- Review
- Add note
- Mark mastered
- Remove
- Make flashcard
- Add to custom test

---

# 16. SPACED REPETITION / SRS

Không phải câu sai nào cũng xuất hiện mỗi ngày.

Mỗi item có trạng thái mastery:

- New
- Learning
- Familiar
- Strong
- Mastered

Review scheduling có thể theo kiểu:

> 1 ngày → 3 ngày → 7 ngày → 14 ngày → 30 ngày

Nếu sai lại:

> reset / shorten interval

Nếu đúng nhiều lần:

> kéo dài interval

Áp dụng cho:

- Vocabulary
- Question
- Dictation item
- Paraphrase
- Trap type

---

# 17. MODULE WEAKNESS DIAGNOSIS

Website cần phân tích ít nhất 5 lớp.

## Layer 1 — Part

- Part 1
- Part 2
- Part 3
- Part 4

## Layer 2 — Question Type

- Detail
- Inference
- Main idea...

## Layer 3 — Error Cause

- Vocabulary
- Paraphrase
- Speed
- Distractor
- Inference

## Layer 4 — Topic

- Office
- Travel
- Business
- Logistics...

## Layer 5 — Specific skill

- Number recognition
- Name recognition
- Speaker tracking
- Negation
- Preposition
- Time/date recognition

---

# 18. SCORE ANALYTICS

## Dashboard Score

- Current estimated score
- Best score
- Average score
- Last score
- Target score
- Score gap

## Trend

Biểu đồ:

> 620 → 645 → 670 → 690 → 705

## Part trend

Ví dụ:

> Part 3: 62% → 67% → 74%

## Retention trend

- Vocabulary retention
- Error recurrence
- Accuracy after 7 days

---

# 19. TARGET SCORE PLANNER

Người dùng nhập:

> Target: 800 LC

Website phân tích:

> Current: 680
>
> Gap: +120

Sau đó ưu tiên các khu vực có potential gain lớn nhất.

Ví dụ:

- Part 2 indirect response: High
- Part 3 inference: Very High
- Part 4 detail: Medium
- Part 1: Low

Kết luận:

> Không bắt người dùng dành 30% thời gian cho Part 1 nếu Part 3 mới là nơi mất điểm lớn.

---

# 20. AI TUTOR

## Ask about this question

Nút:

> Ask AI

Các prompt shortcut:

- Why is this answer correct?
- Why is my answer wrong?
- Explain the transcript
- Give me easier examples
- Give me similar questions
- Explain the vocabulary
- What is the trap?

## Personalized diagnosis

AI có thể trả lời:

> Bạn thường chọn đáp án chứa keyword xuất hiện trực tiếp trong audio, ngay cả khi câu hỏi yêu cầu inference.

## Generate similar question

AI tạo:

- Cùng Part
- Cùng question type
- Cùng difficulty
- Cùng trap
- Khác nội dung

Sau khi làm, AI so sánh:

> Original: wrong
> Similar: correct

→ có dấu hiệu lỗi đã được sửa.

---

# 21. BOOKMARK / SAVE

Cho phép:

- Save question
- Save vocabulary
- Save transcript line
- Add personal note

Collections:

- Must Review
- Part 2 Traps
- Favorite
- Hard Questions
- Useful Vocabulary

---

# 22. SEARCH

Search toàn website theo:

- Question ID
- Keyword
- Vocabulary
- Topic
- Part
- Question type
- Transcript phrase

Ví dụ tìm:

> “postponed”

Kết quả:

- Vocabulary
- Questions chứa từ
- Paraphrases
- Dictation lessons

---

# 23. GAMIFICATION NHẸ

Chỉ dùng để duy trì thói quen, không biến thành game.

Có:

- Daily streak
- Study minutes
- Weekly target
- Completion ring
- Milestones

Ví dụ:

> 7 ngày liên tiếp
> 100 câu Part 2
> 500 từ đã master
> First 700 LC

Không nên thưởng quá nhiều điểm ảo khiến người dùng tập trung vào game hơn điểm TOEIC.

---

# 24. NOTIFICATION / REMINDER

Có thể nhắc:

- Vocabulary review due
- Error review due
- Daily practice
- Mock test due
- Goal progress

Ví dụ:

> “12 câu bạn sai tuần trước đang đến lịch ôn.”

---

# 25. ADMIN / CONTENT MANAGEMENT

Đây là phần bắt buộc nếu website có nhiều nội dung.

## Question Bank

Admin tạo / nhập:

- Question
- Audio
- Image nếu cần
- Choices
- Correct answer
- Transcript
- Explanation
- Vocabulary
- Paraphrase
- Part
- Question type
- Difficulty
- Trap type
- Topic
- Speaker information

## Audio metadata

- Duration
- Speaker
- Accent
- Speed
- Recording quality

## Content validation

Không cho publish nếu thiếu:

- Answer key
- Audio
- Transcript đối với Listening practice
- Explanation trong lesson

---

# 26. CONTENT DIFFICULTY SYSTEM

Mỗi câu cần difficulty:

- Easy
- Medium
- Hard
- Very Hard

Có thể có thêm:

> Difficulty score: 1–100

Difficulty được cập nhật theo dữ liệu thực tế:

- Accuracy toàn hệ thống
- Accuracy theo level người học
- Average response time
- Distractor selection rate

Ví dụ:

> Một câu có 35% người trình độ 700+ trả lời đúng
>
> → khả năng là Hard / Very Hard.

---

# 27. USER PROFILE

Thông tin chính:

- Target score
- Current estimated score
- Current level
- Study goal
- Daily time
- Preferred practice time
- Learning streak
- Completed lessons

Không cần thu thập thông tin cá nhân không liên quan đến việc học.

---

# 28. RECOMMENDATION ENGINE

Mỗi khi người dùng hoàn thành hoạt động, hệ thống cập nhật recommendation.

Ví dụ:

Người dùng vừa làm:

> Part 3 — Inference
> 45%

Hệ thống đề xuất:

1. Inference Mini Lesson
2. 10 easy inference questions
3. 10 medium questions
4. Review 5 old mistakes
5. Mini Test

Nếu đạt tốt:

> Unlock advanced inference.

---

# 29. LEARNING LOOP CHUẨN

## Loop 1 — Learn

Học concept / vocabulary / strategy.

## Loop 2 — Guided Practice

Có hint + transcript + replay.

## Loop 3 — Independent Practice

Bớt hỗ trợ.

## Loop 4 — Timed Practice

Có áp lực thời gian.

## Loop 5 — Test

Không hỗ trợ.

## Loop 6 — Diagnose

Phân tích lỗi.

## Loop 7 — Review

SRS + Error Bank.

Lặp lại.

---

# 30. MỘT UNIT HỌC MẪU

Ví dụ:

## Lesson: Part 3 — Inference

### Step 1 — Learn

Giải thích inference là gì.

### Step 2 — Strategy

Dạy:

- nghe facts
- nối context
- tránh answer lặp keyword

### Step 3 — Guided Question

Có transcript + replay.

### Step 4 — Practice

10 câu.

### Step 5 — Trap Training

5 câu cùng trap.

### Step 6 — Dictation

3 câu từ audio.

### Step 7 — Vocabulary

5 từ mới.

### Step 8 — Mini Test

10 câu, không transcript.

### Step 9 — Review

Đưa câu sai vào Error Bank.

### Step 10 — Recommendation

Nếu accuracy < 70%:

> học lại.

70–85%:

> luyện thêm.

> 85%:
> chuyển level.

---

# 31. TRANG HOME LÝ TƯỞNG

## Hero

> **TOEIC Listening 800**
>
> Current: 690
> Target: 800
>
> [Continue Learning]

## Today's Focus

> Part 3 — Inference
> 35 minutes

## Quick Actions

- Full Mock
- Part 2 Test
- Part 3 Test
- Dictation
- Vocabulary

## Review Due

> 18 questions
> 27 words

## Weak Areas

> Part 3 Inference
> Part 4 Detail
> Paraphrase

## Recent Progress

> +25 points this month

---

# 32. ĐIỀU KIỆN “THI THẬT” CỦA MOCK TEST

Mock Test chỉ được gọi là “Exam Simulation” khi:

- Audio flow được khóa
- Không replay
- Không pause
- Không transcript trong lúc thi
- Không explanation
- Không hint
- Không correct/incorrect feedback
- Format đúng
- Số câu đúng
- Timing hợp lý
- UI tối giản
- Chuyển section rõ ràng
- Có result analytics sau khi kết thúc

Nếu người dùng có thể tua lại audio và xem transcript thì đó phải được gọi là **Practice Test**, không phải Full Exam Simulation.

---

# 33. ƯU TIÊN MVP

## P0 — Bắt buộc phải có

1. Authentication
2. Dashboard cơ bản
3. Question Bank
4. Audio Player
5. Part 1–4
6. Full Mock Test
7. Part-based Test
8. Scoring
9. Result Analysis
10. Transcript
11. Explanation
12. Vocabulary lookup
13. Error Bank
14. Basic progress tracking
15. Practice mode
16. Exam mode

## P1 — Rất nên có

1. Dictation
2. SRS
3. Vocabulary learning
4. Question-type training
5. Distractor training
6. Paraphrase training
7. Daily Practice
8. Adaptive Recommendation
9. Mini Test
10. Custom Test

## P2 — Tạo khác biệt

1. Shadowing
2. AI Tutor
3. AI-generated similar questions
4. Advanced score prediction
5. Detailed weakness diagnosis
6. Speech analysis
7. Difficulty auto-calibration
8. Personalized study plan

---

# 34. MENU ĐỀ XUẤT

Sidebar:

- Home
- Learn
  - Part 1
  - Part 2
  - Part 3
  - Part 4
  - Vocabulary
  - Dictation
  - Shadowing
  - Paraphrase
  - Trap Training
- Practice
  - Quick Practice
  - Question Types
  - Custom Practice
- Mock Test
  - Full Test
  - Part Tests
  - Mini Tests
- Review
  - Error Bank
  - SRS Review
  - Saved Questions
  - Vocabulary Review
- Progress
  - Score
  - Weakness
  - History
  - Goal
- AI Tutor

---

# 35. PRINCIPLE CUỐI CÙNG CỦA SẢN PHẨM

Website không nên được đo chủ yếu bằng:

> “Có bao nhiêu câu hỏi?”

Mà bằng:

> **“Sau 30 ngày, người dùng nghe tốt hơn bao nhiêu và điểm LC tăng bao nhiêu?”**

Mỗi tính năng phải trả lời được một trong ba mục tiêu:

### 1. Understand

Giúp nghe hiểu tốt hơn.

### 2. Practice

Giúp biến kỹ năng thành phản xạ.

### 3. Improve Score

Giúp giảm lỗi và tăng điểm trong bài thi.

Sản phẩm lý tưởng là một vòng lặp kín:

**TEST → DIAGNOSE → LEARN → PRACTICE → REVIEW → RE-TEST → MEASURE SCORE GROWTH**

Đây phải là xương sống của toàn bộ UX, content system và recommendation engine.
