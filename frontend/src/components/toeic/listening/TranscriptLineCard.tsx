import React from 'react';
import { Volume2 } from 'lucide-react';
import type { LCTranscriptLine, LCTranscriptWord } from '../../../types/toeicListening';

interface TranscriptLineCardProps {
  line: LCTranscriptLine;
  speakerLabel?: string;
  speakerEmoji?: string;
  isPlaying: boolean;
  isShowVietnamese: boolean;
  vocabularyList?: LCTranscriptWord[];
  onSpeakLine: (lineId: string, text: string) => void;
  onSelectWord: (word: LCTranscriptWord) => void;
}

/**
 * Single transcript line card with speaker label, interactive vocabulary highlighting,
 * inline audio playback button, and optional Vietnamese translation toggle.
 * Shared between Part 3 conversation and Part 4 talk transcript renderers.
 */
export const TranscriptLineCard: React.FC<TranscriptLineCardProps> = ({
  line,
  speakerLabel = 'Speaker',
  speakerEmoji,
  isPlaying,
  isShowVietnamese,
  vocabularyList,
  onSpeakLine,
  onSelectWord,
}) => {

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        isPlaying
          ? 'border-theme-accent bg-theme-accent/10 shadow-xs'
          : 'border-theme/40 bg-theme-surface hover:border-theme'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-bold text-theme-accent flex items-center gap-1.5">
          {speakerEmoji && <span>{speakerEmoji}</span>}
          <span>{speakerLabel}:</span>
        </span>

        <button
          onClick={() => onSpeakLine(line.id, line.textEn)}
          className="p-1 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2 cursor-pointer"
          title="Nghe câu này"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive words with vocabulary highlighting */}
      <p className="text-xs text-theme-primary leading-relaxed flex flex-wrap gap-x-1 gap-y-0.5">
        {line.textEn.split(' ').map((word: string, wordIndex: number) => {
          const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
          const matchedWord = vocabularyList?.find(
            (interactiveWord) => interactiveWord.word.toLowerCase() === cleanWord
          );

          if (matchedWord) {
            return (
              <span
                key={wordIndex}
                onClick={() => onSelectWord(matchedWord)}
                className="underline decoration-theme-accent decoration-2 underline-offset-2 font-semibold text-theme-accent hover:text-theme-accent-hover cursor-pointer"
                title={`Nhấp tra từ: ${matchedWord.meaningVi}`}
              >
                {word}
              </span>
            );
          }

          return <span key={wordIndex}>{word}</span>;
        })}
      </p>

      {isShowVietnamese && line.textVi && (
        <p className="text-[11px] text-theme-secondary mt-1.5 pt-1.5 border-t border-theme/30 italic">
          {line.textVi}
        </p>
      )}
    </div>
  );
};
