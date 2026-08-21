# TOEIC Learning Platform — Knowledge Teaching + Question Taxonomy + Frequent Vocabulary System

## 0. Mục tiêu của tài liệu

Website luyện TOEIC không nên chỉ có:

- Làm Part 1 → Part 7.
- Làm full test.
- Chấm điểm.
- Xem đáp án.

Phần còn thiếu quan trọng là **Learning Layer**:

```text
KIẾN THỨC
   ↓
CÁCH NHẬN DIỆN DẠNG
   ↓
CHIẾN LƯỢC LÀM BÀI
   ↓
VÍ DỤ CÓ HƯỚNG DẪN
   ↓
LUYỆN RIÊNG TỪNG DẠNG
   ↓
LUYỆN TRỘN
   ↓
LUYỆN THEO ĐỘ KHÓ
   ↓
LUYỆN THEO THỜI GIAN
   ↓
MINI TEST
   ↓
FULL TEST
   ↓
PHÂN TÍCH LỖI
   ↓
ÔN LẠI KIẾN THỨC / TỪ VỰNG / DẠNG ĐÃ SAI
```

Điểm cần bổ sung cho sản phẩm:

1. Dạy kiến thức nền.
2. Dạy cách làm từng dạng câu hỏi.
3. Phân loại câu hỏi đến mức chi tiết.
4. Phân loại passage/document.
5. Hệ thống từ vựng thường xuất hiện trong kho đề.
6. Hệ thống grammar thường xuất hiện trong kho đề.
7. Liên kết từ vựng ↔ Part ↔ question type ↔ test.
8. Luyện Listening theo dạng.
9. Luyện Reading theo dạng.
10. Tự động tìm điểm yếu.
11. Tự tạo bộ câu hỏi từ điểm yếu.
12. Cho người học học lý thuyết rồi mới luyện câu.
13. Sau khi làm câu phải biết mình sai vì kiến thức gì.

---

# 1. Kiểm chứng phần STUDY4

STUDY4 hiện công khai rằng khóa Complete TOEIC có:

- Từ vựng TOEIC.
- Ngữ pháp TOEIC.
- Hướng dẫn cách làm từng dạng câu hỏi từ Part 1 đến Part 7.
- Bài tập luyện cho từng dạng.
- Dictation.
- Flashcards.
- Spaced repetition.
- Hơn 20.000 câu hỏi theo format TOEIC mà website mô tả.
- Giải thích chi tiết.
- Transcript và dịch cho nội dung nghe.
- Practice Zone có thống kê kết quả theo dạng bài.

STUDY4 cũng công khai bộ 1200 từ vựng TOEIC và 17 nhóm ngữ pháp trong khóa Complete TOEIC. Đây là tuyên bố của chính website, không nên biến thành cam kết khách quan của sản phẩm mới.

Nguồn:
- https://study4.com/courses/28/complete-toeic/
- https://study4.com/posts/1251/huong-dan-cach-hoc-khoa-complete-toeic-cua-study4/
- https://study4.com/posts/1250/huong-dan-hoc-thu-khoa-hoc-complete-toeic/
- https://study4.com/posts/938/cach-ap-dung-spaced-repetition-vao-viec-hoc-tu-vung-toeic/
- https://study4.com/lp/complete-toeic-v2/

## Kết luận

Không nên thiết kế sản phẩm theo giả định:

```text
"Website hiện tại chỉ có đề, không có dạy dạng bài."
```

Điều đó không chính xác với STUDY4 hiện tại.

Điểm cần làm tốt hơn cho sản phẩm của mình là biến hệ thống này thành một **taxonomy và learning path có cấu trúc**, để người học biết:

```text
Tôi đang học kiến thức gì?
→
Dạng câu hỏi nào kiểm tra kiến thức đó?
→
Nhận diện bằng dấu hiệu nào?
→
Làm theo quy trình nào?
→
Tôi đang yếu ở đâu?
→
Cần học lại bài nào?
```

---

# 2. Chuẩn format TOEIC cần bám

ETS hiện mô tả TOEIC Listening and Reading gồm hai section, mỗi section 100 câu:

```text
Listening: 100 câu / khoảng 45 phút
Reading:   100 câu / 75 phút
```

Listening:

```text
Part 1 — Photographs
Part 2 — Question-Response
Part 3 — Conversations
Part 4 — Talks
```

Reading:

```text
Part 5 — Incomplete Sentences
Part 6 — Text Completion
Part 7 — Reading Comprehension
```

Nguồn chính thức:

https://www.ets.org/toeic/about/listening-reading.html

---

# 3. Kiến trúc module tổng thể

## 3.1. Learning

```text
Learning
├── Vocabulary
├── Grammar
├── Listening Skills
├── Reading Skills
├── Test Strategies
└── Study Roadmap
```

## 3.2. Practice

```text
Practice
├── Part 1
├── Part 2
├── Part 3
├── Part 4
├── Part 5
├── Part 6
├── Part 7
├── Mixed Listening
├── Mixed Reading
└── Full Test
```

## 3.3. Question Bank

```text
Question Bank
├── Part
├── Question Type
├── Sub Type
├── Knowledge Topic
├── Vocabulary
├── Document Type
├── Difficulty
├── Source
└── Test
```

## 3.4. Review

```text
Review
├── Wrong Answers
├── Slow Answers
├── Marked Questions
├── Weak Topics
├── Weak Vocabulary
├── Weak Grammar
└── Due Reviews
```

---

# 4. Nguyên tắc quan trọng: tách Part và Question Type

Không được coi:

```text
Part 5 = một dạng
Part 6 = một dạng
Part 7 = một dạng
```

Phải coi:

```text
Part
└── Question Type
    └── Sub Type
        └── Knowledge
            └── Practice
```

Ví dụ:

```text
Part 5
└── Grammar
    └── Verb Tense
        └── Present Perfect
```

Hoặc:

```text
Part 7
└── Inference
    └── Single Passage
        └── Email
```

---

# 5. PART 5 — taxonomy chi tiết

STUDY4 hiện phân Part 5 thành các nhóm vocabulary, parts of speech và grammar; trang khóa học còn liệt kê riêng các bài về noun/verb/adjective/adverb, pronoun, verb tense, active/passive, participle, to-V, V-ing, infinitive, conjunction, preposition, imperative, relative clause và comparison.

Nguồn:
https://study4.com/lp/complete-toeic-v2/

## 5.1. Vocabulary Questions

