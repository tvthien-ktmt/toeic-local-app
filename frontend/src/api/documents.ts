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
  part_stats?: { part_name: string; accuracy_rate: number; total_attempts: number }[];
  topic_progress?: { topic_category: string; learned_words: number; total_words: number; mastery_rate: number }[];
  grammar_stats?: { grammar_topic: string; accuracy_rate: number; total_attempts: number }[];
  examHistory?: {
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
  }[];
  weaknessData?: {
    grammar_topic: string;
    error_rate: number;
    wrong: number;
    skipped: number;
    correct: number;
    total_questions: number;
  }[];
}

const API_BASE = '/api/documents';

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

export const fetchDocuments = async (): Promise<DocumentSummary[]> => {
  const response = await axios.get<DocumentSummary[]>(API_BASE);
  return response.data;
};

export const fetchDocumentById = async (id: number): Promise<DocumentDetail> => {
  const response = await axios.get<DocumentDetail>(`${API_BASE}/${id}`);
  return response.data;
};

export const deleteDocument = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`${API_BASE}/${id}`);
  return response.data;
};

export const fetchTextbookCatalog = async (): Promise<CatalogCategory[]> => {
  const response = await axios.get<any>(`${API_BASE}/textbooks/catalog`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.catalog)) {
    return response.data.catalog;
  }
  return [];
};

export const fetchDashboardSummary = async (): Promise<DashboardSummaryData> => {
  const response = await axios.get<DashboardSummaryData>(`${API_BASE}/dashboard/summary`);
  return response.data;
};
