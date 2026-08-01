import axios from 'axios';

export interface VocabularyItem {
  id: number;
  word: string;
  ipa: string | null;
  part_of_speech: string | null;
  meaning_vi: string | null;
  example_sentence: string | null;
  source_document_id: number;
  appears_in_part: string | null;
  topic_category: string | null;
  frequency_count: number;
  srs_level: number;
  next_review_at: string | null;
}

export interface VocabularyListResponse {
  total: number;
  page: number;
  limit: number;
  items: VocabularyItem[];
}

export interface TopicAlbum {
  topic_category: string;
  total_words: number;
  learned_words: number;
}

export interface TopicAlbumsResponse {
  total_albums: number;
  albums: TopicAlbum[];
}

export const fetchVocabulary = async (params: {
  document_id?: number;
  appears_in_part?: string;
  topic_category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<VocabularyListResponse> => {
  const response = await axios.get<VocabularyListResponse>('/api/vocabulary', { params });
  return response.data;
};

export const fetchTopicAlbums = async (): Promise<TopicAlbumsResponse> => {
  const response = await axios.get<TopicAlbumsResponse>('/api/vocabulary/topics/albums');
  return response.data;
};
