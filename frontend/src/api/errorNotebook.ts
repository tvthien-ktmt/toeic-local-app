import axios from 'axios';

export interface ErrorNotebookItem {
  id: number;
  part: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
  common_trap?: string;
  wrong_count: number;
  correct_count: number;
  status: 'needs_review' | 'mastered';
  last_attempted_at: string | null;
}

export interface ErrorNotebookResponse {
  status: string;
  total_mistakes: number;
  filtered_total: number;
  mastered_count: number;
  needs_review_count: number;
  topics_breakdown: { topic: string; count: number }[];
  page: number;
  limit: number;
  items: ErrorNotebookItem[];
}

export interface RetestAttemptResponse {
  status: string;
  is_correct: boolean;
  correct_answer: string;
  user_answer: string;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  common_trap?: string;
  grammar_topic: string;
  total_correct: number;
  total_wrong: number;
  is_mastered: boolean;
}

export interface RetestSessionResponse {
  status: string;
  session_type: string;
  total_questions: number;
  questions: ErrorNotebookItem[];
}

/**
 * Fetches aggregated error notebook items with optional filters.
 */
export async function fetchErrorNotebook(params?: {
  part?: number;
  grammar_topic?: string;
  status_filter?: 'all' | 'needs_review' | 'mastered';
  page?: number;
  limit?: number;
}): Promise<ErrorNotebookResponse> {
  const response = await axios.get<ErrorNotebookResponse>('/api/errors/notebook', { params });

  return response.data;
}

/**
 * Generates a targeted retest session for error remediation.
 */
export async function fetchRetestSession(params?: {
  limit?: number;
  part?: number;
  grammar_topic?: string;
}): Promise<RetestSessionResponse> {
  const response = await axios.get<RetestSessionResponse>('/api/errors/retest-session', { params });

  return response.data;
}

/**
 * Submits a retest answer attempt and receives immediate diagnostic feedback.
 */
export async function submitRetestAttempt(data: {
  question_id: number;
  selected_option: string;
  time_spent_seconds: number;
}): Promise<RetestAttemptResponse> {
  const response = await axios.post<RetestAttemptResponse>('/api/errors/retest-attempt', data);

  return response.data;
}
