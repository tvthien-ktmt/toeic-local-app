import React from 'react';
import { Flag } from 'lucide-react';
import { getFullToeicQuestion } from '../../data/fullToeicExamData';

interface FullToeicQuestionCardProps {
  currentQuestionNumber: number;
  selectedAnswer?: string;
  isFlagged?: boolean;
  startQ: number;
  endQ: number;
  onSelectOption: (questionNumber: number, optionKey: string) => void;
  onToggleFlag: (questionNumber: number) => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
}

/**
 * Question presentation card with 4 choices, flag trigger, and navigation for Full TOEIC exam.
 */
export const FullToeicQuestionCard: React.FC<FullToeicQuestionCardProps> = ({
  currentQuestionNumber,
  selectedAnswer,
  isFlagged = false,
  startQ,
  endQ,
  onSelectOption,
  onToggleFlag,
  onPreviousQuestion,
  onNextQuestion,
}) => {
  const choices = ['A', 'B', 'C', 'D'] as const;
  const questionItem = getFullToeicQuestion(currentQuestionNumber);

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-theme-accent/15 text-theme-accent font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
            {currentQuestionNumber}
          </span>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">
              {questionItem.partName}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-theme-primary leading-relaxed">
              {questionItem.promptEn}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleFlag(currentQuestionNumber)}
          className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer shrink-0 ${
            isFlagged
              ? 'bg-theme-warning/20 border-theme-warning/40 text-theme-warning'
              : 'border-theme text-theme-secondary hover:bg-theme-surface-2'
          }`}
          title="Đánh dấu câu hỏi"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Choices A, B, C, D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {choices.map((letter) => {
          const isSelected = selectedAnswer === letter;
          const optionText = questionItem.options[letter];

          return (
            <button
              key={letter}
              type="button"
              onClick={() => onSelectOption(currentQuestionNumber, letter)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                isSelected
                  ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold ring-1 ring-theme-accent'
                  : 'border-theme hover:bg-theme-surface-2 text-theme-primary'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-theme-accent text-white'
                    : 'bg-theme-surface-2 text-theme-secondary border border-theme'
                }`}
              >
                {letter}
              </span>
              <span className="text-xs leading-relaxed">
                {optionText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation Back / Next */}
      <div className="flex items-center justify-between pt-4 border-t border-theme/40">
        <button
          type="button"
          onClick={onPreviousQuestion}
          disabled={currentQuestionNumber === startQ}
          className="px-4 py-2 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 disabled:opacity-40 transition-colors cursor-pointer"
        >
          Câu Trước
        </button>

        <button
          type="button"
          onClick={onNextQuestion}
          disabled={currentQuestionNumber === endQ}
          className="px-5 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-xs hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
        >
          Câu Tiếp Theo
        </button>
      </div>
    </div>
  );
};
