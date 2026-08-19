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
  document_id?: number;
}

export interface HistoryAttempt {
  id: number;
  mode: string;
  raw_score: number;
  total_questions: number;
  toeic_score: number;
  time_spent_seconds: number;
  part5_correct: number;
  part6_correct: number;
  part7_correct: number;
  completed_at: string;
}
