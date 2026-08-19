import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Volume2 } from 'lucide-react';
import type { VocabularyItem } from '../api/vocabulary';
import { speakText } from '../utils/tts';

interface FlashcardTypingViewProps {
  currentCard: VocabularyItem | undefined;
  cardIndex: number;
  totalCards: number;
  onNext: () => void;
}

/**
 * Interactive spelling and typing exercise view testing active recall of vocabulary words.
 */
export const FlashcardTypingView: React.FC<FlashcardTypingViewProps> = ({
  currentCard,
  cardIndex,
  totalCards,
  onNext,
}) => {
  const [typingInput, setTypingInput] = useState('');
  const [typingStatus, setTypingStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const handleCheckTyping = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentCard) {
      return;
    }

    const isMatch = typingInput.trim().toLowerCase() === currentCard.word.toLowerCase();
    if (isMatch) {
      setTypingStatus('correct');
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = setTimeout(() => {
        setTypingInput('');
        setTypingStatus('idle');
        onNext();
      }, 1200);
    } else {
      setTypingStatus('incorrect');
    }
  };

  if (!currentCard) {
    return (
      <div className="p-16 text-center rounded-3xl bg-theme-surface border border-dashed border-theme space-y-3">
        <Keyboard className="w-12 h-12 mx-auto text-theme-secondary" />
        <p className="text-theme-primary font-bold text-base">Chưa có từ vựng để luyện gõ</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-theme-surface rounded-3xl p-8 border border-theme shadow-2xl space-y-6">
        <div className="flex items-center justify-between text-xs font-mono text-theme-secondary">
          <span>Luyện gõ {cardIndex + 1} / {totalCards}</span>
          <button
            onClick={() => speakText(currentCard.word)}
            className="p-1.5 rounded-lg bg-theme-surface-2 text-theme-accent"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-2 py-4">
          <span className="text-xs text-theme-secondary uppercase font-bold tracking-wider">
            Gõ chính xác từ tiếng Anh cho nghĩa:
          </span>
          <h3 className="text-2xl font-extrabold text-theme-success">{currentCard.meaning_vi}</h3>
          <p className="text-xs text-theme-secondary italic font-mono">
            {currentCard.part_of_speech} • {currentCard.ipa}
          </p>
        </div>

        <form onSubmit={handleCheckTyping} className="space-y-4">
          <input
            type="text"
            value={typingInput}
            onChange={(event) => setTypingInput(event.target.value)}
            placeholder="Gõ từ tiếng Anh vào đây..."
            autoFocus
            className={`w-full p-4 rounded-2xl bg-theme-surface-2 border text-center font-bold text-lg text-theme-primary focus:outline-none transition ${
              typingStatus === 'correct'
                ? 'border-theme-success alert-success font-bold'
                : typingStatus === 'incorrect'
                ? 'border-theme-error alert-error font-bold'
                : 'border-theme focus:border-theme-accent'
            }`}
          />

          {typingStatus === 'incorrect' && (
            <p className="text-xs font-bold text-theme-error text-center animate-bounce">
              Chưa chính xác! Đáp án đúng: <span className="font-mono underline">{currentCard.word}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-theme-accent text-white font-bold text-sm shadow-lg transition"
          >
            Kiểm tra kết quả
          </button>
        </form>
      </div>
    </div>
  );
};
