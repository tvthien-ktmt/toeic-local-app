export interface QuestionTypeDrillItem {
  id: string;
  part: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4' | 'Part 5' | 'Part 6' | 'Part 7';
  questionTypeCategory:
    | 'P5_WORD_FORM'
    | 'P5_VERB_TENSE'
    | 'P5_PREPOSITIONS_CONJUNCTIONS'
    | 'P5_PARTICIPLES'
    | 'P6_SENTENCE_INSERTION'
    | 'P6_CONTEXT_VOCAB'
    | 'P7_MAIN_IDEA'
    | 'P7_DETAIL'
    | 'P7_NOT_EXCEPT'
    | 'P7_INFERENCE';
  typeNameVi: string;
  passageText?: string;
  questionStem: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  detailedExplanationVi: string;
  tacticsAppliedVi: string;
}

/**
 * Question-type practice drill items with detailed answer explanations and applied tactics.
 * Currently waiting for user to import official questions.
 */
export const QUESTION_TYPE_DRILLS: QuestionTypeDrillItem[] = [];
