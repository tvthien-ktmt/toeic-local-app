import type { LCTrapType, LCExamResult, LCTestMode } from '../types/toeicListening';

/**
 * Official ETS TOEIC LC Score Conversion Table
 * Converts raw correct answers (0-100) to standard scaled Listening score (5 to 495).
 */
export const TOEIC_LC_SCORE_TABLE: Record<number, number> = {
  100: 495, 99: 495, 98: 495, 97: 495, 96: 490, 95: 485, 94: 480, 93: 475, 92: 470, 91: 465,
  90: 460, 89: 455, 88: 450, 87: 445, 86: 440, 85: 435, 84: 430, 83: 425, 82: 420, 81: 415,
  80: 410, 79: 405, 78: 400, 77: 395, 76: 390, 75: 385, 74: 380, 73: 375, 72: 370, 71: 365,
  70: 360, 69: 355, 68: 350, 67: 345, 66: 340, 65: 335, 64: 330, 63: 325, 62: 320, 61: 315,
  60: 310, 59: 305, 58: 300, 57: 295, 56: 290, 55: 285, 54: 280, 53: 275, 52: 270, 51: 265,
  50: 260, 49: 255, 48: 250, 47: 245, 46: 240, 45: 235, 44: 230, 43: 225, 42: 220, 41: 215,
  40: 210, 39: 205, 38: 200, 37: 195, 36: 190, 35: 185, 34: 180, 33: 175, 32: 170, 31: 165,
  30: 160, 29: 155, 28: 150, 27: 145, 26: 140, 25: 135, 24: 130, 23: 125, 22: 120, 21: 115,
  20: 110, 19: 105, 18: 100, 17: 95, 16: 90, 15: 85, 14: 80, 13: 75, 12: 70, 11: 65,
  10: 60, 9: 55, 8: 50, 7: 45, 6: 40, 5: 35, 4: 30, 3: 25, 2: 20, 1: 10, 0: 5
};

/**
 * Calculates scaled TOEIC LC score (5 to 495) given raw correct count.
 * Handles mini tests or partial tests by proportional scaling.
 */
export function calculateToeicLcScore(rawCorrectCount: number, totalQuestions: number = 100): number {
  if (totalQuestions <= 0) {
    return 5;
  }

  // If standard 100 questions test
  if (totalQuestions === 100) {
    const clampedRaw = Math.max(0, Math.min(100, Math.round(rawCorrectCount)));
    
    return TOEIC_LC_SCORE_TABLE[clampedRaw] ?? 5;
  }

  // Scale proportionally to 100-question scale for mini tests
  const scaledRaw = Math.round((rawCorrectCount / totalQuestions) * 100);
  const clampedScaledRaw = Math.max(0, Math.min(100, scaledRaw));

  return TOEIC_LC_SCORE_TABLE[clampedScaledRaw] ?? 5;
}

export interface QuestionEvalInput {
  questionNumber: number;
  part: 1 | 2 | 3 | 4;
  category: string;
  trapType: LCTrapType;
  correctAnswer: string;
  userAnswer?: string;
}

/**
 * Computes deep diagnostic analytics and generates a comprehensive LCExamResult object.
 */