```text
Part 5
└── Vocabulary
    ├── Noun Meaning
    ├── Verb Meaning
    ├── Adjective Meaning
    ├── Adverb Meaning
    ├── Synonym
    ├── Collocation
    ├── Word in Context
    ├── Business Vocabulary
    ├── Academic / Workplace Vocabulary
    └── Confusing Words
```

### Noun meaning

Nhận diện:

- tên người.
- tổ chức.
- sự vật.
- khái niệm.
- hoạt động.

### Verb meaning

Nhận diện hành động phù hợp với ngữ cảnh.

### Adjective meaning

Mô tả:

- người.
- vật.
- trạng thái.
- chất lượng.

### Adverb meaning

Xác định cách thức hoặc mức độ của hành động/tính từ/trạng từ khác.

### Collocation

Ví dụ dạng dữ liệu:

```text
meet a deadline
reach an agreement
make a reservation
conduct a survey
submit an application
```

Không nên lưu riêng từng từ; phải lưu cả **word + collocation**.

---

# 6. PART 5 — Part of Speech

```text
Part 5
└── Parts of Speech
    ├── Noun
    ├── Verb
    ├── Adjective
    ├── Adverb
    ├── Pronoun
    ├── Preposition
    └── Conjunction
```

## 6.1. Noun

Học:

- countable / uncountable.
- singular / plural.
- noun suffix.
- position of noun.
- noun after determiner.
- noun after article.
- noun after possessive.
- noun as subject.
- noun as object.

## 6.2. Verb

Học:

- main verb.
- auxiliary.
- modal.
- transitive.
- intransitive.
- subject-verb agreement.

## 6.3. Adjective

Học:

- adjective before noun.
- adjective after linking verb.
- adjective after specific structures.

## 6.4. Adverb

Học:

- manner.
- frequency.
- degree.
- sentence adverb.
- position of adverb.

---

# 7. PART 5 — Grammar taxonomy

## 7.1. Pronouns

```text
Subject Pronoun
Object Pronoun
Possessive Adjective
Possessive Pronoun
Reflexive Pronoun
Demonstrative
Indefinite Pronoun
Relative Pronoun
```

Dạng bẫy:

```text
he / him
they / them
their / theirs
its / it's
who / whom
```

---

# 8. Verb Tenses

```text
Present Simple
Present Continuous
Present Perfect
Present Perfect Continuous
Past Simple
Past Continuous
Past Perfect
Past Perfect Continuous
Future Simple
Future Continuous
Future Perfect
Future Perfect Continuous
```

Mỗi lesson phải có:

```text
Formula
Usage
Signal Words
Timeline
Examples
TOEIC Traps
Contrast With Similar Tenses
Practice
Mixed Practice
```

---

# 9. Verb Forms

```text
to + V
V-ing
bare V
V-ed
V3
```

Các cấu trúc:

```text
verb + to V
verb + V-ing
preposition + V-ing
modal + V
let + object + V
make + object + V
have + object + V3
```

---

# 10. Active / Passive

```text
Active
Passive
Passive with Modal
Perfect Passive
Future Passive
```

Dạy:

```text
Subject
+
be
+
V3
```

và cách nhận diện chủ thể thực hiện hành động.

---

# 11. Participles

```text
Present Participle
Past Participle
Reduced Relative Clause
Participle Phrase
```

Tách riêng:

```text
V-ing = active / ongoing meaning
V-ed = passive / completed-state meaning
```

Đây là nhóm dễ gây nhầm trong Part 5 và nên có lesson riêng.

---

# 12. Prepositions

## Time

```text
at
on
in
by
until
during
for
since
```

## Place

```text
at
in
on
between
among
```

## Cause

```text
because of
due to
owing to
```

## Collocations

```text
responsible for
interested in
capable of
familiar with
in charge of
```

Mỗi preposition phải có:

```text
rule
structure
examples
contrast
trap
practice
```

---

# 13. Conjunctions

## Coordinating

```text
and
but
or
so
yet
```

## Subordinating

```text
because
although
while
when
if
unless
since
before
after
```

## Correlative

```text
either...or
neither...nor
both...and
not only...but also
```

## Nhóm dễ nhầm

```text
because / because of
although / despite
while / during
unless / if
so / such
```

---

# 14. Relative Clauses

```text
who
whom
which
that
whose
where
when
```

Học:

```text
Defining
Non-defining
Omitted Relative Pronoun
Reduced Relative Clause
```

---

# 15. Comparison

```text
comparative
superlative
as...as
less
fewer
more
the more...the more
```

---

# 16. Imperative / Request / Instruction structures

```text
Please + V
Do not + V
Be + adjective
Please do not + V
```

Ứng dụng:

- notice.
- instruction.
- office memo.
- email.
- announcement.

---

# 17. Part 5 — quy trình làm bài phải được dạy

Mỗi dạng phải có **Algorithm**.

Ví dụ dạng Part of Speech:

```text
Bước 1
Nhìn 4 đáp án.

Bước 2
Nếu cùng một word nhưng khác suffix:
→ nghĩ ngay đến word form.

Bước 3
Xác định vị trí trống trong câu.

Bước 4
Xác định thành phần cần điền:
noun / verb / adjective / adverb.

Bước 5
Chọn đáp án.

Bước 6
Đọc lại toàn câu.

Bước 7
Kiểm tra nghĩa.
```

Ví dụ dạng Tense:

```text
Bước 1
Tìm subject.

Bước 2
Tìm động từ chính.

Bước 3
Tìm dấu hiệu thời gian.

Bước 4
Xác định quan hệ giữa các hành động.

Bước 5
Kiểm tra active / passive.

Bước 6
Chọn tense.

Bước 7
Đọc lại toàn câu.
```

---

# 18. PART 6 — taxonomy

```text
Part 6
├── Vocabulary
├── Grammar
├── Sentence Insertion
├── Cohesion
├── Context
└── Mixed
```

STUDY4 hiện có riêng nội dung hướng dẫn Part 6 cho câu điền câu vào đoạn văn và mô tả Part 6 theo nhóm kiến thức/chiến lược.

Nguồn:
https://study4.com/posts/2851/cach-lam-dang-cau-hoi-dien-cau-vao-doan-van-trong-toeic-reading-part-6/

## 18.1. Vocabulary in Context

Không hỏi nghĩa từ đơn thuần mà hỏi từ phù hợp với toàn đoạn.

Skill:

```text
local context
sentence context
paragraph context
collocation
semantic fit
```

## 18.2. Grammar in Context

Dùng taxonomy Part 5:

```text
Tense
Part of Speech
Preposition
Conjunction
Pronoun
Verb Form
Passive
Relative Clause
Comparison
```

## 18.3. Sentence Insertion

Algorithm:

