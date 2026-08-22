export interface DetailedQuestionResult {
  id: number;
  question_text: string;
  part: number;
  options: string[];
  correct_answer: string;
  user_answer: string | null;
  is_correct: boolean;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
  common_trap?: string;
}

export interface TimeAnalysisData {
  total_seconds: number;
  avg_seconds_per_question: number;
  part5_avg_seconds: number;
  part6_avg_seconds: number;
  part7_avg_seconds: number;
  part5_est_seconds: number;
  part6_est_seconds: number;
  part7_est_seconds: number;
  pacing_verdict: string;
  late_part7_warning: boolean;
}

export interface ExamResultData {
  attempt_id: number;
  exam_title: string;
  mode: string;
  raw_score: number;
  total_questions: number;
  gradeable_questions?: number;
  no_answer_key_count?: number;
  toeic_score: number;
  time_spent_seconds: number;
  part5_correct: number;
  part6_correct: number;
  part7_correct: number;
  completed_at: string;
  detailed_results: DetailedQuestionResult[];
  time_analysis?: TimeAnalysisData;
  document_id?: number;
}

export interface KeyVocabularyItem {
  word: string;
  pos?: string;
  meaning_vi: string;
}

export interface AiExplanationResult {
  detailed_explanation: string;
  grammar_recall?: string;
  grammar_topic?: string;
  source?: string;
  option_explanations?: Record<string, string>;
  common_trap?: string;
  sentence_translation?: string;
  translated_sentence?: string;
  exam_tip?: string | null;
  key_vocabulary?: KeyVocabularyItem[];
  vocabulary_breakdown?: KeyVocabularyItem[];
}
