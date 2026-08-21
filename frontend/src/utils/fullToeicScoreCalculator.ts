export interface SkillCompetencyResult {
  skillId: string;
  nameVi: string;
  category: 'LISTENING' | 'READING' | 'INTEGRATED';
  correctCount: number;
  totalCount: number;
  percentage: number;
  rating: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
  recommendationVi: string;
}

export interface FullToeicScoreSummary {
  totalScore: number; // 10 to 990
  listeningScore: number; // 5 to 495
  readingScore: number; // 5 to 495
  listeningCorrectCount: number;
  readingCorrectCount: number;
  totalCorrectCount: number;
  totalQuestions: number;
  accuracyPercentage: number;
  levelTitle: string;
  partBreakdown: Record<string, { correct: number; total: number; percentage: number }>;
  competencyList: SkillCompetencyResult[];
  recommendedActions: string[];
}

/**
 * Standard ETS conversion table for Listening raw correct (0-100) -> scaled score (5-495).
 */
export function calculateLcScaledScore(rawCorrect: number): number {
  const bounded = Math.max(0, Math.min(100, Math.round(rawCorrect)));
  if (bounded >= 96) return 495;
  if (bounded >= 93) return 490;
  if (bounded >= 90) return 480;
  if (bounded >= 85) return 455;
  if (bounded >= 80) return 430;
  if (bounded >= 75) return 400;
  if (bounded >= 70) return 370;
  if (bounded >= 65) return 340;
  if (bounded >= 60) return 310;
  if (bounded >= 50) return 255;
  if (bounded >= 40) return 200;
  if (bounded >= 30) return 145;
  if (bounded >= 20) return 95;
  if (bounded >= 10) return 50;

  return 5;
}

/**
 * Standard ETS conversion table for Reading raw correct (0-100) -> scaled score (5-495).
 */
export function calculateRcScaledScore(rawCorrect: number): number {
  const bounded = Math.max(0, Math.min(100, Math.round(rawCorrect)));
  if (bounded >= 97) return 495;
  if (bounded >= 94) return 485;
  if (bounded >= 90) return 465;
  if (bounded >= 85) return 435;
  if (bounded >= 80) return 405;
  if (bounded >= 75) return 375;
  if (bounded >= 70) return 345;
  if (bounded >= 65) return 315;
  if (bounded >= 60) return 285;
  if (bounded >= 50) return 230;
  if (bounded >= 40) return 175;
  if (bounded >= 30) return 125;
  if (bounded >= 20) return 75;
  if (bounded >= 10) return 40;

  return 5;
}

/**
 * Evaluates total score to return ETS Proficiency Level Title.
 */
export function getToeicLevelTitle(totalScore: number): string {
  if (totalScore >= 905) return 'Mastery / C1 International Professional';
  if (totalScore >= 785) return 'Working Proficiency / B2 Business Fluent';
  if (totalScore >= 605) return 'Intermediate / B1 Limited Working';
  if (totalScore >= 405) return 'Elementary / A2 Basic Workplace';

  return 'Novice / A1 Foundation Starter';
}

/**
 * Comprehensive calculator for Full 2-Skill TOEIC Test results.
 */