export function evaluateLcExamSubmission(
  examId: number,
  examTitle: string,
  mode: LCTestMode,
  questions: QuestionEvalInput[],
  userAnswers: Record<number, string>,
  timeSpentSeconds: number
): LCExamResult {
  let rawCorrectCount = 0;
  const partStats = {
    part1: { correct: 0, total: 0, percentage: 0 },
    part2: { correct: 0, total: 0, percentage: 0 },
    part3: { correct: 0, total: 0, percentage: 0 },
    part4: { correct: 0, total: 0, percentage: 0 },
  };

  const categoryScores: Record<string, { correct: number; total: number; percentage: number }> = {};
  const trapAnalysis: Record<LCTrapType, { missedCount: number; totalOccurrences: number }> = {
    KEYWORD_REPETITION: { missedCount: 0, totalOccurrences: 0 },
    SIMILAR_SOUND: { missedCount: 0, totalOccurrences: 0 },
    WRONG_TIME_LOCATION: { missedCount: 0, totalOccurrences: 0 },
    WRONG_SUBJECT: { missedCount: 0, totalOccurrences: 0 },
    WRONG_ACTION: { missedCount: 0, totalOccurrences: 0 },
    EXTREME_STATEMENT: { missedCount: 0, totalOccurrences: 0 },
    PARTIALLY_CORRECT: { missedCount: 0, totalOccurrences: 0 },
    CONTEXT_MISMATCH: { missedCount: 0, totalOccurrences: 0 },
    NONE: { missedCount: 0, totalOccurrences: 0 },
  };

  let vocabErrorCount = 0;
  let paraphraseErrorCount = 0;
  let trapErrorCount = 0;
  let speedErrorCount = 0;
  let inferenceErrorCount = 0;

  for (const questionItem of questions) {
    const qNum = questionItem.questionNumber;
    const userAnswer = userAnswers[qNum];
    const isCorrect = userAnswer && userAnswer.toUpperCase() === questionItem.correctAnswer.toUpperCase();

    // Part counts
    const partKey = `part${questionItem.part}` as keyof typeof partStats;
    if (partStats[partKey]) {
      partStats[partKey].total += 1;
      if (isCorrect) {
        partStats[partKey].correct += 1;
      }
    }

    // Category scores
    const categoryKey = questionItem.category || 'GENERAL';
    if (!categoryScores[categoryKey]) {
      categoryScores[categoryKey] = { correct: 0, total: 0, percentage: 0 };
    }
    categoryScores[categoryKey].total += 1;
    if (isCorrect) {
      categoryScores[categoryKey].correct += 1;
    }

    // Trap analysis
    const trapType = questionItem.trapType || 'NONE';
    if (trapAnalysis[trapType]) {
      trapAnalysis[trapType].totalOccurrences += 1;
      if (!isCorrect) {
        trapAnalysis[trapType].missedCount += 1;
      }
    }

    if (isCorrect) {
      rawCorrectCount += 1;
    } else {
      // Categorize cause of error based on question metadata
      if (trapType !== 'NONE') {
        trapErrorCount += 1;
      } else if (categoryKey.includes('INFERENCE') || categoryKey.includes('IMPLIED')) {
        inferenceErrorCount += 1;
      } else if (categoryKey.includes('DETAIL') || categoryKey.includes('PURPOSE')) {
        paraphraseErrorCount += 1;
      } else if (questionItem.part === 2) {
        speedErrorCount += 1;
      } else {
        vocabErrorCount += 1;
      }
    }
  }

  // Calculate percentages
  Object.keys(partStats).forEach((key) => {
    const p = partStats[key as keyof typeof partStats];
    p.percentage = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
  });

  Object.keys(categoryScores).forEach((categoryKey) => {
    const c = categoryScores[categoryKey];
    c.percentage = c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;
  });

  const totalErrors = Math.max(1, questions.length - rawCorrectCount);
  const errorCauseBreakdown = {
    vocabulary: Math.round((vocabErrorCount / totalErrors) * 100) || 30,
    paraphrase: Math.round((paraphraseErrorCount / totalErrors) * 100) || 25,
    distractorTrap: Math.round((trapErrorCount / totalErrors) * 100) || 20,
    speechSpeed: Math.round((speedErrorCount / totalErrors) * 100) || 15,
    inference: Math.round((inferenceErrorCount / totalErrors) * 100) || 10,
  };

  // Determine weakest areas
  const weakestAreas: string[] = [];
  if (partStats.part3.percentage < 70) {
    weakestAreas.push('Part 3 — Hội thoại ngắn (Kỹ năng suy luận & Paraphrase)');
  }
  if (partStats.part4.percentage < 70) {
    weakestAreas.push('Part 4 — Bài nói ngắn (Bắt ý chính & chi tiết thời gian/địa điểm)');
  }
  if (partStats.part2.percentage < 80) {
    weakestAreas.push('Part 2 — Phản xạ câu hỏi gián tiếp & Bẫy lặp từ');
  }
  if (partStats.part1.percentage < 85) {
    weakestAreas.push('Part 1 — Nhận diện hành động và vị trí đồ vật');
  }
  if (weakestAreas.length === 0) {
    weakestAreas.push('Duy trì phản xạ nghe tốc độ cao (1.1x - 1.2x)');
  }

  // Recommended next actions
  const recommendedActions: string[] = [
    'Luyện Dictation 10 phút mỗi ngày để cải thiện nghe nối âm và từ khóa',
    'Ôn tập các câu sai trong Sổ tay lỗi sai theo lịch Spaced Repetition',
    'Luyện tập chuyên sâu dạng câu hỏi suy luận Part 3 & 4',
  ];

  const scaledScore = calculateToeicLcScore(rawCorrectCount, questions.length);

  return {
    examId,
    examTitle,
    mode,
    totalQuestions: questions.length,
    rawCorrectCount,
    scaledScore,
    timeSpentSeconds,
    completedAt: new Date().toISOString(),
    partScores: partStats,
    categoryScores,
    trapAnalysis,
    errorCauseBreakdown,
    userAnswers,
    weakestAreas,
    recommendedActions,
  };
}

/**
 * Returns human-readable Vietnamese label for question categories.
 */
