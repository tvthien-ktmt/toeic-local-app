import React from 'react';
import { Flag, CheckCircle2, XCircle } from 'lucide-react';
import type { Part6QuestionData } from '../../../types/toeicContent';

interface Part6QuestionRendererProps {
  question: Part6QuestionData;
  selectedOption?: string;
  isFlagged?: boolean;
  isRevealed?: boolean;
  isSubmitted?: boolean;
  mode?: 'full_exam' | 'practice';
  cardRef?: (element: HTMLDivElement | null) => void;
  onSelectAnswer: (questionNumber: number, optionKey: string) => void;
  onToggleFlag: (questionNumber: number) => void;
}

/**
 * Compact question card for Part 6 text completion linked to passage blank.
 */
export const Part6QuestionRenderer: React.FC<Part6QuestionRendererProps> = ({
  question,
  selectedOption,
  isFlagged = false,
  isSubmitted = false,
  cardRef,
  onSelectAnswer,
  onToggleFlag,
}) => {
  const isCorrect = isSubmitted && selectedOption === question.correct_answer;
  const isWrong = isSubmitted && selectedOption && selectedOption !== question.correct_answer;

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border transition-all duration-200 p-4 bg-theme-surface shadow-sm ${
        isCorrect
          ? 'border-emerald-500/50 bg-emerald-500/5'
          : isWrong
          ? 'border-rose-500/50 bg-rose-500/5'
          : selectedOption
          ? 'border-theme-accent/40 ring-1 ring-theme-accent/20'
          : 'border-theme hover:border-theme-accent/30'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-theme-accent text-white font-mono text-xs font-black shadow-xs">
            {question.number}
          </span>
          <span className="text-xs text-theme-secondary italic font-medium">
            Điền vào ô trống [{question.number}]
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleFlag(question.number)}
          className={`p-1.5 rounded-lg transition-colors ${
            isFlagged
              ? 'text-amber-500 bg-amber-500/15'
              : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2'
          }`}
          title="Đánh dấu câu phân vân"
        >
          <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          const isAnswerKey = isSubmitted && question.correct_answer === opt.key;
          const isSelectedWrong = isSubmitted && isSelected && !isAnswerKey;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelectAnswer(question.number, opt.key)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                isAnswerKey
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                  : isSelectedWrong
                  ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : isSelected
                  ? 'border-theme-accent bg-theme-accent text-white shadow-xs'
                  : 'border-theme bg-theme-surface-2/40 hover:bg-theme-surface-2 text-theme-primary hover:border-theme-accent/40'
              }`}
            >
              <span
                className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                  isSelected
                    ? 'bg-white text-theme-accent'
                    : isAnswerKey
                    ? 'bg-emerald-500 text-white'
                    : 'bg-theme-surface text-theme-secondary border border-theme'
                }`}
              >
                {opt.key}
              </span>
              <span className="truncate">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {isSubmitted && question.explanation && (
        <div className="mt-3 pt-2 border-t border-theme/50 text-xs text-theme-secondary flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          )}
          <span>
            Đáp án: <strong>({question.correct_answer})</strong> — {question.explanation}
          </span>
        </div>
      )}
    </div>
  );
};
