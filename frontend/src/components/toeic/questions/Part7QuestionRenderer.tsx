import React from 'react';
import { Flag, CheckCircle2, XCircle } from 'lucide-react';
import { InlineRenderer } from '../content/InlineRenderer';
import type { Part7QuestionData } from '../../../types/toeicContent';

interface Part7QuestionRendererProps {
  question: Part7QuestionData;
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
 * Question renderer for Part 7 reading comprehension with taxonomy badges and sentence insertion option indicators.
 */
export const Part7QuestionRenderer: React.FC<Part7QuestionRendererProps> = ({
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

  const isSentenceInsertion = question.question_type === 'SENTENCE_INSERTION';

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 bg-theme-surface shadow-sm ${
        isCorrect
          ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
          : isWrong
          ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20'
          : selectedOption
          ? 'border-theme-accent/40 ring-1 ring-theme-accent/20'
          : 'border-theme hover:border-theme-accent/30'
      }`}
    >
      {/* Header and Stem */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 px-2.5 py-0.5 rounded-lg bg-theme-accent text-white font-mono text-xs font-black shadow-xs">
            {question.number}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-theme-surface-2 text-theme-secondary border border-theme">
                {question.question_type.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm font-semibold text-theme-primary leading-relaxed">
              <InlineRenderer nodes={question.stem.children} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleFlag(question.number)}
          className={`shrink-0 p-1.5 rounded-lg transition-colors ${
            isFlagged
              ? 'text-amber-500 bg-amber-500/15'
              : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2'
          }`}
          title="Đánh dấu câu phân vân"
        >
          <Flag className={`w-4 h-4 ${isFlagged ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* 4 Options */}
      <div className={`grid gap-2.5 mt-3.5 ${isSentenceInsertion ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1'}`}>
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
              <span className="leading-snug">
                {opt.position ? `Vị trí [${opt.position}]` : opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Review block */}
      {isSubmitted && question.explanation && (
        <div className="mt-3.5 pt-2.5 border-t border-theme/60 text-xs text-theme-secondary space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-theme-primary">
            {isCorrect ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>Đáp án: ({question.correct_answer})</span>
          </div>
          <p className="text-theme-secondary leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