```text
1. Đọc toàn đoạn.
2. Xác định câu trước chỗ trống.
3. Xác định câu sau chỗ trống.
4. Tìm đại từ / từ nối / từ khóa tham chiếu.
5. Kiểm tra logic.
6. Kiểm tra dòng thời gian.
7. Kiểm tra ý của câu.
8. Chọn vị trí.
```

## 18.4. Cohesion

Phân loại:

```text
Pronoun Reference
Transition
Conjunction
Keyword Repetition
Synonym
Cause → Effect
Problem → Solution
Chronological Order
```

---

# 19. PART 6 — document type

Tag passage:

```text
Email
Letter
Memo
Notice
Announcement
Advertisement
Article
Form
Message
Report
```

Document type không phải question type.

Một câu có thể đồng thời:

```text
Part 6
+ Vocabulary
+ Email
+ Business Topic
+ Medium Difficulty
```

---

# 20. PART 7 — taxonomy

STUDY4 hiện công khai nhiều dạng câu hỏi Part 7 như overview/main idea, detailed information, NOT/TRUE, inference và synonym/context; các tài liệu khác của họ còn hướng dẫn hàm ý câu nói.

Nguồn:
- https://study4.com/posts/2436/cach-lam-dang-bai-overview-question-trong-toeic-reading-part-7/
- https://study4.com/posts/2440/cach-lam-cau-hoi-thong-tin-chi-tiet-detailed-question-trong-toeic-reading-part-7/
- https://study4.com/posts/2439/cach-lam-cau-hoi-thong-tin-khong-duoc-de-cap-not-true-question-toeic-reading-part-7/
- https://study4.com/posts/3721/cach-lam-dang-cau-hoi-ve-ham-y-cau-noi-trong-toeic-reading-part-7/

## 20.1. Overview / Main Idea

```text
What is the main purpose?
What is the article about?
What is being advertised?
What is being discussed?
```

Skill:

```text
global understanding
document identification
purpose identification
```

## 20.2. Detail

```text
Who?
What?
When?
Where?
How much?
How many?
Which?
```

## 20.3. NOT / TRUE

```text
Which is NOT mentioned?
What is NOT true?
All are true EXCEPT...
```

## 20.4. Inference

```text
What can be inferred?
What is suggested?
What is most likely true?
```

## 20.5. Vocabulary in Context

```text
The word "X" is closest in meaning to...
```

## 20.6. Reference

```text
The word "they" refers to...
```

## 20.7. Purpose

```text
Why was the email sent?
Why did the writer mention...?
```

## 20.8. Paraphrase

Đáp án diễn đạt lại cùng thông tin bằng từ khác.

## 20.9. Implication

```text
What does the speaker imply?
What does the writer imply?
```

## 20.10. Sentence Insertion

Tìm vị trí hợp lý của câu.

---

# 21. PART 7 — document / passage taxonomy

## Single Passage

```text
Advertisement
Article
Email
Letter
Notice
Announcement
Memo
Form
Review
Web page
Message
```

## Double Passage

```text
Email + Email
Email + Advertisement
Article + Email
Notice + Form
Advertisement + Email
Article + Review
```

## Triple Passage

```text
Email + Reply + Notice
Article + Email + Advertisement
Memo + Form + Email
Report + Chart + Email
```

Phần document type phải là metadata độc lập để có thể tạo bài:

```text
Part 7 → Inference → Email
Part 7 → Detail → Advertisement
Part 7 → Purpose → Notice
```

---

# 22. PART 7 — reading skill curriculum

Ngoài question type, cần dạy skill.

```text
Skimming
Scanning
Keyword Search
Paraphrase Recognition
Reference Resolution
Inference
Cross-document Comparison
Evidence Matching
Time Management
```

---

# 23. Dạy cách làm Part 7

## Bước 1 — nhận diện document

Xác định:

```text
Email?
Advertisement?
Article?
Notice?
Memo?
```

## Bước 2 — nhận diện mục đích

Ví dụ:

```text
complaint
request
announcement
promotion
instruction
invitation
confirmation
```

## Bước 3 — đọc câu hỏi

Phân loại:

```text
Detail
Purpose
Inference
Vocabulary
Reference
NOT
```

## Bước 4 — tìm evidence

Không đoán đáp án chỉ vì "nghe hợp lý".

## Bước 5 — đối chiếu paraphrase

```text
Question
→ Keyword
→ Original Evidence
→ Paraphrase
→ Answer
```

## Bước 6 — kiểm tra distractor

Mỗi đáp án sai cần được phân loại:

```text
Not Mentioned
Partially True
Wrong Person
Wrong Time
Wrong Location
Wrong Quantity
Opposite Meaning
Irrelevant
```

---

# 24. LISTENING — phải có taxonomy tương tự Reading

Không nên chỉ:

```text
Listening
→ Part 1
→ Part 2
→ Part 3
→ Part 4
```

Phải:

```text
Listening
├── Part
├── Question Type
├── Audio Type
├── Skill
├── Trap Type
├── Vocabulary
├── Pronunciation Feature
└── Difficulty
```

---

# 25. PART 1 — Photographs

Nhóm kiến thức:

```text
People
Objects
Location
Action
Position
Arrangement
Movement
State
```

Question/skill categories:

```text
Action
Position
Object
Location
Relationship between objects
```

Vocabulary:

```text
standing
sitting
walking
opening
closing
holding
carrying
loading
unloading
wearing
reaching
examining
```

---

# 26. PART 1 — visual vocabulary

Chia theo:

```text
Office
Transportation
Restaurant
Shopping
Construction
Factory
Street
Park
Hotel
Airport
Meeting
Warehouse
```

Mỗi vocabulary item có:

```text
word
IPA
audio
Vietnamese
image
example
Part 1 frequency
```

---

# 27. PART 2 — Question Response

Phân nhóm theo dạng mở đầu:

```text
WH Question
Yes/No Question
Choice Question
Statement
Negative Question
Tag Question
Request
Suggestion
Invitation
```

## WH taxonomy

```text
Who
What
When
Where
Why
How
How much
How many
How often
How long
How far
```

## Strategy

Không phải mọi câu trả lời đều lặp từ khóa.

Phải dạy:

```text
Question Intent
→ Expected Answer Type
```

Ví dụ:

```text
When?
→ Time / date

Where?
→ Location

Who?
→ Person / role

Why?
→ Reason

How much?
→ Amount / price

How often?
→ Frequency
```

---

# 28. PART 2 — trap taxonomy

```text
Same Keyword
Similar Sound
Wrong Question Type
Wrong Person
Wrong Place
Wrong Time
Wrong Reason
Indirect Answer
Partial Answer
```

