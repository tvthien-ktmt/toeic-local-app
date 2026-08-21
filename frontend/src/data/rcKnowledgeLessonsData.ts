export interface KnowledgeLessonItem {
  id: string;
  part: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4' | 'Part 5' | 'Part 6' | 'Part 7';
  title: string;
  category: 'GRAMMAR' | 'STRATEGY' | 'QUESTION_TYPE' | 'TRAP_AVOIDANCE';
  level: 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED';
  summaryVi: string;
  formulaOrRule: string;
  tacticsSteps: string[];
  keySignals: string[];
  examples: {
    questionText: string;
    options: { key: 'A' | 'B' | 'C' | 'D'; text: string; isCorrect: boolean }[];
    explanationVi: string;
  }[];
  commonTraps: string[];
}

/**
 * Comprehensive collection of TOEIC grammar rules, 6-step reading tactics, and trap avoidance lessons.
 */
export const RC_KNOWLEDGE_LESSONS: KnowledgeLessonItem[] = [
  {
    id: 'p5-word-forms',
    part: 'Part 5',
    title: 'Vị Trí & Dấu Hiệu Nhận Biết Từ Loại (Noun, Verb, Adj, Adv)',
    category: 'GRAMMAR',
    level: 'FOUNDATION',
    summaryVi: 'Xác định nhanh loại từ cần điền vào chỗ trống dựa vào cấu trúc câu mà không cần dịch nghĩa toàn bộ.',
    formulaOrRule: 'Determiner + (Adverb) + Adjective + NOUN | Subject + Adverb + Main VERB + Object | Be/Linking Verb + ADJECTIVE',
    tacticsSteps: [
      'Bước 1: Nhìn 4 đáp án. Nếu 4 đáp án có cùng gốc từ (ví dụ: produce, productive, production, productively) → Đây là câu hỏi Từ Loại.',
      'Bước 2: Xác định thành phần đứng ngay TRƯỚC và SAU chỗ trống.',
      'Bước 3: Áp dụng quy tắc trật tự từ để chọn đúng từ loại trong vòng 10-15 giây.',
    ],
    keySignals: [
      'Đuôi Danh từ (Noun): -tion, -sion, -ment, -ance, -ence, -ity, -er, -or, -ant',
      'Đuôi Tính từ (Adj): -ful, -less, -ive, -able, -ible, -al, -ous, -ic',
      'Đuôi Trạng từ (Adv): Adj + -ly (careful -> carefully, rapid -> rapidly)',
    ],
    examples: [
      {
        questionText: 'Ms. Henderson gave a very _______ presentation on quarterly sales targets.',
        options: [
          { key: 'A', text: 'inform', isCorrect: false },
          { key: 'B', text: 'informative', isCorrect: true },
          { key: 'C', text: 'informatively', isCorrect: false },
          { key: 'D', text: 'information', isCorrect: false },
        ],
        explanationVi: 'Đứng sau trạng từ "very" và trước danh từ "presentation" cần một Tính từ (Adjective). Đáp án đúng là (B) informative.',
      },
    ],
    commonTraps: [
      'Bẫy danh từ chỉ người (-er, -or, -ant) và danh từ chỉ vật (-tion, -ment). Danh từ đếm được số ít bắt buộc phải có a/an/the hoặc số nhiều.',
      'Bẫy tính từ có đuôi -ly (friendly, timely, costly, lovely là Tính từ, không phải Trạng từ).',
    ],
  },
  {
    id: 'p5-verb-tenses',
    part: 'Part 5',
    title: 'Thì Động Từ & Sự Hòa Hợp Chủ - Vị (Subject-Verb Agreement)',
    category: 'GRAMMAR',
    level: 'FOUNDATION',
    summaryVi: 'Quy tắc chia động từ số ít/số nhiều và nhận diện trạng từ chỉ thời gian trong câu.',
    formulaOrRule: 'Singular Subject + Verb-s/es/is/was/has | Plural Subject + Verb-bare/are/were/have',
    tacticsSteps: [
      'Bước 1: Loại bỏ các cụm giới từ phụ đứng giữa Chủ ngữ và Động từ chính (Ví dụ: The manager [of these departments] IS...).',
      'Bước 2: Tìm dấu hiệu thời gian (yesterday, last month -> Quá khứ đơn; recently, since, for -> Hiện tại hoàn thành; next, tomorrow -> Tương lai).',
      'Bước 3: Xét thể Chủ động / Bị động trước khi chọn đáp án cuối cùng.',
    ],
    keySignals: [
      'Hiện tại hoàn thành: since + mốc thời gian, for + khoảng thời gian, recently, already, yet',
      'Quá khứ đơn: yesterday, ago, last week, in 2020, previously',
      'Tương lai đơn: next, soon, upcoming, following, tomorrow',
    ],
    examples: [
      {
        questionText: 'The quality inspector _______ the production line several times this week.',
        options: [
          { key: 'A', text: 'has visited', isCorrect: true },
          { key: 'B', text: 'visit', isCorrect: false },
          { key: 'C', text: 'visiting', isCorrect: false },
          { key: 'D', text: 'were visited', isCorrect: false },
        ],
        explanationVi: 'Chủ ngữ "The quality inspector" là số ít, thời gian "this week / several times" diễn tả hành động lặp lại gần đây → Dùng Hiện tại hoàn thành (A) has visited.',
      },
    ],
    commonTraps: [
      'Bẫy danh từ số nhiều đứng ngay trước chỗ trống nhưng là tân ngữ của giới từ (Ví dụ: Each of the candidates IS qualified).',
      'Bẫy danh từ không đếm được (information, equipment, luggage, furniture) luôn chia động từ số ít.',
    ],
  },
  {
    id: 'p5-participles',
    part: 'Part 5',
    title: 'Phân Từ V-ing & V-ed (Rút Gọn Mệnh Đề Quan Hệ)',
    category: 'GRAMMAR',
    level: 'INTERMEDIATE',
    summaryVi: 'Cách phân biệt phân từ chủ động (V-ing) và phân từ bị động (V-ed / V3) làm tính từ bổ nghĩa.',
    formulaOrRule: 'V-ing + Object (Chủ động: gây ra hành động) | V-ed + (Preposition) (Bị động: nhận tác động)',
    tacticsSteps: [
      'Bước 1: Xác định danh từ mà phân từ đang bổ nghĩa.',
      'Bước 2: Nếu danh từ tự thực hiện hành động (có tân ngữ theo sau) → Chọn V-ing.',
      'Bước 3: Nếu danh từ chịu tác động của hành động (thường có giới từ by/in/at hoặc không có tân ngữ) → Chọn V-ed / V3.',
    ],
    keySignals: [
      'Chủ động: existing problems, surrounding areas, demanding boss, outstanding performance',
      'Bị động: attached document, updated schedule, detailed report, revised proposal, proposed plan',
    ],
    examples: [
      {
        questionText: 'Please review the _______ itinerary before boarding the flight tomorrow.',
        options: [
          { key: 'A', text: 'revise', isCorrect: false },
          { key: 'B', text: 'revised', isCorrect: true },
          { key: 'C', text: 'revising', isCorrect: false },
          { key: 'D', text: 'revises', isCorrect: false },
        ],
        explanationVi: 'Lịch trình (itinerary) được người sửa đổi (bị động) → Dùng quá khứ phân từ làm tính từ (B) revised itinerary.',
      },
    ],
    commonTraps: [
      'Nhầm lẫn giữa động từ chính của câu và cụm phân từ rút gọn mệnh đề quan hệ.',
    ],
  },
  {
    id: 'p5-prepositions-conjunctions',
    part: 'Part 5',
    title: 'Phân Biệt Giới Từ (Prepositions) & Liên Từ (Conjunctions)',
    category: 'GRAMMAR',
    level: 'INTERMEDIATE',
    summaryVi: 'Quy tắc vàng phân biệt giới từ đi với Cụm danh từ / V-ing và liên từ đi với Mệnh đề (Clause S + V).',
    formulaOrRule: 'Conjunction + Clause (S + V) | Preposition + Noun Phrase / V-ing',
    tacticsSteps: [
      'Bước 1: Quan sát phía sau chỗ trống xem là Mệnh đề (có Chủ ngữ và Động từ chia thì) hay Cụm danh từ.',
      'Bước 2: Nếu là Cụm danh từ → Loại ngay các liên từ (Because, Although, While). Chọn Giới từ.',
      'Bước 3: Nếu là Mệnh đề → Loại ngay các giới từ (Because of, Despite, In spite of, During). Chọn Liên từ.',
    ],
    keySignals: [
      'Mặc dù: Although / Even though / Though (+ S + V) VS Despite / In spite of (+ Noun/V-ing)',
      'Bởi vì: Because / Since / As (+ S + V) VS Because of / Due to / Owing to (+ Noun/V-ing)',
      'Trong khi: While (+ S + V) VS During (+ Noun)',
    ],
    examples: [
      {
        questionText: '_______ the severe thunderstorm, the outdoor charity concert continued as scheduled.',
        options: [
          { key: 'A', text: 'Although', isCorrect: false },
          { key: 'B', text: 'Despite', isCorrect: true },
          { key: 'C', text: 'Because', isCorrect: false },
          { key: 'D', text: 'While', isCorrect: false },
        ],
        explanationVi: 'Phía sau chỗ trống là cụm danh từ "the severe thunderstorm" và nghĩa tương phản → Dùng giới từ (B) Despite.',
      },
    ],
    commonTraps: [
      'Bẫy "Due to the fact that" đi với Mệnh đề (S + V) chứ không phải cụm danh từ.',
    ],
  },
  {
    id: 'p6-sentence-insertion',
    part: 'Part 6',
    title: 'Chiến Lược Làm Dạng Điền Cả Câu (Sentence Insertion) Part 6',
    category: 'STRATEGY',
    level: 'ADVANCED',
    summaryVi: 'Kỹ thuật tìm mối liên kết logic, đại từ thay thế và từ nối để chọn câu văn hòa hợp nhất với đoạn văn.',
    formulaOrRule: 'Previous Sentence (Context) -> Transition Signal / Pronoun -> Inserted Sentence -> Following Sentence',
    tacticsSteps: [
      'Bước 1: Đọc câu ngay TRƯỚC và SAU chỗ trống cần điền câu.',
      'Bước 2: Tìm các từ khóa bắc cầu (Transitional Words: However, Therefore, In addition, For example) hoặc Đại từ chỉ định (This, These, Such, It, They).',
      'Bước 3: Loại bỏ các câu đưa ra thông tin đối nghịch hoặc lạc đề với chủ đề bức thư/thông báo.',
    ],
    keySignals: [
      'Từ nối nguyên nhân - kết quả: Therefore, As a result, Consequently',
      'Từ nối bổ sung: In addition, Furthermore, Moreover, Also',
      'Từ nối tương phản: However, Nevertheless, On the contrary, Instead',
    ],
    examples: [
      {
        questionText: 'We appreciate your patience while we upgrade our database servers. [---]. Normal services will resume by 8:00 A.M. tomorrow.',
        options: [
          { key: 'A', text: 'The annual picnic has been postponed.', isCorrect: false },
          { key: 'B', text: 'During this maintenance period, our website will be temporarily inaccessible.', isCorrect: true },
          { key: 'C', text: 'Please welcome our new software engineer.', isCorrect: false },
          { key: 'D', text: 'You can purchase additional items with a 20% discount.', isCorrect: false },
        ],
        explanationVi: 'Câu trước nói về việc nâng cấp server, câu sau nói về thời gian hoạt động trở lại → Câu nối hợp lý nhất là (B) thông báo website tạm ngưng hoạt động.',
      },
    ],
    commonTraps: [
      'Bẫy câu có vẻ đúng ngữ pháp nhưng mâu thuẫn thời gian (Ví dụ: sự việc xảy ra trong tương lai nhưng câu chọn lại dùng thì quá khứ).',
    ],
  },
  {
    id: 'p7-six-step-mastery',
    part: 'Part 7',
    title: 'Quy Trình 6 Bước Đọc Hiểu Chuẩn ETS Cho Bài Đơn & Đôi/Ba',
    category: 'STRATEGY',
    level: 'ADVANCED',
    summaryVi: 'Phương pháp định vị bằng chứng (Evidence Hunting) và nhận diện Paraphrase giúp tiết kiệm 20 phút làm Part 7.',
    formulaOrRule: 'Document Type Identification -> Purpose Scan -> Keyword Anchor -> Evidence Hunting -> Paraphrase Matching -> Distractor Elimination',
    tacticsSteps: [
      'Bước 1: Nhìn tiêu đề văn bản (Email, Memo, Article, Invoice, Schedule) để xác định người gửi, người nhận và chủ đề.',
      'Bước 2: Đọc lướt (Skim) câu đầu tiên của đoạn 1 để nắm Mục đích chính (Main Purpose).',
      'Bước 3: Đọc câu hỏi và gạch chân Từ khóa Neo (Keyword Anchors: Tên riêng, ngày tháng, số tiền, thuật ngữ viết hoa).',
      'Bước 4: Quét nhanh (Scan) vào bài đọc để tìm đoạn chứa từ khóa neo.',
      'Bước 5: So sánh nội dung bài đọc với 4 đáp án để tìm cụm từ Paraphrase (diễn đạt tương đương).',
      'Bước 6: Loại trừ các đáp án bẫy (chứa từ nguyên văn nhưng sai quan hệ ngữ nghĩa, hoặc thông tin chưa được đề cập).',
    ],
    keySignals: [
      'Câu hỏi Mục đích: What is the purpose of...? Why was the email sent? (Nằm ở đoạn 1)',
      'Câu hỏi Chi tiết: According to the article, what/when/where/who...? (Dùng từ khóa quét bài)',
      'Câu hỏi NOT/EXCEPT: What is NOT mentioned/included...? (Tìm 3 đáp án có trong bài, chọn đáp án còn lại)',
    ],
    examples: [
      {
        questionText: 'Passage: "Due to unforeseen road repairs on Elm Street, deliveries may experience slight delays."\nQuestion: What is indicated about deliveries?',
        options: [
          { key: 'A', text: 'They have been permanently canceled.', isCorrect: false },
          { key: 'B', text: 'They might arrive later than expected.', isCorrect: true },
          { key: 'C', text: 'They will be shipped by air instead.', isCorrect: false },
          { key: 'D', text: 'They require additional shipping fees.', isCorrect: false },
        ],
        explanationVi: '"experience slight delays" được diễn đạt lại (paraphrased) thành (B) "might arrive later than expected".',
      },
    ],
    commonTraps: [
      'Bẫy suy diễn quá mức (Inference Trap): Chọn thông tin có vẻ hợp lý ngoài đời thực nhưng bài đọc KHÔNG hề nhắc tới.',
      'Bẫy lặp lại từ nguyên văn (Word-for-Word Trap): Lấy nguyên từ trong bài ghép vào đáp án nhưng ý nghĩa hoàn toàn trái ngược.',
    ],
  },
];
