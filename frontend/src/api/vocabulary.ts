import axios from 'axios';

export interface VocabularyItem {
  id: number;
  word: string;
  ipa: string | null;
  part_of_speech: string | null;
  meaning_vi: string | null;
  example_sentence: string | null;
  source_document_id: number | null;
  appears_in_part: string | null;
  topic_category: string | null;
  frequency_count: number;
  srs_level: number;
  next_review_at: string | null;
  source_type?: string;
  parent_word?: string | null;
  in_flashcard?: boolean;
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

export interface VocabularyLookupResult {
  id: number;
  word: string;
  ipa: string | null;
  part_of_speech: string | null;
  meaning_vi: string | null;
  example_sentence: string | null;
  synonyms: string[];
  antonyms: string[];
  topic_category: string;
  source_type: string;
  in_flashcard: boolean;
}

export interface SuggestedVocabResult {
  id: number;
  word: string;
  ipa: string | null;
  part_of_speech: string | null;
  meaning_vi: string | null;
  example_sentence: string | null;
  synonyms: string[];
  topic_category: string;
  source_type: string;
  parent_word: string | null;
  in_flashcard: boolean;
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

export const lookupVocabularyWord = async (data: {
  word: string;
  context_sentence?: string;
  document_id?: number;
}): Promise<VocabularyLookupResult> => {
  const response = await axios.post<VocabularyLookupResult>('/api/vocabulary/lookup', data);
  return response.data;
};

export const suggestRelatedVocabulary = async (data: {
  word: string;
  topic_category?: string;
}): Promise<SuggestedVocabResult[]> => {
  const response = await axios.post<SuggestedVocabResult[]>('/api/vocabulary/suggest-related', data);
  return response.data;
};