Đây phải là metadata để thống kê:

```text
User mắc bẫy Same Keyword: 7/10
```

---

# 29. PART 3 — Conversations

STUDY4 hiện mô tả các dạng như chủ đề/mục đích, danh tính/địa điểm, chi tiết, yêu cầu/gợi ý, hành động tương lai, hàm ý và câu hỏi kết hợp bảng biểu.

Nguồn:
https://study4.com/lp/complete-toeic-v2/

Taxonomy:

```text
Part 3
├── Topic
├── Purpose
├── Location
├── Speaker Identity
├── Detail
├── Request
├── Suggestion
├── Future Action
├── Inference
├── Implication
├── Graphic
└── Multi-information
```

---

# 30. PART 3 — conversation types

```text
Office
Customer Service
Travel
Hotel
Restaurant
Shopping
Banking
Transportation
Meeting
Scheduling
Delivery
Maintenance
Job / Recruitment
Event
Training
```

---

# 31. PART 3 — speaker relation

Hệ thống phải tag:

```text
Employee ↔ Manager
Customer ↔ Staff
Buyer ↔ Seller
Traveler ↔ Agent
Tenant ↔ Landlord
Patient ↔ Staff
Colleague ↔ Colleague
Applicant ↔ Recruiter
```

Vì speaker identity thường liên quan trực tiếp đến câu hỏi.

---

# 32. PART 4 — Talks

STUDY4 hiện phân Part 4 thành các dạng question và audio/document như:

```text
Topic / Purpose
Identity / Location
Detail
Request / Suggestion
Future Action
Implication
Graphic
Telephone Message
Advertisement
Announcement
Talk
News Report / Broadcast
Meeting Excerpt
```

Nguồn:
https://study4.com/lp/complete-toeic-v2/

---

# 33. PART 4 — audio type taxonomy

```text
Telephone Message
Advertisement
Announcement
Speech
News Report
Broadcast
Meeting
Tour / Guide
Instruction
Company Message
Weather
Traffic
```

---

# 34. Listening Skill taxonomy

Không chỉ question type.

Phải có:

```text
Keyword Recognition
Paraphrase Recognition
Number Recognition
Date Recognition
Name Recognition
Place Recognition
Speaker Identification
Attitude
Intention
Inference
Prediction
Connected Speech
Reduced Speech
Fast Speech
Distractor Recognition
```

---

# 35. Listening pronunciation training

Tách thành module:

```text
Linking
Reduction
Weak Forms
Contractions
Word Stress
Sentence Stress
Intonation
Final Sounds
Plural Sounds
Past Tense Sounds
```

Mục tiêu:

```text
Nghe không ra
→
chỉ ra âm nào bị mất
→
nghe lại
→
xem transcript
→
nghe chậm
→
nghe tốc độ chuẩn
```

---

# 36. Dictation

STUDY4 hiện dùng dictation như một thành phần của Complete TOEIC.

Website mới nên có:

```text
Word Dictation
Phrase Dictation
Sentence Dictation
Short Audio Dictation
Conversation Dictation
Talk Dictation
```

Các mode:

```text
Fill Missing Word
Fill Missing Phrase
Type Full Sentence
```

Có thể thêm:

```text
audio speed
repeat
loop
subtitle
transcript
highlight
```

STUDY4 hiện công khai các chế độ nghe có subtitles, repeat, highlight và tạo flashcard cho từ/cụm từ trong nội dung học. Đây là tính năng có thể tham khảo về UX nhưng cần triển khai theo thiết kế riêng của sản phẩm.

---

# 37. FREQUENT VOCABULARY — yêu cầu quan trọng

Không nên tạo một list kiểu:

```text
1000 từ TOEIC
```

rồi bỏ đó.

Phải xây:

```text
Frequent Vocabulary Engine
```

Nguồn dữ liệu:

```text
Question Bank
+
Official / licensed practice materials
+
Internal test sets
+
User attempts
```

Không được tuyên bố một từ "chắc chắn sẽ xuất hiện trong đề thi thật" nếu không có dữ liệu hợp lệ chứng minh.

---

# 38. Frequency score

Mỗi vocabulary item tính:

```text
frequency_count
```

Số lần xuất hiện trong kho dữ liệu.

Thêm:

```text
document_frequency
```

Số test/passage khác nhau chứa từ đó.

Ví dụ:

```text
Word: shipment

Appears in:
27 / 100 tests

Question count:
63

Parts:
P3, P4, P5, P6, P7
```

---

# 39. Frequency ranking

Có thể tính:

```text
frequency_score
=
normalized(question_count)
+
normalized(document_frequency)
+
cross_part_score
```

Không nên dùng raw count duy nhất.

Một từ xuất hiện 50 lần trong cùng một passage không nên được coi quan trọng hơn một từ xuất hiện ở 20 passage khác nhau.

---

# 40. Vocabulary frequency levels

```text
A — Extremely Frequent
B — Very Frequent
C — Frequent
D — Occasional
E — Rare
```

Hoặc:

```text
Top 100
Top 300
Top 500
Top 1000
Top 1500
Long Tail
```

---

# 41. Frequent Vocabulary theo LC

```text
LC Vocabulary
├── Part 1 Visual Vocabulary
├── Part 2 Response Vocabulary
├── Part 3 Conversation Vocabulary
└── Part 4 Talk Vocabulary
```

Thông tin:

```text
word
meaning
IPA
audio
part_frequency
topic
speaker_context
common_phrase
```

---

# 42. Frequent Vocabulary theo RC

```text
RC Vocabulary
├── Part 5 Vocabulary
├── Part 6 Context Vocabulary
└── Part 7 Reading Vocabulary
```

Tag thêm:

```text
grammar_role
collocation
document_type
business_topic
```

---

# 43. Vocabulary theo chủ đề

Tối thiểu:

```text
Office
Business
Management
Marketing
Sales
Finance
Accounting
Human Resources
Recruitment
Meetings
Travel
Transportation
Airport
Hotel
Restaurant
Shopping
Manufacturing
Production
Logistics
Shipping
Customer Service
Technology
IT
Construction
Real Estate
Banking
Insurance
Education
Health
Environment
Events
```

---

# 44. Vocabulary theo chức năng giao tiếp

```text
Request
Complaint
Suggestion
Confirmation
Invitation
Reservation
Cancellation
Purchase
Payment
Refund
Delivery
Schedule
Appointment
Recruitment
Promotion
Instruction
Warning
Announcement
```

---

# 45. Vocabulary page

UI:

