/**
 * TypeScript type definitions and interfaces for TOEIC Listening Comprehension (LC).
 * Covers Parts 1, 2, 3, 4, Audio Engine, Dictation, Shadowing, Trap Training,
 * Score Calculations (5-495), Weakness Diagnostics, and Spaced Repetition (SRS).
 */

export type LCPartNumber = 1 | 2 | 3 | 4;

export type LCTestMode = 'full_exam' | 'mini_test' | 'part_test' | 'practice';

export type LCQuestionCategory =
  // Part 1
  | 'PHOTOGRAPH_PEOPLE'
  | 'PHOTOGRAPH_OBJECTS'
  | 'PHOTOGRAPH_SCENE'
  // Part 2
  | 'WH_QUESTION'
  | 'YES_NO_QUESTION'
  | 'INDIRECT_QUESTION'
  | 'STATEMENT_RESPONSE'
  | 'CHOICE_QUESTION'
  | 'NEGATIVE_QUESTION'
  // Part 3 & 4
  | 'MAIN_IDEA'
  | 'PURPOSE'
  | 'DETAIL'
  | 'INFERENCE'
  | 'NEXT_ACTION'
  | 'SPEAKER_LOCATION'
  | 'SPEAKER_RELATIONSHIP'
  | 'GRAPHIC_DATA'
  | 'IMPLIED_MEANING';

export type LCTrapType =
  | 'KEYWORD_REPETITION'      // Lặp lại từ trong câu hỏi để lừa người nghe
  | 'SIMILAR_SOUND'           // Từ phát âm na ná (coffee/copy, walk/work)
  | 'WRONG_TIME_LOCATION'     // Trả lời địa điểm khi hỏi thời gian hoặc ngược lại
  | 'WRONG_SUBJECT'           // Sai chủ ngữ hành động
  | 'WRONG_ACTION'            // Đúng vật/người nhưng sai hành động đang diễn ra
  | 'EXTREME_STATEMENT'       // Dùng từ tuyệt đối (always, never, only)
  | 'PARTIALLY_CORRECT'       // Đúng một nửa vế đầu, sai vế sau
  | 'CONTEXT_MISMATCH'        // Dùng từ đúng chuyên ngành nhưng sai ngữ cảnh hội thoại
  | 'NONE';

export type LCTalkType =
  | 'ANNOUNCEMENT'
  | 'ADVERTISEMENT'
  | 'TELEPHONE_MESSAGE'
  | 'TOUR_PUBLIC_INFO'
  | 'WORKPLACE_PRESENTATION'
  | 'NEWS_BROADCAST'
  | 'INSTRUCTIONS';

export interface LCTranscriptWord {
  word: string;
  ipa?: string;
  meaningVi: string;
  collocations?: string[];
  isKeyword?: boolean;
  isParaphrase?: boolean;
}

export interface LCTranscriptLine {
  id: string;
  speaker?: string;           // 'Man', 'Woman', 'Speaker 1', 'Speaker 2', 'Narrator'
  speakerAvatar?: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  textEn: string;
  textVi: string;
  keywords?: string[];
  words?: LCTranscriptWord[];
}

export interface LCOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;               // In Part 1 & 2 exam mode, this text is hidden until review
  vietnameseText?: string;
  isCorrect?: boolean;
  trapType?: LCTrapType;
  trapExplanation?: string;
}

