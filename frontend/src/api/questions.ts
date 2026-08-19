import axios from 'axios';

export interface QuestionItem {
  id: number;
  document_id: number;
  part: number;
  question_text: string;
  options: string[];
  correct_answer: string | null;
  explanation: string | null;
  option_explanations_json?: string | null;
  translated_sentence?: string | null;
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

export interface FetchQuestionsParams {
  document_id?: number;
  part?: number;
  grammar_topic?: string;
  topic_tag?: string;
  page?: number;
  limit?: number;
}

export interface TopicsSummaryResponse {
  grammar_topics: { topic: string; count: number }[];
  topic_tags: { tag: string; count: number }[];
}

/**
 * Triggers asynchronous background extraction pipeline (questions + vocabulary) for a document.
 */
export const triggerExtraction = async (docId: number): Promise<ExtractionResult> => {
  const response = await axios.post<ExtractionResult>(`/api/documents/${docId}/extract`);

  return response.data;
};

/**
 * Fetches paginated practice questions filtered by document, Part, or grammar topic.
 */
export const fetchQuestions = async (params: FetchQuestionsParams): Promise<QuestionListResponse> => {
  const response = await axios.get<QuestionListResponse>('/api/questions', { params });

  return response.data;
};

/**
 * Retrieves aggregate summary counts of questions grouped by grammar topics and passage topics.
 */
export const fetchTopicsSummary = async (): Promise<TopicsSummaryResponse> => {
  const response = await axios.get<TopicsSummaryResponse>('/api/questions/topics/summary');

  return response.data;
};

/**
 * Requests Gemini AI to generate a similar clone question mirroring the grammar topic and difficulty.
 */
export const generateSimilarQuestion = async (questionId: number): Promise<QuestionItem> => {
  const response = await axios.post<QuestionItem>(`/api/generate/similar/${questionId}`);

  return response.data;
};


