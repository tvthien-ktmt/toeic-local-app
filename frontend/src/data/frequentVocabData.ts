export interface FrequentVocabItem {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  frequencyLevel: 'LEVEL_1_ULTRA' | 'LEVEL_2_HIGH' | 'LEVEL_3_FREQUENT';
  frequencyScore: number; // 90 to 99
  topicCategory: string;
  appearsInParts: string[];
  collocations: string[];
  exampleSentenceEn: string;
  exampleSentenceVi: string;
  paraphrasePairs: { original: string; synonym: string }[];
}

/**
 * Curated list of frequent high-yield TOEIC vocabulary items organized by frequency score and business topic.
 */
export const FREQUENT_HIGH_YIELD_VOCABULARY: FrequentVocabItem[] = [
  {
    id: 'vocab-postpone',
    word: 'postpone',
    ipa: '/poʊstˈpoʊn/',
    partOfSpeech: 'verb',
    meaningVi: 'Trì hoãn, hoãn lại cho đến thời gian sau',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 98,
    topicCategory: 'Lịch Trình & Cuộc Họp (Meetings & Schedules)',
    appearsInParts: ['Part 2', 'Part 3', 'Part 4', 'Part 7'],
    collocations: ['postpone a meeting', 'postpone until next week', 'indefinitely postpone'],
    exampleSentenceEn: 'The executive committee decided to postpone the annual general meeting until next month.',
    exampleSentenceVi: 'Ban điều hành đã quyết định hoãn cuộc họp đại hội đồng thường niên cho đến tháng sau.',
    paraphrasePairs: [
      { original: 'postpone', synonym: 'delay / put off / reschedule' },
    ],
  },
  {
    id: 'vocab-reimburse',
    word: 'reimburse',
    ipa: '/ˌriː.ɪmˈbɜːrs/',
    partOfSpeech: 'verb',
    meaningVi: 'Hoàn tiền, bồi hoàn chi phí đã thanh toán trước',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 97,
    topicCategory: 'Tài Chính & Chi Phí (Finance & Expenses)',
    appearsInParts: ['Part 3', 'Part 4', 'Part 7'],
    collocations: ['reimburse travel expenses', 'submit receipts to be reimbursed', 'full reimbursement'],
    exampleSentenceEn: 'Employees will be reimbursed for travel expenses upon submitting original receipts.',
    exampleSentenceVi: 'Nhân viên sẽ được hoàn lại chi phí công tác khi nộp lại các hóa đơn gốc.',
    paraphrasePairs: [
      { original: 'reimburse', synonym: 'refund / repay / compensate' },
    ],
  },
  {
    id: 'vocab-complimentary',
    word: 'complimentary',
    ipa: '/ˌkɑːm.pləˈmen.tər.i/',
    partOfSpeech: 'adjective',
    meaningVi: 'Miễn phí, tặng kèm theo dịch vụ',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 96,
    topicCategory: 'Khách Sạn & Dịch Vụ (Hospitality & Services)',
    appearsInParts: ['Part 3', 'Part 4', 'Part 7'],
    collocations: ['complimentary breakfast', 'complimentary shuttle service', 'complimentary ticket'],
    exampleSentenceEn: 'Hotel guests are invited to enjoy a complimentary continental breakfast in the lobby.',
    exampleSentenceVi: 'Khách lưu trú tại khách sạn được mời thưởng thức bữa sáng kiểu Âu miễn phí tại sảnh.',
    paraphrasePairs: [
      { original: 'complimentary', synonym: 'free of charge / at no extra cost' },
    ],
  },
  {
    id: 'vocab-warranty',
    word: 'warranty',
    ipa: '/ˈwɔːr.ən.ti/',
    partOfSpeech: 'noun',
    meaningVi: 'Chính sách bảo hành, phiếu bảo hành',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 95,
    topicCategory: 'Sản Phẩm & Mua Sắm (Products & Warranties)',
    appearsInParts: ['Part 3', 'Part 7'],
    collocations: ['two-year warranty', 'under warranty', 'warranty coverage', 'extend a warranty'],
    exampleSentenceEn: 'All electronic appliances purchased this week are covered by a comprehensive two-year warranty.',
    exampleSentenceVi: 'Tất cả thiết bị điện tử mua trong tuần này đều được áp dụng bảo hành toàn diện hai năm.',
    paraphrasePairs: [
      { original: 'under warranty', synonym: 'guaranteed by manufacturer' },
    ],
  },
  {
    id: 'vocab-accommodate',
    word: 'accommodate',
    ipa: '/əˈkɑː.mə.deɪt/',
    partOfSpeech: 'verb',
    meaningVi: 'Đáp ứng nhu cầu, cung cấp chỗ ngồi/chỗ ở',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 95,
    topicCategory: 'Cơ Sở Vật Chất & Sự Kiện (Facilities & Events)',
    appearsInParts: ['Part 3', 'Part 7'],
    collocations: ['accommodate guests', 'accommodate special requests', 'accommodate a large crowd'],
    exampleSentenceEn: 'The newly renovated auditorium can accommodate up to 600 participants.',
    exampleSentenceVi: 'Hội trường mới được cải tạo có thể chứa tới 600 người tham dự.',
    paraphrasePairs: [
      { original: 'accommodate', synonym: 'house / hold / fit / fulfill requests' },
    ],
  },
  {
    id: 'vocab-renovation',
    word: 'renovation',
    ipa: '/ˌren.əˈveɪ.ʃən/',
    partOfSpeech: 'noun',
    meaningVi: 'Sự nâng cấp, cải tạo công trình hoặc tòa nhà',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 94,
    topicCategory: 'Cơ Sở Vật Chất & Xây Dựng (Facilities & Construction)',
    appearsInParts: ['Part 3', 'Part 4', 'Part 7'],
    collocations: ['undergo renovation', 'major renovations', 'renovation project'],
    exampleSentenceEn: 'The branch library will remain closed during the ongoing facility renovations.',
    exampleSentenceVi: 'Thư viện chi nhánh sẽ tiếp tục đóng cửa trong thời gian cải tạo cơ sở vật chất.',
    paraphrasePairs: [
      { original: 'undergo renovation', synonym: 'being remodeled / refurbished' },
    ],
  },
  {
    id: 'vocab-itinerary',
    word: 'itinerary',
    ipa: '/aɪˈtɪn.ə.rer.i/',
    partOfSpeech: 'noun',
    meaningVi: 'Lịch trình chuyến công tác / du lịch',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 93,
    topicCategory: 'Đi Lại & Công Tác (Travel & Business Trips)',
    appearsInParts: ['Part 3', 'Part 7'],
    collocations: ['detailed itinerary', 'travel itinerary', 'flight itinerary'],
    exampleSentenceEn: 'Please check your travel itinerary carefully for departure times and hotel confirmations.',
    exampleSentenceVi: 'Vui lòng kiểm tra kỹ lịch trình chuyến đi để biết giờ khởi hành và xác nhận khách sạn.',
    paraphrasePairs: [
      { original: 'itinerary', synonym: 'travel schedule / timetable' },
    ],
  },
  {
    id: 'vocab-brochure',
    word: 'brochure',
    ipa: '/broʊˈʃʊr/',
    partOfSpeech: 'noun',
    meaningVi: 'Tờ rơi quảng cáo, tài liệu giới thiệu sản phẩm',
    frequencyLevel: 'LEVEL_1_ULTRA',
    frequencyScore: 92,
    topicCategory: 'Tiếp Thị & Bán Hàng (Marketing & Advertising)',
    appearsInParts: ['Part 3', 'Part 4', 'Part 7'],
    collocations: ['product brochure', 'informational brochure', 'distribute brochures'],
    exampleSentenceEn: 'Prospective buyers can download an informational brochure directly from our website.',
    exampleSentenceVi: 'Khách hàng tiềm năng có thể tải tài liệu thông tin giới thiệu trực tiếp từ trang web của chúng tôi.',
    paraphrasePairs: [
      { original: 'brochure', synonym: 'pamphlet / booklet / promotional flyer' },
    ],
  },
  {
    id: 'vocab-eligible',
    word: 'eligible',
    ipa: '/ˈel.ə.dʒə.bəl/',
    partOfSpeech: 'adjective',
    meaningVi: 'Đủ điều kiện, đủ tiêu chuẩn hưởng quyền lợi',
    frequencyLevel: 'LEVEL_2_HIGH',
    frequencyScore: 88,
    topicCategory: 'Nhân Sự & Quyền Lợi (Personnel & Benefits)',
    appearsInParts: ['Part 5', 'Part 6', 'Part 7'],
    collocations: ['eligible for promotion', 'eligible for reimbursement', 'eligible to apply'],
    exampleSentenceEn: 'Employees who have completed six months of service are eligible for paid vacation days.',
    exampleSentenceVi: 'Nhân viên đã hoàn thành sáu tháng làm việc sẽ đủ điều kiện được nghỉ phép có lương.',
    paraphrasePairs: [
      { original: 'eligible for', synonym: 'qualified for / entitled to' },
    ],
  },
  {
    id: 'vocab-inventory',
    word: 'inventory',
    ipa: '/ˈɪn.vən.tɔːr.i/',
    partOfSpeech: 'noun',
    meaningVi: 'Hàng tồn kho, danh mục kiểm kê hàng hóa',
    frequencyLevel: 'LEVEL_2_HIGH',
    frequencyScore: 87,
    topicCategory: 'Kho Bãi & Hậu Cần (Logistics & Inventory)',
    appearsInParts: ['Part 4', 'Part 7'],
    collocations: ['take inventory', 'inventory check', 'in stock / out of stock'],
    exampleSentenceEn: 'The warehouse will be conducting an annual inventory count this upcoming weekend.',
    exampleSentenceVi: 'Nhà kho sẽ tiến hành kiểm kê hàng tồn kho thường niên vào cuối tuần tới.',
    paraphrasePairs: [
      { original: 'inventory', synonym: 'stock of goods / warehouse supplies' },
    ],
  },
  {
    id: 'vocab-confidential',
    word: 'confidential',
    ipa: '/ˌkɑːn.fəˈden.ʃəl/',
    partOfSpeech: 'adjective',
    meaningVi: 'Tuyệt mật, bảo mật thông tin nội bộ',
    frequencyLevel: 'LEVEL_2_HIGH',
    frequencyScore: 85,
    topicCategory: 'Hợp Đồng & Pháp Lý (Contracts & Legal)',
    appearsInParts: ['Part 5', 'Part 6', 'Part 7'],
    collocations: ['strictly confidential', 'confidential document', 'confidentiality agreement'],
    exampleSentenceEn: 'All patient records must be kept strictly confidential according to legal regulations.',
    exampleSentenceVi: 'Tất cả hồ sơ bệnh nhân phải được giữ bí mật nghiêm ngặt theo đúng quy định pháp luật.',
    paraphrasePairs: [
      { original: 'confidential', synonym: 'private / secret / non-public' },
    ],
  },
  {
    id: 'vocab-discrepancy',
    word: 'discrepancy',
    ipa: '/dɪˈskrep.ən.si/',
    partOfSpeech: 'noun',
    meaningVi: 'Sự sai lệch, chênh lệch giữa hai số liệu',
    frequencyLevel: 'LEVEL_3_FREQUENT',
    frequencyScore: 78,
    topicCategory: 'Kế Toán & Kiểm Toán (Accounting & Auditing)',
    appearsInParts: ['Part 6', 'Part 7'],
    collocations: ['discrepancy in figures', 'resolve a discrepancy', 'noticeable discrepancy'],
    exampleSentenceEn: 'The auditor discovered a minor discrepancy between the sales records and the bank statement.',
    exampleSentenceVi: 'Kiểm toán viên đã phát hiện một sự chênh lệch nhỏ giữa sổ sách bán hàng và sao kê ngân hàng.',
    paraphrasePairs: [
      { original: 'discrepancy', synonym: 'inconsistency / difference / mismatch' },
    ],
  },
];