```text
Word
Audio
IPA
Meaning
Part of Speech
Example
Collocations
Synonyms
Antonyms
Word Family
TOEIC Parts
Frequency
Difficulty
```

Nút:

```text
Listen
Add to Review
Mark Known
Practice
View Questions
```

---

# 46. Vocabulary detail → liên kết câu hỏi

Ví dụ:

```text
shipment
```

Trang từ phải có:

```text
Appears in:
Part 3
Part 4
Part 5
Part 6
Part 7

Related Topics:
Logistics
Shipping

Related Questions:
37 questions
```

Đây là điểm cực quan trọng.

Người học thấy từ trong flashcard phải có thể đi thẳng vào các câu TOEIC chứa từ đó.

---

# 47. Vocabulary Review

Trạng thái:

```text
NEW
LEARNING
REVIEW
MASTERED
```

Mỗi lần học lưu:

```text
correct
wrong
response_time
self_rating
last_review
next_review
```

---

# 48. Flashcard

Mặt trước:

```text
WORD
IPA
AUDIO
```

Mặt sau:

```text
English Meaning
Vietnamese Meaning
Example
Translation
Image
Collocations
Related Words
```

---

# 49. Vocabulary mini games

Tối thiểu:

```text
English → Vietnamese
Vietnamese → English
Word → Definition
Definition → Word
Matching
Multiple Choice
Listening Choice
Dictation
Spelling
Collocation Completion
Synonym
Antonym
```

---

# 50. Grammar frequency

Ngoài vocabulary, phải thống kê:

```text
Grammar Topic
Question Count
Part Distribution
Accuracy
Average Time
```

Ví dụ:

```text
Preposition
Questions: 823
Part 5: 601
Part 6: 222
User Accuracy: 61%
```

Không được dùng số giả trong UI. Đây chỉ là ví dụ schema.

---

# 51. Question frequency dashboard

Admin:

```text
Top Question Types
Top Vocabulary
Top Grammar Topics
Top Document Types
Top Trap Types
```

Student:

```text
Your Most Frequent Errors
Your Weakest Question Types
Your Weakest Vocabulary
Your Slowest Question Types
```

---

# 52. Test-to-Learning linkage

Mỗi test question phải liên kết:

```text
Question
↓
Question Type
↓
Knowledge
↓
Vocabulary
↓
Strategy
↓
Lesson
```

Ví dụ:

```text
Question #105
→ Part 5
→ Preposition
→ Time Preposition
→ by / until / during
→ Lesson: Time Prepositions
→ Practice Set: P5-Time-01
```

---

# 53. Wrong answer → learning recommendation

Ví dụ:

```text
User wrong 4 questions:
because / because of
although / despite
```

Engine:

```text
Detect pattern
↓
Grammar Topic = Conjunction / Preposition
↓
Show lesson
↓
5 guided questions
↓
10 targeted questions
↓
10 mixed questions
```

---

# 54. Wrong answer → vocabulary recommendation

Nếu user sai câu vì:

```text
unfamiliar vocabulary
```

Hệ thống:

```text
extract vocabulary
↓
add to Weak Vocabulary
↓
show meaning
↓
show example
↓
flashcard
↓
mini quiz
↓
same word in original question
```

---

# 55. Wrong answer → listening recommendation

Nếu sai vì nghe:

```text
number
```

không đưa thêm 20 câu random.

Đưa:

```text
Number Recognition
→ 10 easy
→ 10 standard
→ 10 TOEIC
```

Nếu sai vì:

```text
connected speech
```

đưa:

```text
Listening Skill
→ Connected Speech
→ Dictation
→ TOEIC audio
```

---

# 56. Learning dashboard

Trang Home sau login:

```text
Today's Study
├── Vocabulary Review
├── Grammar Lesson
├── Weak Question Types
├── Listening Practice
└── Reading Practice
```

Ví dụ:

```text
Vocabulary:
24 words due

Weakest RC:
Part 7 Inference

Weakest LC:
Part 2 Indirect Response

Recommended:
15 minutes
```

---

# 57. Diagnostic Test

Trước khi học:

```text
Diagnostic
├── Vocabulary
├── Grammar
├── Listening
├── Reading
├── Part 5
├── Part 6
├── Part 7
└── Question Types
```

Output:

```text
Grammar: weak
Vocabulary: medium
P5: medium
P6: weak
P7 Inference: weak
P3 Detail: strong
P2 Indirect Response: weak
```

---

# 58. Learning Path

Ví dụ người mất gốc:

```text
1. Parts of Speech
2. Basic Tenses
3. Verb Forms
4. Prepositions
5. Conjunctions
6. Basic TOEIC Vocabulary
7. Part 5
8. Part 6
9. Part 7
10. Listening Part 1
11. Listening Part 2
12. Listening Part 3
13. Listening Part 4
14. Mixed Practice
15. Full Tests
```

Ví dụ người đã có nền tảng:

```text
Diagnostic
↓
Weakness Map
↓
Targeted Lessons
↓
Targeted Practice
↓
Mixed Practice
↓
Full Test
```

---

# 59. Practice modes

## Mode A — Learn

Không áp lực thời gian.

Có:

```text
Hint
Explanation
Translation
Transcript
Strategy
```

## Mode B — Guided Practice

Hiển thị từng bước:

```text
Question
↓
Identify Type
↓
Identify Evidence
↓
Choose Answer
```

## Mode C — Standard Practice

Giống bài luyện TOEIC.

## Mode D — Timed Practice

Có timer.

## Mode E — Exam Mode

Ẩn explanation.

## Mode F — Review

Tập trung câu sai.

---

# 60. Practice filters

Phải có:

```text
Part
Question Type
Sub Type
Topic
Difficulty
Vocabulary
Grammar
Document Type
Wrong Questions
Marked Questions
New Questions
Slow Questions
```

---

# 61. User-created practice

Ví dụ:

```text
Create Practice
```

Chọn:

```text
Part 5
Grammar
Preposition
20 questions
Medium
```

Hoặc:

```text
Part 7
Inference
Double Passage
10 sets
Hard
```

---

# 62. Smart Test Generator

Input:

```text
Part
Question Type
Difficulty
Number of Questions
Time
```

Advanced:

```text
Weakness only
Recently missed
Vocabulary frequency
Grammar frequency
Unused questions
```

Output:

```text
Generated Practice Set
```

---

# 63. Test Result

Hiển thị:

```text
Score
Accuracy
Correct
Wrong
Skipped
Time
Average Time
```

Breakdown:

```text
Part
Question Type
Knowledge
Vocabulary
Difficulty
```

---

# 64. Review page

Mỗi câu:

