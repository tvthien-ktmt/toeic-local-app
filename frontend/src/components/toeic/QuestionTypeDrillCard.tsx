import React from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';
import type { QuestionTypeDrillItem } from '../../data/questionTypeDrillsData';

interface QuestionTypeDrillCardProps {
  currentDrill: QuestionTypeDrillItem;
  currentDrillIndex: number;
  totalDrillsCount: number;
  selectedAnswer: string | null;
  isAnswerSubmitted: boolean;
  onSelectOption: (key: string) => void;
  onCheckAnswer: () => void;
  onNextDrill: () => void;
  onResetPractice: () => void;
}

/**
 * Question drill presentation card with passage, options, and applied tactics feedback.
 */
export const QuestionTypeDrillCard: React.FC<QuestionTypeDrillCardProps> = ({
  currentDrill,
  currentDrillIndex,
  totalDrillsCount,
  selectedAnswer,
  isAnswerSubmitted,
  onSelectOption,
  onCheckAnswer,
  onNextDrill,
  onResetPractice,
}) => {
  return (
    <div className="bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Type Badge & Progress Indicator */}
      <div className="flex items-center justify-between border-b border-theme/50 pb-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-theme-accent/15 text-theme-accent border border-theme-accent/30">
          {currentDrill.typeNameVi}
        </span>
        <span className="text-xs font-semibold text-theme-secondary">
          Câu {currentDrillIndex + 1} / {totalDrillsCount}
        </span>
      </div>

      {/* Passage Text if present (Part 6 / Part 7) */}
      {currentDrill.passageText && (
        <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface-2 border border-theme text-xs sm:text-sm text-theme-primary leading-relaxed">
          <span className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block mb-2">
            Đoạn Văn Bài Đọc:
          </span>
          <p className="whitespace-pre-line font-medium">{currentDrill.passageText}</p>
        </div>
      )}

      {/* Question Stem */}
      <div className="space-y-1">
        <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
          Câu Hỏi:
        </span>
        <h3 className="text-sm sm:text-base font-bold text-theme-primary leading-snug">
          {currentDrill.questionStem}
        </h3>
      </div>

      {/* 4 Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {currentDrill.options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          const isCorrect = option.key === currentDrill.correctAnswer;

          let optionStyle = 'border-theme hover:bg-theme-surface-2 text-theme-primary';
          if (isAnswerSubmitted) {
            if (isCorrect) {
              optionStyle = 'border-theme-success bg-theme-success/15 text-theme-success font-bold ring-1 ring-theme-success';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-theme-error bg-theme-error/15 text-theme-error font-medium';
            }
          } else if (isSelected) {
            optionStyle = 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold ring-1 ring-theme-accent';
          }

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onSelectOption(option.key)}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${optionStyle}`}
            >
              <span
                className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-theme-accent text-white'
                    : 'bg-theme-surface-2 text-theme-secondary border border-theme'
                }`}
              >
                {option.key}
              </span>
              <span className="text-xs font-medium leading-snug">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Answer Submission / Next Question Action */}
      <div className="flex items-center justify-between pt-4 border-t border-theme/40">
        <button
          type="button"
          onClick={onResetPractice}
          className="px-4 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm Lại Từ Đầu</span>
        </button>

        {!isAnswerSubmitted ? (
          <button
            type="button"
            onClick={onCheckAnswer}
            disabled={!selectedAnswer}
            className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
          >
            Kiểm Tra Đáp Án
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextDrill}
            className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Câu Tiếp Theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Detailed Explanation & Applied Tactics Card */}
      {isAnswerSubmitted && (
        <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            {selectedAnswer === currentDrill.correctAnswer ? (
              <div className="flex items-center gap-1.5 text-theme-success font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Chính xác! (+1 Điểm)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-theme-error font-bold text-xs">
                <XCircle className="w-4 h-4" />
                <span>Chưa chính xác. Đáp án đúng là ({currentDrill.correctAnswer})</span>
              </div>
            )}
          </div>

          <p className="text-xs text-theme-primary leading-relaxed">
            <strong>Giải thích chi tiết: </strong>
            {currentDrill.detailedExplanationVi}
          </p>

          <div className="p-3 rounded-xl bg-theme-surface border border-theme text-xs text-theme-secondary flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong className="text-theme-primary">Chiến thuật áp dụng: </strong>
              {currentDrill.tacticsAppliedVi}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
