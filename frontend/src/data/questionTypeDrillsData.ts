export interface QuestionTypeDrillItem {
  id: string;
  part: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4' | 'Part 5' | 'Part 6' | 'Part 7';
  questionTypeCategory:
    | 'P5_WORD_FORM'
    | 'P5_VERB_TENSE'
    | 'P5_PREPOSITIONS_CONJUNCTIONS'
    | 'P5_PARTICIPLES'
    | 'P6_SENTENCE_INSERTION'
    | 'P6_CONTEXT_VOCAB'
    | 'P7_MAIN_IDEA'
    | 'P7_DETAIL'
    | 'P7_NOT_EXCEPT'
    | 'P7_INFERENCE';
  typeNameVi: string;
  passageText?: string;
  questionStem: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  detailedExplanationVi: string;
  tacticsAppliedVi: string;
}

/**
 * Question-type practice drill items with detailed answer explanations and applied tactics.
 */
export const QUESTION_TYPE_DRILLS: QuestionTypeDrillItem[] = [
  {
    id: 'drill-p5-wf-1',
    part: 'Part 5',
    questionTypeCategory: 'P5_WORD_FORM',
    typeNameVi: 'Part 5 — Dạng Từ Loại (Word Form / Part of Speech)',
    questionStem: 'The executive committee praised the marketing team for their _______ performance this quarter.',
    options: [
      { key: 'A', text: 'exception' },
      { key: 'B', text: 'exceptional' },
      { key: 'C', text: 'exceptionally' },
      { key: 'D', text: 'except' },
    ],
    correctAnswer: 'B',
    detailedExplanationVi: 'Đứng sau tính từ sở hữu "their" và trước danh từ "performance", vị trí này cần một Tính từ (Adjective) để bổ nghĩa cho danh từ. "exceptional" (xuất chúng, vượt bậc) là tính từ thích hợp.',
    tacticsAppliedVi: 'Quy tắc: Possessive Adjective + ADJECTIVE + Noun.',
  },
  {
    id: 'drill-p5-prep-1',
    part: 'Part 5',
    questionTypeCategory: 'P5_PREPOSITIONS_CONJUNCTIONS',
    typeNameVi: 'Part 5 — Giới Từ & Liên Từ (Prepositions & Conjunctions)',
    questionStem: '_______ the unexpected flight delay, Mr. Watson managed to arrive at the keynote session on time.',
    options: [
      { key: 'A', text: 'Although' },
      { key: 'B', text: 'Despite' },
      { key: 'C', text: 'Because' },
      { key: 'D', text: 'While' },
    ],
    correctAnswer: 'B',
    detailedExplanationVi: 'Phía sau chỗ trống là một Cụm danh từ (Noun Phrase: "the unexpected flight delay"), và câu mang ý nghĩa nhượng bộ/tương phản. "Despite" là giới từ mang nghĩa "mặc dù" đi với cụm danh từ.',
    tacticsAppliedVi: 'Loại bỏ Although, Because, While vì 3 từ này là liên từ bắt buộc đi với Mệnh đề (S + V).',
  },
  {
    id: 'drill-p5-participle-1',
    part: 'Part 5',
    questionTypeCategory: 'P5_PARTICIPLES',
    typeNameVi: 'Part 5 — Phân Từ & Rút Gọn Mệnh Đề (Participles V-ing / V-ed)',
    questionStem: 'Please find the _______ invoice for the office stationery ordered last Tuesday.',
    options: [
      { key: 'A', text: 'attach' },
      { key: 'B', text: 'attached' },
      { key: 'C', text: 'attaching' },
      { key: 'D', text: 'attachment' },
    ],
    correctAnswer: 'B',
    detailedExplanationVi: 'Hóa đơn (invoice) được đính kèm (bị động) trong thư điện tử. Ta dùng quá khứ phân từ "attached" đóng vai trò như một tính từ bổ nghĩa cho danh từ "invoice".',
    tacticsAppliedVi: 'Cụm cố định kinh doanh quen thuộc: "the attached invoice / document / file".',
  },
  {
    id: 'drill-p6-insertion-1',
    part: 'Part 6',
    questionTypeCategory: 'P6_SENTENCE_INSERTION',
    typeNameVi: 'Part 6 — Điền Cả Câu Vào Đoạn Văn (Sentence Insertion)',
    passageText: 'Thank you for contacting Skyline Telecom Support. We have received your inquiry regarding fiber optic installation at your new office. [---]. An engineer will contact you 24 hours prior to the appointment to confirm site access.',
    questionStem: 'Select the sentence that best fits the blank.',
    options: [
      { key: 'A', text: 'Our technician is scheduled to visit your location on Friday at 9:00 A.M.' },
      { key: 'B', text: 'We regret to inform you that your contract has expired.' },
      { key: 'C', text: 'The billing department is currently closed for holidays.' },
      { key: 'D', text: 'You can return the defective router for a full refund.' },
    ],
    correctAnswer: 'A',
    detailedExplanationVi: 'Câu trước nói về việc đã nhận yêu cầu lắp đặt cáp quang, câu sau nhắc tới "an engineer will contact you prior to the appointment" (kỹ sư sẽ liên hệ trước buổi hẹn). Do đó, câu hợp lý nhất phải xác định ngày giờ buổi hẹn (A).',
    tacticsAppliedVi: 'Tìm mối liên kết logic trước và sau: Inquiry received -> Appointment scheduled (A) -> Pre-appointment call.',
  },
  {
    id: 'drill-p7-not-except-1',
    part: 'Part 7',
    questionTypeCategory: 'P7_NOT_EXCEPT',
    typeNameVi: 'Part 7 — Dạng Câu Hỏi Loại Trừ (NOT / EXCEPT)',
    passageText: 'Oakridge Business Center offers fully furnished modern office suites. Amenities include high-speed Wi-Fi, 24/7 biometric security access, complimentary coffee at the lounge, and free underground parking for all tenants. Please note that conference room reservations must be booked at least 48 hours in advance.',
    questionStem: 'What is NOT mentioned as an amenity included at Oakridge Business Center?',
    options: [
      { key: 'A', text: 'Complimentary beverages' },
      { key: 'B', text: 'High-speed internet access' },
      { key: 'C', text: 'Free on-site fitness gym' },
      { key: 'D', text: 'Underground vehicle parking' },
    ],
    correctAnswer: 'C',
    detailedExplanationVi: 'Trong bài có nhắc đến: "complimentary coffee" (= complimentary beverages (A)), "high-speed Wi-Fi" (= (B)), "free underground parking" (= (D)). Bài đọc KHÔNG hề nhắc đến phòng tập gym (fitness gym). Đáp án đúng là (C).',
    tacticsAppliedVi: 'Chiến thuật: Tìm 3 bằng chứng xuất hiện trong bài đọc để loại trừ, đáp án không có trong bài là đáp án đúng.',
  },
  {
    id: 'drill-p7-inference-1',
    part: 'Part 7',
    questionTypeCategory: 'P7_INFERENCE',
    typeNameVi: 'Part 7 — Dạng Câu Hỏi Suy Luận (Inference / Implied Meaning)',
    passageText: 'Dear Mr. Garcia, I noticed that our supply of recycled printing paper is running critically low. Since the regional conference is next Wednesday and we will be printing over 300 delegate handbooks, could you please contact Apex Paper Co. today and request express delivery?',
    questionStem: 'What can be inferred about Apex Paper Co.?',
    options: [
      { key: 'A', text: 'It organizes regional business conferences.' },
      { key: 'B', text: 'It is a supplier of office paper goods.' },
      { key: 'C', text: 'It recently moved to a new corporate headquarters.' },
      { key: 'D', text: 'It offers free catering services.' },
    ],
    correctAnswer: 'B',
    detailedExplanationVi: 'Người viết nhận thấy giấy in sắp hết ("supply of printing paper is running low") và yêu cầu "contact Apex Paper Co. and request express delivery". Ta suy luận Apex Paper Co. là nhà cung cấp giấy in văn phòng (B).',
    tacticsAppliedVi: 'Suy luận dựa trên bằng chứng ngữ cảnh (Evidence-based Inference), không chọn suy diễn không có căn cứ.',
  },
];