```text
Your Answer
Correct Answer
Explanation
Evidence
Knowledge
Question Type
Trap Type
Vocabulary
```

Listening:

```text
Play Audio
Replay
Transcript
Translation
Highlight
```

Reading:

```text
Passage
Highlight Evidence
Question
Answer
Explanation
```

---

# 65. Slow Question

Đánh dấu:

```text
Correct + Slow
Wrong + Fast
Wrong + Slow
Correct + Fast
```

Đây là dữ liệu quan trọng hơn chỉ Correct/Wrong.

---

# 66. Mastery Score

Mỗi skill:

```text
Knowledge
Accuracy
Speed
Consistency
```

Ví dụ:

```text
Part 7 Inference

Knowledge: 71
Accuracy: 63
Speed: 48
Consistency: 55
```

---

# 67. Question-level tags

Mỗi câu cần tối thiểu:

```text
id
skill
part
question_type
sub_type
knowledge_topic
vocabulary_ids
grammar_ids
passage_type
difficulty
source
test_id
explanation
correct_answer
estimated_time
trap_type
```

Listening thêm:

```text
audio_id
speaker_count
accent
speech_rate
audio_type
graphic_type
```

Reading thêm:

```text
passage_id
paragraph_count
document_count
document_type
evidence_locations
```

---

# 68. Vocabulary-level tags

```text
id
word
lemma
ipa
audio
part_of_speech
meaning_vi
meaning_en
example
collocations
synonyms
antonyms
word_family
topic
parts
frequency_count
document_frequency
difficulty
```

---

# 69. Frequency engine

Không hard-code:

```text
"Đây là 1000 từ chắc chắn ra đề."
```

Thay bằng:

```text
"Top Frequent Vocabulary in Our Question Bank"
```

Tính từ dữ liệu thực tế:

```text
Question Count
Document Count
Part Count
Test Count
Recent Frequency
```

---

# 70. Ví dụ frequency report

```text
Word: reservation

Question Count: dynamic
Test Count: dynamic
Parts: P2, P3, P5, P7
Topics:
- Travel
- Hotel
- Customer Service

Related Collocations:
- make a reservation
- cancel a reservation
- confirm a reservation
```

Các con số phải lấy từ DB tại runtime.

---

# 71. Frequent vocabulary page

Tab:

```text
Most Frequent
By Part
By Topic
By Difficulty
By User Weakness
Recently Seen
```

---

# 72. Frequent Vocabulary — LC

Ví dụ taxonomy:

```text
Part 1
├── office objects
├── furniture
├── transportation
├── clothing
├── construction
└── outdoor activities

Part 2
├── requests
├── schedules
├── locations
├── people
├── quantities
└── workplace actions

Part 3
├── appointments
├── meetings
├── purchases
├── customer service
├── delivery
└── workplace problems

Part 4
├── announcements
├── advertisements
├── phone messages
├── news
├── meetings
└── instructions
```

Các nhóm này nên là taxonomy của hệ thống, còn tần suất từ cụ thể phải được tính từ dữ liệu.

---

# 73. Frequent Vocabulary — RC

```text
Part 5
├── business vocabulary
├── word families
├── collocations
├── grammar-dependent words
└── confusing words

Part 6
├── context vocabulary
├── connectors
├── transitions
├── business expressions
└── document phrases

Part 7
├── workplace vocabulary
├── customer service
├── travel
├── finance
├── marketing
├── logistics
├── technology
└── event vocabulary
```

---

# 74. Vocabulary + question type linkage

Ví dụ:

```text
Word:
promotion
```

Có thể liên kết:

```text
P2:
promotion announcement

P5:
word meaning

P6:
context vocabulary

P7:
synonym / detail / inference
```

Người học phải nhìn thấy:

```text
"Bạn đã gặp từ này trong 12 câu luyện tập."
```

Số liệu phải là động từ DB.

---

# 75. Grammar + question type linkage

Ví dụ:

```text
Prepositions
```

Linked questions:

```text
Part 5 → Preposition
Part 6 → Grammar in Context
```

Không nên nhồi grammar vào Part 7 nếu câu hỏi thực tế không kiểm tra grammar.

---

# 76. Lesson schema

Mỗi lesson:

```text
lesson_id
title
skill
part
question_type
knowledge_topic
objective
prerequisites
content
examples
common_traps
strategy
practice_set
review_set
```

---

# 77. Lesson UI

Header:

```text
Part 5 → Prepositions → Time
```

Progress:

```text
Lesson 3 / 8
```

Nội dung:

```text
Concept
↓
Example
↓
Trap
↓
Strategy
↓
Practice
```

Footer:

```text
Start Practice
```

---

# 78. Micro-learning

Một lesson không nên quá dài.

Có thể chia:

```text
Concept 1
Practice 1

Concept 2
Practice 2

Concept 3
Practice 3
```

---

# 79. Knowledge prerequisites

Ví dụ:

```text
Subject-Verb Agreement
requires:
→ Noun
→ Pronoun
→ Verb
```

Ví dụ:

```text
Reduced Relative Clause
requires:
→ Relative Clause
→ Participle
→ Passive
```

---

# 80. Adaptive learning

Nếu user:

```text
Part 5 Word Form = 40%
```

Hệ thống:

```text
Prerequisite Check
↓
Parts of Speech
↓
Noun / Verb / Adj / Adv
↓
Word Form
↓
Targeted Practice
```

Không đưa ngay full test.

---

# 81. Error taxonomy

Mỗi wrong answer phải được gắn error type.

## Reading

```text
Knowledge Gap
Vocabulary Gap
Misread
Misinterpretation
Wrong Evidence
Distractor
Time Pressure
Careless Error
```

## Listening

```text
Missed Keyword
Pronunciation
Connected Speech
Fast Speech
Vocabulary
Question Misunderstanding
Distractor
Number / Date
Speaker Identity
Inference
```

---

# 82. Self-diagnosis

Sau mỗi câu cho phép user chọn:

```text
I didn't know the word
I didn't know the grammar
I misunderstood the question
I couldn't find evidence
I ran out of time
I guessed
```

Dữ liệu này rất hữu ích để phân biệt:

```text
sai vì kiến thức
```

với:

```text
sai vì kỹ năng
```

---

# 83. Review Queue

Hàng ngày:

```text
Vocabulary Due
Grammar Due
Wrong Questions
Slow Questions
Weak Question Types
```

Priority:

```text
High:
Repeatedly Wrong

Medium:
Wrong once

Low:
Correct but Slow
```

---

# 84. Recommended Daily Plan

Ví dụ:

