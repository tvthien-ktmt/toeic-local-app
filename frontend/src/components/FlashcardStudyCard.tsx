import React from 'react';
import { Sparkles, Volume2, RotateCw } from 'lucide-react';
import type { VocabularyItem } from '../api/vocabulary';
import { speakText } from '../utils/tts';

interface FlashcardStudyCardProps {
  currentCard: VocabularyItem | undefined;
  cardIndex: number;
  totalCards: number;
  isFlipped: boolean;
  isLoading: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * 3D flip card component for spaced repetition vocabulary memorization with IPA and contextual examples.
 */
export const FlashcardStudyCard: React.FC<FlashcardStudyCardProps> = ({
  currentCard,
  cardIndex,
  totalCards,
  isFlipped,
  isLoading,
  onFlip,
  onPrev,
  onNext,
}) => {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-theme-secondary space-y-2">
        <RotateCw className="w-8 h-8 animate-spin mx-auto text-theme-accent" />
        <p className="text-sm">Đang tải thẻ Flashcard...</p>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="p-16 text-center rounded-3xl bg-theme-surface border border-dashed border-theme space-y-3">
        <Sparkles className="w-12 h-12 mx-auto text-theme-secondary" />
        <p className="text-theme-primary font-bold text-base">Chưa có từ vựng nào trong danh sách</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Container */}
      <div
        onClick={onFlip}
        className="w-full min-h-[340px] p-8 sm:p-10 rounded-3xl bg-theme-surface border border-theme shadow-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-theme-accent relative overflow-hidden select-none"
      >
        {/* Header info */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-xl bg-theme-surface-2 text-theme-secondary text-xs font-mono font-bold border border-theme">
            Thẻ {cardIndex + 1} / {totalCards}
          </span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              speakText(currentCard.word);
            }}
            className="p-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-accent border border-theme transition"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Flip Content */}
        <div className="py-8 text-center space-y-4">
          {!isFlipped ? (
            <div className="space-y-3 animate-in fade-in">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-theme-accent tracking-wide select-text">
                {currentCard.word}
              </h2>
              <p className="text-sm font-mono text-theme-secondary">
                {currentCard.ipa} • {currentCard.part_of_speech}
              </p>
              <span className="text-xs text-theme-secondary block italic pt-4">
                (Bấm để lật xem nghĩa & câu ví dụ)
              </span>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-theme-success select-text">
                {currentCard.meaning_vi}
              </h3>
              {currentCard.example_sentence && (
                <p className="text-sm text-theme-primary italic max-w-md mx-auto leading-relaxed border-t border-theme pt-3 select-text">
                  "{currentCard.example_sentence}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Tag */}
        <div className="flex items-center justify-between text-xs text-theme-secondary border-t border-theme pt-3">
          <span className="capitalize font-semibold text-theme-accent">
            Album: {currentCard.topic_category}
          </span>
          <span>{currentCard.appears_in_part || 'TOEIC Overall'}</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-3 rounded-2xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-xs font-bold transition shadow-lg"
        >
          &larr; Thẻ trước
        </button>

        <button
          onClick={onFlip}
          className="px-6 py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-lg transition"
        >
          {isFlipped ? 'Xem từ gốc' : 'Lật thẻ'}
        </button>

        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-2xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-xs font-bold transition shadow-lg"
        >
          Thẻ tiếp &rarr;
        </button>
      </div>
    </div>
  );
};
