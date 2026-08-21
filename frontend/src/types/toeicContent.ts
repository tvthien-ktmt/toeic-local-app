export type DocumentType =
  | 'EMAIL'
  | 'NOTICE'
  | 'MEMO'
  | 'ARTICLE'
  | 'ADVERTISEMENT'
  | 'RECEIPT'
  | 'WEBPAGE'
  | 'CHAT'
  | 'SCHEDULE'
  | 'FORM'
  | 'TABLE'
  | 'GENERIC';

export type PassageType = 'SINGLE' | 'DOUBLE' | 'TRIPLE';

export type QuestionType =
  | 'INCOMPLETE_SENTENCE'
  | 'TEXT_COMPLETION'
  | 'DETAIL'
  | 'MAIN_IDEA'
  | 'PURPOSE'
  | 'INFERENCE'
  | 'VOCABULARY'
  | 'REFERENCE'
  | 'NEGATIVE'
  | 'SENTENCE_INSERTION'
  | 'CROSS_REFERENCE';

export interface InlineNode {
  type: 'text' | 'bold' | 'italic' | 'underline' | 'link' | 'blank' | 'position_marker';
  text?: string;
  questionNumber?: number;
  blankId?: string;
  position?: number;
  markerId?: string;
  url?: string;
}

export interface EmailMetadata {
  from?: string;
  to?: string;
  cc?: string[];
  subject?: string;
  date?: string;
  attachments?: string[];
}

export interface ChatMessage {
  speaker: string;
  time: string;
  text: string;
  children?: InlineNode[];
}

export interface ContentBlock {
  type:
    | 'paragraph'
    | 'heading'
    | 'subheading'
    | 'metadata'
    | 'list'
    | 'table'
    | 'divider'
    | 'quote'
    | 'signature'
    | 'chat_dialog'
    | 'form_field';
  text?: string;
  children?: InlineNode[];
  metadataType?: string;
  data?: EmailMetadata | Record<string, unknown>;
  items?: Array<{ text: string; children?: InlineNode[] }>;
  headers?: string[];
  rows?: string[][];
  messages?: ChatMessage[];
}

export interface DocumentData {
  document_id: string;
  document_type: DocumentType;
  title?: string;
  blocks: ContentBlock[];
}

export interface QuestionOption {
  key: string;
  text: string;
  position?: number;
}

export interface QuestionStem {
  type: 'paragraph';
  text: string;
  children?: InlineNode[];
}

export interface Part5QuestionData {
  number: number;
  part: 5;
  question_type: QuestionType;
  stem: QuestionStem;
  options: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
}

export interface Part6QuestionData {
  number: number;
  part: 6;
  question_type: QuestionType;
  linked_blank_id: string;
  stem: QuestionStem;
  options: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
}

export interface Part6PassageData {
  passage_id: string;
  header: string;
  start_q: number;
  end_q: number;
  document_type: DocumentType;
  blocks: ContentBlock[];
  questions: Part6QuestionData[];
}

export interface Part7QuestionData {
  number: number;
  part: 7;
  question_type: QuestionType;
  stem: QuestionStem;
  options: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
}

export interface Part7PassageSetData {
  passage_set_id: string;
  header: string;
  start_q: number;
  end_q: number;
  passage_type: PassageType;
  documents: DocumentData[];
  questions: Part7QuestionData[];
}

export interface NormalizedParts {
  part5: {
    part: 5;
    title: string;
    start_q: number;
    end_q: number;
    questions: Part5QuestionData[];
  };
  part6: {
    part: 6;
    title: string;
    start_q: number;
    end_q: number;
    passages: Part6PassageData[];
  };
  part7: {
    part: 7;
    title: string;
    start_q: number;
    end_q: number;
    passage_sets: Part7PassageSetData[];
  };
}

export interface StructuredExamPayload {
  status: string;
  document: {
    id: number;
    filename: string;
    category: string;
    series: string;
    test_number: number;
    is_builtin: boolean;
  };
  total_questions: number;
  parts: NormalizedParts;
  questions?: Array<{
    id: number;
    number: number;
    part: number;
    question_text: string;
    options: string[];
    correct_answer?: string;
    explanation?: string;
  }>;
}
