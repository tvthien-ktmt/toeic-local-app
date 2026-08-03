import axios from 'axios';

export interface GrammarReference {
  id: number;
  topic_name: string;
  formula: string;
  key_rules: string[];
  example_sentences: string[];
  created_at: string;
}

export const fetchGrammarReference = async (topic_name: string): Promise<GrammarReference> => {
  const response = await axios.get<GrammarReference>(`/api/grammar-reference/${encodeURIComponent(topic_name)}`);
  return response.data;
};
