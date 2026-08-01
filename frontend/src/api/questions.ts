import axios from 'axios';

export interface QuestionItem {
  id: number;
  document_id: number;
  part: number;
  question_text: string;
  options: string[];
  correct_answer: string | null;
  explanation: string | null;
  grammar_topic: string;
  topic_tag: string | null;
  is_generated: boolean;
  created_at: string;
}

export interface QuestionListResponse {
  total: number;
  page: number;
  limit: number;
  items: QuestionItem[];
}

export interface ExtractionResult {
  document_id: number;
  status: string;
  questions_count: number;
  vocabulary_count: number;
  chunks_processed: number;
}

export const triggerExtraction = async (docId: number): Promise<ExtractionResult> => {
  const response = await axios.post<ExtractionResult>(`/api/documents/${docId}/extract`);
  return response.data;
};

export const fetchQuestions = async (params: {
  document_id?: number;
  part?: number;
  grammar_topic?: string;
  topic_tag?: string;
  page?: number;
  limit?: number;
}): Promise<QuestionListResponse> => {
  const response = await axios.get<QuestionListResponse>('/api/questions', { params });
  return response.data;
};

export const fetchTopicsSummary = async (): Promise<{
  grammar_topics: { topic: string; count: number }[];
  topic_tags: { tag: string; count: number }[];
}> => {
  const response = await axios.get('/api/questions/topics/summary');
  return response.data;
};

export const generateSimilarQuestion = async (questionId: number): Promise<QuestionItem> => {
  const response = await axios.post<QuestionItem>(`/api/generate/similar/${questionId}`);
  return response.data;
};