```text
10 phút
Vocabulary

15 phút
Grammar / Knowledge

15 phút
Question Type Practice

15 phút
Listening / Reading

10 phút
Review Errors
```

Không bắt buộc cứng; hệ thống nên điều chỉnh theo dữ liệu cá nhân.

---

# 85. Dashboard — Student

```text
Today
├── Vocabulary Due
├── Weak Grammar
├── Weak LC Type
├── Weak RC Type
└── Recommended Practice
```

---

# 86. Dashboard — Progress

```text
Listening
├── Part 1
├── Part 2
├── Part 3
└── Part 4

Reading
├── Part 5
├── Part 6
└── Part 7
```

Mỗi part:

```text
Accuracy
Speed
Mastery
Attempts
```

---

# 87. Dashboard — Vocabulary

```text
Total Learned
Due
Mastered
Weak
Frequent Words
New Words
```

---

# 88. Dashboard — Question Types

Ví dụ:

```text
Part 5
Word Form       81%
Tense           73%
Preposition     57%
Conjunction     62%

Part 7
Detail          84%
Purpose         71%
Inference       49%
Synonym         64%
```

Không hard-code số.

---

# 89. Admin Analytics

Admin cần:

```text
Most difficult question types
Most frequently missed vocabulary
Most common traps
Average response time
Question discrimination
Question accuracy
```

---

# 90. Question quality control

Mỗi câu phải qua:

```text
Content Review
Grammar Review
Answer Verification
Explanation Review
Audio Review
Transcript Review
Metadata Review
```

---

# 91. Question bank import

CSV/JSON fields:

```text
question_id
part
question_type
sub_type
difficulty
question
A
B
C
D
answer
explanation
knowledge
vocabulary
passage
audio
source
```

---

# 92. Passage import

```text
passage_id
part
document_type
content
difficulty
source
```

Question liên kết bằng:

```text
passage_id
```

---

# 93. Test builder

Admin chọn:

```text
Test Type
Number of Questions
Parts
Difficulty Distribution
Question Type Distribution
Vocabulary Distribution
```

---

# 94. Mixed Test Distribution

Không hard-code một tỷ lệ duy nhất.

Distribution phải dựa trên:

```text
Target TOEIC format
```

và cấu hình version của question bank.

---

# 95. "Frequent Vocabulary from Tests" — cách làm đúng

Tính năng này phải có 3 tầng:

## Tầng 1 — Global Frequency

Toàn bộ database.

## Tầng 2 — Part Frequency

```text
Part 3
Part 4
Part 5
Part 6
Part 7
```

## Tầng 3 — Personal Frequency

Các từ user đã gặp nhiều lần.

Ví dụ:

```text
Global:
reservation = high

Personal:
reservation = unknown
```

Hệ thống phải ưu tiên:

```text
High Global Frequency
+
Personal Weakness
```

---

# 96. Frequent Vocabulary — don't claim certainty

Không dùng:

```text
"100% chắc chắn ra đề."
"99% sẽ có trong đề thật."
```

trừ khi đang trích nguyên tuyên bố marketing của một bên cụ thể.

Trong sản phẩm nên hiển thị:

```text
Frequently Seen in Our Practice Bank
```

hoặc:

```text
High Frequency in Selected Test Corpus
```

---

# 97. Example user flow

## Người dùng yếu Part 5

```text
Diagnostic
↓
Part 5 = 51%
↓
Weak:
Word Form
Prepositions
Verb Forms
↓
Learn Word Form
↓
10 Guided Questions
↓
20 Standard Questions
↓
Mini Test
↓
Score
↓
Review Mistakes
```

---

# 98. Example user flow — Part 7

```text
Diagnostic
↓
Inference = 43%
↓
Lesson:
How to identify inference
↓
Example
↓
Guided Practice
↓
Single Passage
↓
Double Passage
↓
Timed Practice
↓
Mini Test
↓
Analysis
```

---

# 99. Example user flow — Listening

```text
Diagnostic
↓
Part 2 Indirect Response weak
↓
Lesson:
Question Intent
↓
WH Questions
↓
Yes/No
↓
Indirect Response
↓
Trap Training
↓
Practice
↓
Dictation
↓
Timed Part 2
```

---

# 100. UI — Learning page

```text
┌─────────────────────────────────────────┐
│ Part 5 → Prepositions                   │
│ Progress 3 / 8                          │
├─────────────────────────────────────────┤
│ Concept                                 │
│                                         │
│ Example                                 │
│                                         │
│ Common Trap                             │
│                                         │
│ Strategy                                │
├─────────────────────────────────────────┤
│ [Practice] [Quiz] [Review]              │
└─────────────────────────────────────────┘
```

---

# 101. UI — Practice page

```text
┌──────────────────────────────────────────────────┐
│ Part 5 | Prepositions | 12 / 20                  │
├──────────────────────────────────────────────────┤
│ The manager will review the report _____ Friday. │
│                                                  │
│ A. in                                             │
│ B. on                                             │
│ C. at                                             │
│ D. during                                         │
│                                                  │
│ [Mark] [Next]                                    │
└──────────────────────────────────────────────────┘
```

---

# 102. UI — Answer Review

```text
Correct Answer: B

Why?
...

Rule:
...

Why A is wrong:
...

Why C is wrong:
...

Why D is wrong:
...

Question Type:
Preposition

Knowledge:
Time Preposition

Vocabulary:
review
report
manager
```

---

# 103. UI — Frequent Vocabulary

```text
Frequently Seen Vocabulary

Search...

┌────────────┬──────────┬──────────┬──────────────┐
│ Word       │ Frequency│ Parts    │ Your Status  │
├────────────┼──────────┼──────────┼──────────────┤
│ ...        │ Dynamic  │ P3/P5/P7 │ Weak         │
└────────────┴──────────┴──────────┴──────────────┘
```

---

# 104. UI — Weakness page

```text
Your Weaknesses

Listening
- Part 2 Indirect Response
- Part 3 Inference

Reading
- Part 5 Prepositions
- Part 7 Inference
- Part 6 Sentence Insertion

Vocabulary
- Logistics
- Finance
```

Button:

```text
[Practice Weaknesses]
```

---

# 105. Backend modules

Đề xuất:

```text
learning
lessons
knowledge-topics
question-types
questions
passages
vocabulary
vocabulary-practice
grammar
practice
tests
attempts
reviews
recommendations
analytics
```

---

# 106. Database relations

```text
Question
 ├── Part
 ├── QuestionType
 ├── KnowledgeTopic
 ├── Vocabulary[]
 ├── GrammarTopic[]
 ├── Passage
 └── Test
```

User:

```text
User
 ├── QuestionAttempt
 ├── VocabularyProgress
 ├── TopicProgress
 ├── LessonProgress
 ├── ReviewQueue
 └── TestAttempt
```

---

# 107. Core APIs

## Learning

```text
GET /learning/lessons
GET /learning/lessons/:id
GET /learning/topics
GET /learning/topics/:id
```

## Practice

```text
GET /practice/questions
POST /practice/attempts
GET /practice/review
```

## Vocabulary

```text
GET /vocabulary
GET /vocabulary/:id
POST /vocabulary/:id/review
GET /vocabulary/frequent
GET /vocabulary/weak
```

## Analytics

```text
GET /analytics/overview
GET /analytics/parts
GET /analytics/question-types
GET /analytics/vocabulary
GET /analytics/grammar
```

---

# 108. Recommendation API

```text
GET /recommendations/today
GET /recommendations/weakness
GET /recommendations/vocabulary
GET /recommendations/next-lesson
```

---

# 109. Minimum implementation order

## Phase 1 — Foundation

```text
Question taxonomy
Knowledge topics
Vocabulary entity
Grammar entity
Question metadata
```

## Phase 2 — Learning Content

```text
Grammar lessons
Vocabulary lessons
Part 1–7 strategy lessons
```

## Phase 3 — Practice by Type

```text
P1 types
P2 types
P3 types
P4 types
P5 types
P6 types
P7 types
```

## Phase 4 — Frequent Vocabulary

```text
Frequency engine
Part frequency
Topic frequency
Personal weak words
```

## Phase 5 — Analytics

```text
Accuracy
Speed
Mistakes
Weakness
Mastery
```

## Phase 6 — Adaptive Learning

```text
Recommendation
Review queue
Diagnostic
Personal learning path
```

---

# 110. Không nên làm theo thứ tự này

Không nên:

```text
Full Test
→ score
→ done
```

rồi mới nghĩ đến learning.

Phải xây data model hỗ trợ learning ngay từ đầu:

```text
Question
→ Type
→ Knowledge
→ Vocabulary
→ Lesson
```

---

# 111. Checklist chức năng bắt buộc

## Knowledge

- [ ] Grammar lessons
- [ ] Vocabulary lessons
- [ ] Listening strategy lessons
- [ ] Reading strategy lessons
- [ ] Question-type lessons
- [ ] Trap lessons
- [ ] Time-management lessons

## Question Type

- [ ] Part 1 classification
- [ ] Part 2 classification
- [ ] Part 3 classification
- [ ] Part 4 classification
- [ ] Part 5 classification
- [ ] Part 6 classification
- [ ] Part 7 classification

## Vocabulary

- [ ] Global frequency
- [ ] Part frequency
- [ ] Topic
- [ ] Collocation
- [ ] Word family
- [ ] Synonym
- [ ] Antonym
- [ ] Flashcards
- [ ] Spaced repetition
- [ ] Dictation
- [ ] Listening vocabulary
- [ ] Weak vocabulary
- [ ] Frequent vocabulary

## Practice

- [ ] Guided practice
- [ ] Standard practice
- [ ] Timed practice
- [ ] Mixed practice
- [ ] Weakness practice
- [ ] Vocabulary practice
- [ ] Grammar practice

## Review

- [ ] Wrong
- [ ] Slow
- [ ] Marked
- [ ] Weak
- [ ] Due review

## Analytics

- [ ] Part
- [ ] Question Type
- [ ] Knowledge
- [ ] Vocabulary
- [ ] Speed
- [ ] Error Type
- [ ] Mastery

---

# 112. Acceptance criteria

Một module được coi là hoàn thiện khi:

```text
User biết dạng bài
→
User học lý thuyết
→
User xem ví dụ
→
User luyện có hướng dẫn
→
User luyện độc lập
→
System lưu kết quả
→
System phát hiện lỗi
→
System biết lỗi thuộc kiến thức nào
→
System liên kết lại lesson
→
System tạo review
```

Nếu thiếu đoạn:

```text
Wrong Answer
→ Knowledge
```

thì hệ thống vẫn chỉ là question bank, chưa phải learning platform.

---

# 113. Kiến trúc sản phẩm cuối cùng

```text
                    TOEIC PLATFORM
                           │
          ┌────────────────┴────────────────┐
          │                                 │
       LEARNING                          TESTING
          │                                 │
    ┌─────┼─────┐                  ┌────────┼────────┐
    │     │     │                  │        │        │
Grammar Vocabulary Strategy      Practice  Mini    Full Test
    │      │      │                  │       Test       │
    └──────┴──────┘                  │                 │
           │                         │                 │
       Question Types ───────────────┴─────────────────┘
           │
       Question Bank
           │
       Attempt Data
           │
      ┌────┼────┐
      │    │    │
    Error Speed Mastery
      │    │    │
      └────┼────┘
           │
     Recommendation
           │
     Review / Learning
```

---

# 114. Kết luận kỹ thuật

Sản phẩm nên được xây thành 5 lớp:

```text
1. Knowledge Layer
   → dạy kiến thức.

2. Strategy Layer
   → dạy cách làm từng dạng.

3. Taxonomy Layer
   → phân loại Part → Question Type → Sub Type.

4. Practice Layer
   → luyện từ dễ → chuẩn → mixed → timed → test.

5. Analytics Layer
   → từ kết quả suy ra weakness → recommendation → review.
```

Đặc biệt với RC:

```text
Part 5
→ Grammar + Vocabulary + Word Form + Collocation + Sentence Structure

Part 6
→ Grammar + Vocabulary + Context + Cohesion + Sentence Insertion

Part 7
→ Main Idea + Purpose + Detail + NOT + Inference + Vocabulary + Reference + Paraphrase + Implication + Insertion
```

Với LC:

```text
Part 1
→ visual vocabulary + action + position + location

Part 2
→ question intent + response type + traps

Part 3
→ conversation type + speaker + purpose + detail + inference + future action + graphic

Part 4
→ talk type + purpose + detail + request + future action + implication + graphic
```

Và từ vựng phải đi theo mô hình:

```text
WORD
↓
MEANING
↓
COLLOCATION
↓
TOPIC
↓
PART
↓
QUESTION TYPE
↓
TEST FREQUENCY
↓
USER WEAKNESS
↓
REVIEW
```

Đây là phần nên bổ sung ngay vào kiến trúc website. Không nên chỉ thêm vài trang "Từ vựng" và "Ngữ pháp"; cần xây **quan hệ dữ liệu giữa kiến thức, dạng câu hỏi, từ vựng, câu hỏi, test và lỗi của người học** ngay từ database.