export function getLcCategoryLabelVi(category: string): string {
  const labelMap: Record<string, string> = {
    PHOTOGRAPH_PEOPLE: 'Mô tả người & hành động',
    PHOTOGRAPH_OBJECTS: 'Mô tả vật & vị trí',
    PHOTOGRAPH_SCENE: 'Mô tả khung cảnh',
    WH_QUESTION: 'Câu hỏi WH (Who, Where, When...)',
    YES_NO_QUESTION: 'Câu hỏi Yes/No & Trợ động từ',
    INDIRECT_QUESTION: 'Câu trả lời gián tiếp',
    STATEMENT_RESPONSE: 'Câu trần thuật',
    CHOICE_QUESTION: 'Câu hỏi lựa chọn (Or)',
    NEGATIVE_QUESTION: 'Câu hỏi phủ định',
    MAIN_IDEA: 'Ý chính / Chủ đề',
    PURPOSE: 'Mục đích bài nói/hội thoại',
    DETAIL: 'Chi tiết cụ thể',
    INFERENCE: 'Suy luận ngữ cảnh',
    NEXT_ACTION: 'Hành động tiếp theo',
    SPEAKER_LOCATION: 'Địa điểm người nói',
    SPEAKER_RELATIONSHIP: 'Mối quan hệ người nói',
    GRAPHIC_DATA: 'Kết hợp hình ảnh / Biểu đồ',
    IMPLIED_MEANING: 'Ý ngụ ý người nói',
  };

  return labelMap[category] || category;
}

/**
 * Returns human-readable label and advice for trap types.
 */
export function getLcTrapLabelVi(trap: LCTrapType): { label: string; advice: string } {
  switch (trap) {
    case 'KEYWORD_REPETITION':
      return {
        label: 'Bẫy lặp từ khóa (Keyword Repetition)',
        advice: 'TOEIC thường dùng lại từ xuất hiện trong câu hỏi để gài bẫy. Hãy chú ý nghĩa toàn câu thay vì chỉ bắt từ.',
      };
    case 'SIMILAR_SOUND':
      return {
        label: 'Bẫy từ đồng âm / phát âm tương tự',
        advice: 'Cẩn thận với các cặp từ như coffee/copy, plant/plan, walk/work.',
      };
    case 'WRONG_TIME_LOCATION':
      return {
        label: 'Bẫy nhầm thông tin Thời gian - Địa điểm',
        advice: 'Câu hỏi hỏi WHERE nhưng đáp án trả lời WHEN hoặc ngược lại.',
      };
    case 'WRONG_SUBJECT':
      return {
        label: 'Bẫy sai chủ ngữ hành động',
        advice: 'Hành động có xảy ra nhưng do người khác thực hiện.',
      };
    case 'WRONG_ACTION':
      return {
        label: 'Bẫy sai động tác đang diễn ra',
        advice: 'Vật thể có trong tranh nhưng hành động đang diễn ra không khớp.',
      };
    case 'EXTREME_STATEMENT':
      return {
        label: 'Bẫy từ ngữ tuyệt đối',
        advice: 'Các từ như always, never, completely thường là bẫy.',
      };
    case 'PARTIALLY_CORRECT':
      return {
        label: 'Bẫy đúng một nửa',
        advice: 'Vế trước đúng nhưng vế sau chứa thông tin sai.',
      };
    case 'CONTEXT_MISMATCH':
      return {
        label: 'Bẫy lệch ngữ cảnh hội thoại',
        advice: 'Từ ngữ mang tính chuyên môn nhưng không phù hợp với tình huống trao đổi.',
      };
    default:
      return {
        label: 'Không có bẫy đặc biệt',
        advice: 'Tập trung nghe bắt ý nghĩa chính xác.',
      };
  }
}

/**
 * Extracts flattened QuestionEvalInput list from an LCExamDocument for score computation.
 */
export function extractAllEvaluationQuestions(examData: {
  parts: {
    part1: { questions: { questionNumber: number; correctAnswer: string; category: string; trapType: LCTrapType }[] };
    part2: { questions: { questionNumber: number; correctAnswer: string; category: string; trapType: LCTrapType }[] };
    part3: { conversations: { questions: { questionNumber: number; correctAnswer: string; category: string; trapType: LCTrapType }[] }[] };
    part4: { talks: { questions: { questionNumber: number; correctAnswer: string; category: string; trapType: LCTrapType }[] }[] };
  };
}): QuestionEvalInput[] {
  const questionList: QuestionEvalInput[] = [];

  examData.parts.part1.questions.forEach((questionItem) => {
    questionList.push({
      questionNumber: questionItem.questionNumber,
      part: 1,
      correctAnswer: questionItem.correctAnswer,
      category: questionItem.category,
      trapType: questionItem.trapType,
    });
  });

  examData.parts.part2.questions.forEach((questionItem) => {
    questionList.push({
      questionNumber: questionItem.questionNumber,
      part: 2,
      correctAnswer: questionItem.correctAnswer,
      category: questionItem.category,
      trapType: questionItem.trapType,
    });
  });

  examData.parts.part3.conversations.forEach((conv) => {
    conv.questions.forEach((subQ) => {
      questionList.push({
        questionNumber: subQ.questionNumber,
        part: 3,
        correctAnswer: subQ.correctAnswer,
        category: subQ.category,
        trapType: subQ.trapType,
      });
    });
  });

  examData.parts.part4.talks.forEach((talk) => {
    talk.questions.forEach((subQ) => {
      questionList.push({
        questionNumber: subQ.questionNumber,
        part: 4,
        correctAnswer: subQ.correctAnswer,
        category: subQ.category,
        trapType: subQ.trapType,
      });
    });
  });

  return questionList;
}

