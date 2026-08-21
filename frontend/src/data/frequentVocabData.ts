export interface FrequentVocabItem {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  frequencyLevel: 'LEVEL_1_ULTRA' | 'LEVEL_2_HIGH' | 'LEVEL_3_FREQUENT';
  frequencyScore: number;
  topicCategory: string;
  appearsInParts: string[];
  collocations: string[];
  exampleSentenceEn: string;
  exampleSentenceVi: string;
  paraphrasePairs: { original: string; synonym: string }[];
}

/**
 * Curated list of frequent high-yield TOEIC vocabulary items.
 * Currently waiting for user to import official dataset.
 */
export const FREQUENT_HIGH_YIELD_VOCABULARY: FrequentVocabItem[] = [];
