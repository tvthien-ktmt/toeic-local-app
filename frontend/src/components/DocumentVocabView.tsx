import React from 'react';
import { BookOpen, Volume2 } from 'lucide-react';
import type { VocabularyItem } from '../api/vocabulary';
import { speakText } from '../utils/tts';

interface DocumentVocabViewProps {
  vocabList: VocabularyItem[];
}

/**
 * Grid view displaying extracted vocabulary cards with IPA, parts of speech, Vietnamese definitions, and audio pronunciation.
 */
export const DocumentVocabView: React.FC<DocumentVocabViewProps> = ({ vocabList }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-theme-accent" />
        Danh sách từ vựng trích xuất ({vocabList.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vocabList.map((vocabItem) => (
          <div key={vocabItem.id} className="p-4 rounded-2xl bg-theme-surface-2 border border-theme space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-theme-accent">{vocabItem.word}</span>
              <button
                onClick={() => speakText(vocabItem.word)}
                className="p-1 text-theme-secondary hover:text-theme-accent transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-theme-secondary font-mono">
              {vocabItem.ipa} • {vocabItem.part_of_speech}
            </p>
            <p className="text-sm font-semibold text-theme-success">{vocabItem.meaning_vi}</p>
            {vocabItem.example_sentence && (
              <p className="text-xs text-theme-primary italic border-l-2 border-theme-accent pl-2">
                "{vocabItem.example_sentence}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