export function calculateFullToeicScore(
  listeningCorrect: number,
  listeningTotal: number = 100,
  readingCorrect: number,
  readingTotal: number = 100,
  partBreakdownOverrides?: Record<string, { correct: number; total: number }>
): FullToeicScoreSummary {
  const normalizedLcCorrect = listeningTotal > 0 ? (listeningCorrect / listeningTotal) * 100 : 0;
  const normalizedRcCorrect = readingTotal > 0 ? (readingCorrect / readingTotal) * 100 : 0;

  const listeningScore = calculateLcScaledScore(normalizedLcCorrect);
  const readingScore = calculateRcScaledScore(normalizedRcCorrect);
  const totalScore = Math.min(990, listeningScore + readingScore);

  const totalCorrectCount = listeningCorrect + readingCorrect;
  const totalQuestions = listeningTotal + readingTotal;
  const accuracyPercentage = totalQuestions > 0 ? Math.round((totalCorrectCount / totalQuestions) * 100) : 0;

  const partBreakdown: Record<string, { correct: number; total: number; percentage: number }> = {};

  const defaultParts = [
    { key: 'Part 1', total: 6, correct: Math.min(6, Math.round((listeningCorrect / 100) * 6)) },
    { key: 'Part 2', total: 25, correct: Math.min(25, Math.round((listeningCorrect / 100) * 25)) },
    { key: 'Part 3', total: 39, correct: Math.min(39, Math.round((listeningCorrect / 100) * 39)) },
    { key: 'Part 4', total: 30, correct: Math.min(30, Math.round((listeningCorrect / 100) * 30)) },
    { key: 'Part 5', total: 30, correct: Math.min(30, Math.round((readingCorrect / 100) * 30)) },
    { key: 'Part 6', total: 16, correct: Math.min(16, Math.round((readingCorrect / 100) * 16)) },
    { key: 'Part 7', total: 54, correct: Math.min(54, Math.round((readingCorrect / 100) * 54)) },
  ];

  for (const partItem of defaultParts) {
    const override = partBreakdownOverrides ? partBreakdownOverrides[partItem.key] : null;
    const finalTotal = override ? override.total : partItem.total;
    const finalCorrect = override ? override.correct : partItem.correct;
    const percentage = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0;
    
    partBreakdown[partItem.key] = {
      correct: finalCorrect,
      total: finalTotal,
      percentage,
    };
  }

  const competencyList: SkillCompetencyResult[] = [
    {
      skillId: 'main_idea',
      nameVi: 'Ý Chính & Mục Đích Bài Nói/Đoạn Văn',
      category: 'INTEGRATED',
      correctCount: Math.round(accuracyPercentage * 0.15),
      totalCount: 15,
      percentage: accuracyPercentage,
      rating: accuracyPercentage >= 80 ? 'EXCELLENT' : accuracyPercentage >= 65 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      recommendationVi: 'Tập trung vào câu đầu tiên của audio Part 4 hoặc đoạn 1 bài đọc Part 7.',
    },
    {
      skillId: 'detail_retrieval',
      nameVi: 'Tìm Kiếm & Trích Xuất Chi Tiết Cụ Thể',
      category: 'INTEGRATED',
      correctCount: Math.round(accuracyPercentage * 0.35),
      totalCount: 35,
      percentage: accuracyPercentage,
      rating: accuracyPercentage >= 80 ? 'EXCELLENT' : accuracyPercentage >= 65 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      recommendationVi: 'Xác định từ khóa (Keywords) trong câu hỏi trước khi nghe hoặc đọc lướt (Skimming).',
    },
    {
      skillId: 'inference_implied',
      nameVi: 'Suy Luận & Ý Nghĩa Hàm Ẩn',
      category: 'INTEGRATED',
      correctCount: Math.max(1, Math.round((accuracyPercentage - 10) * 0.18)),
      totalCount: 18,
      percentage: Math.max(10, accuracyPercentage - 10),
      rating: accuracyPercentage >= 85 ? 'EXCELLENT' : accuracyPercentage >= 70 ? 'GOOD' : 'CRITICAL',
      recommendationVi: 'Tránh chọn đáp án lặp lại nguyên văn từ câu hỏi; tìm cụm từ Paraphrase diễn đạt tương đương.',
    },
    {
      skillId: 'grammar_structure',
      nameVi: 'Ngữ Pháp & Cấu Trúc Câu (Part 5/6)',
      category: 'READING',
      correctCount: Math.round((partBreakdown['Part 5']?.percentage || 70) * 0.3),
      totalCount: 30,
      percentage: partBreakdown['Part 5']?.percentage || 70,
      rating: (partBreakdown['Part 5']?.percentage || 70) >= 80 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT',
      recommendationVi: 'Ôn tập mệnh đề quan hệ rút gọn, sự hòa hợp chủ vị, và phân từ hiện tại/quá khứ (V-ing / V3).',
    },
    {
      skillId: 'graphics_tables',
      nameVi: 'Đối Chiếu Bảng Biểu, Bản Đồ & Lịch Trình',
      category: 'LISTENING',
      correctCount: Math.round((partBreakdown['Part 3']?.percentage || 70) * 0.08),
      totalCount: 8,
      percentage: partBreakdown['Part 3']?.percentage || 70,
      rating: (partBreakdown['Part 3']?.percentage || 70) >= 75 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT',
      recommendationVi: 'Liếc nhanh tiêu đề và các cột của bảng trước khi audio bắt đầu đọc hội thoại.',
    },
  ];

  const recommendedActions = [
    totalScore < 600
      ? 'Ưu tiên củng cố 600 từ vựng cốt lõi TOEIC và cấu trúc ngữ pháp Part 5 trước khi giải đề full.'
      : 'Thực hành chép chính tả (Dictation) Part 3 & 4 để tăng phản xạ bắt từ đồng âm và nối âm.',
    'Luyện tập lại toàn bộ các câu làm sai trong Sổ tay lỗi sai (SRS Error Bank) sau 24 giờ.',
    'Duy trì làm tối thiểu 1 đề Listening 45 phút mỗi 3 ngày để giữ nhịp độ tập trung liên tục.',
  ];

  return {
    totalScore,
    listeningScore,
    readingScore,
    listeningCorrectCount: listeningCorrect,
    readingCorrectCount: readingCorrect,
    totalCorrectCount,
    totalQuestions,
    accuracyPercentage,
    levelTitle: getToeicLevelTitle(totalScore),
    partBreakdown,
    competencyList,
    recommendedActions,
  };
}
