import axios from 'axios';

export interface DocumentSummary {
  id: number;
  filename: string;
  doc_type: 'RC_EXAM' | 'LC_TRANSCRIPT';
  content_hash: string | null;
  status: string;
  uploaded_at: string;
  markdown_length: number;
}

export interface DocumentDetail extends DocumentSummary {
  markdown_content: string;
}

export interface TestItem {
  id: number;
  test_number: number;
  filename: string;
  highest_score: number | null;
  highest_raw?: number | null;
  average_score?: number | null;
  attempt_count?: number;
  difficulty_rating?: string;
  format_similarity?: string;
  status?: string;
  last_completed?: string | null;
}

export interface SeriesItem {
  series_title: string;
  total_tests: number;
  tests: TestItem[];
}

export interface CatalogCategory {
  category_name: string;
  series: SeriesItem[];
}

export interface DashboardWeaknessItem {
  grammar_topic: string;
  error_rate: number;
  wrong: number;
  skipped: number;
  correct: number;
  total_questions: number;
}

export interface DashboardExamHistoryItem {
  id: number;
  mode: string;
  exam_title: string;
  completed_at: string;
  time_spent_seconds: number;
  toeic_score: number;
  raw_score: number;
  total_questions: number;
  part5_correct: number;
  part6_correct: number;
  part7_correct: number;
}

export interface TodayPlanStep {
  step: number;
  title: string;
  description: string;
  target_time: string;
  action_tab: string;
  badge: string;
}

export interface DashboardSummaryData {
  total_vocab: number;
  learned_vocab: number;
  unlearned_vocab: number;
  total_attempts: number;
  total_learned_correct?: number;
  overall_accuracy: number;
  total_study_min_7d?: number;
  active_days_7d?: number;
  part5_avg_speed_sec?: number;
  part6_avg_speed_sec?: number;
  part7_avg_speed_sec?: number;
  estimated_rc_range?: {
    min_score: number;
    max_score: number;
    mid_score: number;
    confidence: string;
  };
  target_tracker?: {
    target_score: number;
    current_estimated: number;
    gap: number;
    progress_pct: number;
  };
  primary_weaknesses?: string[];
  today_adaptive_plan?: TodayPlanStep[];
  part_stats?: { part_name: string; accuracy_rate: number; total_attempts: number }[];
  topic_progress?: { topic_category: string; learned_words: number; total_words: number; mastery_rate: number }[];
  grammar_stats?: { grammar_topic: string; accuracy_rate: number; total_attempts: number }[];
  examHistory?: DashboardExamHistoryItem[];
  weaknessData?: DashboardWeaknessItem[];
}

const API_BASE = '/api/documents';

/**
 * Uploads a PDF or Markdown file with specified document type for extraction.
 */
export const uploadDocument = async (file: File, docType: 'RC_EXAM' | 'LC_TRANSCRIPT'): Promise<DocumentDetail> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const response = await axios.post<DocumentDetail>(`${API_BASE}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Fetches summary list of all uploaded exam papers and transcripts.
 */
export const fetchDocuments = async (): Promise<DocumentSummary[]> => {
  const response = await axios.get<DocumentSummary[]>(API_BASE);

  return response.data;
};

/**
 * Retrieves full document details including raw markdown and extraction status.
 */
export const fetchDocumentById = async (id: number): Promise<DocumentDetail> => {
  const response = await axios.get<DocumentDetail>(`${API_BASE}/${id}`);

  return response.data;
};

/**
 * Deletes an uploaded document and associated questions/vocab from SQLite database.
 */
export const deleteDocument = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};

/**
 * Fetches the ETS textbook catalog organized by test year series.
 */
export const fetchCatalog = async (): Promise<CatalogCategory[]> => {
  const response = await axios.get<CatalogCategory[]>('/api/textbooks/catalog');

  return response.data;
};

/**
 * Alias for fetchCatalog to maintain compatibility with textbook catalog components.
 */
export const fetchTextbookCatalog = fetchCatalog;

export interface CoverageMatrixRow {
  part: number;
  skill: string;
  subskill: string;
  sample_patterns: string;
  attempts: number;
  mastery_rate: number;
  status: 'NOT_STARTED' | 'PRACTICING' | 'PROFICIENT' | 'MASTERED';
}

export interface CoverageMatrixResponse {
  status: string;
  total_categories: number;
  covered_categories: number;
  overall_coverage_pct: number;
  rows: CoverageMatrixRow[];
}

/**
 * Fetches the TOEIC RC skill coverage matrix and mastery distribution across all 3 Parts.
 */
export const fetchCoverageMatrix = async (): Promise<CoverageMatrixResponse> => {
  const response = await axios.get<CoverageMatrixResponse>('/api/dashboard/coverage-matrix');

  return response.data;
};

/**
 * Fetches overall dashboard learning statistics, streak, and recent exam history.
 */
export const fetchDashboardSummary = async (): Promise<DashboardSummaryData> => {
  const response = await axios.get<DashboardSummaryData>('/api/dashboard/summary');

  return response.data;
};
