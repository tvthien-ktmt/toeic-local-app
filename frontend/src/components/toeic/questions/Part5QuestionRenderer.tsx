import React from 'react';
import { Flag, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { InlineRenderer } from '../content/InlineRenderer';
import type { Part5QuestionData } from '../../../types/toeicContent';

interface Part5QuestionRendererProps {
  question: Part5QuestionData;
  selectedOption?: string;
  isFlagged?: boolean;
  isRevealed?: boolean;
  isSubmitted?: boolean;
  mode?: 'full_exam' | 'practice';
  cardRef?: (element: HTMLDivElement | null) => void;
  onSelectAnswer: (questionNumber: number, optionKey: string) => void;
  onToggleFlag: (questionNumber: number) => void;
  onToggleExplanation?: (questionNumber: number) => void;
  onFetchAiExplanation?: (questionNumber: number) => void;
}

/**
 * Clean isolated question renderer for Part 5 Incomplete Sentences.
 */
export const Part5QuestionRenderer: React.FC<Part5QuestionRendererProps> = ({
  question,
  selectedOption,
  isFlagged = false,
  isSubmitted = false,
  cardRef,
  onSelectAnswer,
  onToggleFlag,
  onFetchAiExplanation,
}) => {
  const isCorrect = isSubmitted && selectedOption === question.correct_answer;
  const isWrong = isSubmitted && selectedOption && selectedOption !== question.correct_answer;

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 bg-theme-surface shadow-md ${
        isCorrect
          ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
          : isWrong
          ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20'
          : selectedOption
          ? 'border-theme-accent/40 ring-1 ring-theme-accent/20'
          : 'border-theme hover:border-theme-accent/30'
      }`}
    >
      {/* Question Header & Stem */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 px-2.5 py-0.5 rounded-lg bg-theme-accent text-white font-mono text-xs font-black shadow-xs">
            {question.number}
          </span>
          <div className="text-sm sm:text-base font-semibold text-theme-primary leading-relaxed">
            <InlineRenderer nodes={question.stem.children} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onFetchAiExplanation && (
            <button
              type="button"
              onClick={() => onFetchAiExplanation(question.number)}
              className="p-1.5 rounded-lg text-theme-accent bg-theme-accent/10 hover:bg-theme-accent hover:text-white transition-colors"
              title="Giải thích chi tiết bằng AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
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
            <Flag className={`w-4 h-4 ${isFlagged ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Options (A, B, C, D) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          const isAnswerKey = isSubmitted && question.correct_answer === opt.key;
          const isSelectedWrong = isSubmitted && isSelected && !isAnswerKey;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelectAnswer(question.number, opt.key)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-medium transition-all ${
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
                className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
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

      {/* Review / Explanation Block */}
      {isSubmitted && question.explanation && (
        <div className="mt-4 pt-3 border-t border-theme/60 text-xs sm:text-sm text-theme-secondary space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-theme-primary">
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500" />
            )}
            <span>Đáp án đúng: ({question.correct_answer})</span>
          </div>
          <p className="text-theme-secondary leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