export interface Part1QuestionData {
  id: number;
  questionNumber: number;
  part: 1;
  imageUrl: string;
  imageAlt: string;
  audioUrl: string;
  options: LCOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  transcript: LCTranscriptLine[];
  explanation: string;
  category: LCQuestionCategory;
  trapType: LCTrapType;
  keywords: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Part2QuestionData {
  id: number;
  questionNumber: number;
  part: 2;
  audioUrl: string;
  promptText: string;         // Spoken question text (hidden during exam mode)
  promptTextVi?: string;
  options: LCOption[];        // Usually A, B, C (3 choices in Part 2)
  correctAnswer: 'A' | 'B' | 'C';
  transcript: LCTranscriptLine[];
  explanation: string;
  category: LCQuestionCategory;
  trapType: LCTrapType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface LCSubQuestionData {
  id: number;
  questionNumber: number;
  part: 3 | 4;
  stem: string;
  stemVi?: string;
  options: LCOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  category: LCQuestionCategory;
  trapType: LCTrapType;
  graphicImageUrl?: string;
  graphicHtml?: string;
  paraphrasePairs?: Array<{ original: string; paraphrased: string }>;
}

export interface Part3ConversationData {
  id: number;
  setId: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  part: 3;
  topic: string;
  audioUrl: string;
  audioDurationSeconds: number;
  speakers: Array<{ name: string; role: string }> | string[];
  transcript: LCTranscriptLine[];
  questions: LCSubQuestionData[];
  vocabularyList?: LCTranscriptWord[];
  graphicImageUrl?: string;
  graphicHtml?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Part4TalkData {
  id: number;
  setId: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  part: 4;
  talkType: LCTalkType;
  title: string;
  audioUrl: string;
  audioDurationSeconds: number;
  speaker: string;
  transcript: LCTranscriptLine[];
  questions: LCSubQuestionData[];
  vocabularyList?: LCTranscriptWord[];
  graphicImageUrl?: string;
  graphicHtml?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface NormalizedLCParts {
  part1: {
    part: 1;
    title: string;
    startQuestion: number;
    endQuestion: number;
    questions: Part1QuestionData[];
  };
  part2: {
    part: 2;
    title: string;
    startQuestion: number;
    endQuestion: number;
    questions: Part2QuestionData[];
  };
  part3: {
    part: 3;
    title: string;
    startQuestion: number;
    endQuestion: number;
    conversations: Part3ConversationData[];
  };
  part4: {
    part: 4;
    title: string;
    startQuestion: number;
    endQuestion: number;
    talks: Part4TalkData[];
  };
}

export interface LCExamDocument {
  id: number;
  title: string;
  series: string;
  category: 'ETS' | 'HACKER' | 'YBM' | 'XANH CAM';
  testNumber: number;
  totalQuestions: number;     // 100 for full test, 10-30 for mini test
  durationMinutes: number;    // 45 for full test
  audioUrl?: string;
  isBuiltin: boolean;
  parts?: NormalizedLCParts;
}

export interface StructuredLCExamPayload {
  status: string;
  document: LCExamDocument;
  totalQuestions: number;
  parts: NormalizedLCParts;
}

export interface LCDictationItem {
  id: number;
  sentenceId: string;
  audioUrl: string;
  audioDurationSeconds: number;
  fullSentenceEn: string;
  fullSentenceVi: string;
  vietnameseMeaning?: string;
  topic?: string;
  blankPositions?: number[];  // Word indices to hide in cloze mode
  blankWords?: string[];
  part: LCPartNumber;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Mastery';
  speakerAccent?: 'US' | 'UK' | 'AU' | 'CA';
}

export interface LCShadowingItem {
  id: number;
  title: string;
  part: LCPartNumber;
  audioUrl: string;
  speaker: string;
  speakerRole?: string;
  fullTextEn: string;
  fullTextVi: string;
  vietnameseMeaning?: string;
  audioDurationSeconds: number;
  recommendedSpeed: number;
}

export interface LCTrapTrainingItem {
  id: number;
  part: LCPartNumber;
  trapType: LCTrapType;
  title: string;
  description?: string;
  descriptionVi: string;
  howToAvoid?: string;
  exampleQuestion: {
    promptText: string;
    audioUrl: string;
    options: LCOption[];
    correctAnswer: string;
    correctOption?: string;
    trapOption: string;
    explanation?: string;
    analysisVi: string;
  };
}

export interface LCParaphraseItem {
  id: number;
  topic: string;
  spokenPhrase: string;
  paraphrasedInAnswer: string;
  writtenEquivalent?: string;
  vietnameseMeaning: string;
  audioUrl?: string;
  exampleContext?: string;
  contextExample?: string;
  contextMeaningVi?: string;
  frequency?: string;
}

export interface LCExamResult {
  examId: number;
  examTitle: string;
  mode: LCTestMode;
  totalQuestions: number;
  rawCorrectCount: number;
  scaledScore: number;        // Scaled score 5 to 495
  timeSpentSeconds: number;
  completedAt: string;
  partScores: {
    part1: { correct: number; total: number; percentage: number };
    part2: { correct: number; total: number; percentage: number };
    part3: { correct: number; total: number; percentage: number };
    part4: { correct: number; total: number; percentage: number };
  };
  categoryScores: Record<string, { correct: number; total: number; percentage: number }>;
  trapAnalysis: Record<LCTrapType, { missedCount: number; totalOccurrences: number }>;
  errorCauseBreakdown: {
    vocabulary: number;       // Percentage e.g. 35%
    paraphrase: number;       // e.g. 25%
    distractorTrap: number;   // e.g. 20%
    speechSpeed: number;      // e.g. 10%
    inference: number;        // e.g. 10%
  };
  userAnswers: Record<number, string>;
  weakestAreas: string[];
  recommendedActions: string[];
}

export interface LCErrorNotebookItem {
  id: string;
  questionNumber: number;
  part: LCPartNumber;
  questionStem: string;
  audioUrl: string;
  userSelectedOption: string;
  correctOption: string;
  trapType: LCTrapType;
  category: LCQuestionCategory;
  explanation: string;
  transcriptExcerpt: string;
  srsLevel: number;           // 0: New, 1: 1 day, 2: 3 days, 3: 7 days, 4: 14 days, 5: Mastered
  nextReviewDate: string;
  mistakeCount: number;
  notes?: string;
}

export interface LCAudioEngineState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  activeTranscriptLineId: string | null;
  isAudioLocked: boolean;     // In Exam mode, controls are locked
}
