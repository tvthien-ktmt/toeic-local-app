import type {
  LCDictationItem,
  LCShadowingItem,
  LCTrapTrainingItem,
  LCParaphraseItem,
  LCExamDocument
} from '../types/toeicListening';

/**
 * Empty typed array constants for Listening exercises (Dictation, Shadowing, Traps, Paraphrase).
 * Questions and audio files will be populated dynamically from database/backend.
 */
export const MOCK_LC_DICTATION_ITEMS: LCDictationItem[] = [];

/** Placeholder array for shadowing exercises — populated dynamically from backend audio segments. */
export const MOCK_LC_SHADOWING_ITEMS: LCShadowingItem[] = [];

/** Placeholder array for trap-recognition drills — populated dynamically from backend question bank. */
export const MOCK_LC_TRAP_ITEMS: LCTrapTrainingItem[] = [];

/** Placeholder array for paraphrase-matching exercises — populated dynamically from backend. */
export const MOCK_LC_PARAPHRASE_ITEMS: LCParaphraseItem[] = [];

/** Skeleton exam document for ETS 2024 LC Test 01 — serves as default until real data loads from API. */
export const MOCK_LC_EXAM_ETS2024_01: LCExamDocument = {
  id: 1101,
  title: 'ETS 2024 LC — Test 01',
  series: 'ETS 2024 LC',
  category: 'ETS',
  testNumber: 1,
  totalQuestions: 100,
  durationMinutes: 45,
  audioUrl: '',
  isBuiltin: true,
};
