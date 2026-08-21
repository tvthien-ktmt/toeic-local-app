import React from 'react';
import { Search, X } from 'lucide-react';
import type { LCTranscriptWord } from '../../../types/toeicListening';

interface TranscriptWordPopupModalProps {
  selectedWord: LCTranscriptWord | null;
  onClose: () => void;
}

/**
 * Interactive dictionary popup modal card displaying word definitions, phonetic IPA, and TOEIC collocations.
 */
export const TranscriptWordPopupModal: React.FC<TranscriptWordPopupModalProps> = ({
  selectedWord,
  onClose,
}) => {
  if (!selectedWord) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 max-w-sm w-full bg-theme-surface border border-theme-accent p-4 rounded-2xl shadow-2xl space-y-2 z-50 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-theme-accent text-sm">
          <Search className="w-4 h-4" />
          <span>{selectedWord.word}</span>
          <span className="text-xs font-normal text-theme-secondary">
            [{selectedWord.ipa}]
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-theme-secondary hover:text-theme-primary cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs font-medium text-theme-primary">
        {selectedWord.meaningVi}
      </p>

      {selectedWord.collocations && selectedWord.collocations.length > 0 && (
        <div className="text-[11px] text-theme-secondary pt-1 border-t border-theme/40">
          <strong>Cụm từ hay gặp:</strong> {selectedWord.collocations.join(' • ')}
        </div>
      )}
    </div>
  );
};
