import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, Sparkles, BookOpen, Flag } from 'lucide-react';
import type { Part2QuestionData } from '../../../types/toeicListening';
import { getLcTrapLabelVi, getLcCategoryLabelVi } from '../../../utils/lcScoreCalculator';

interface Part2ResponseRendererProps {
  question: Part2QuestionData;
  selectedOption?: string;
  isFlagged?: boolean;
  isExamMode?: boolean;
  isSubmitted?: boolean;
  onSelectOption: (optionKey: 'A' | 'B' | 'C') => void;
  onToggleFlag?: () => void;
  onAskAi?: () => void;
}

/**
 * Dedicated renderer for TOEIC Part 2 Question & Response.
 * Displays clean 3-choice buttons, prompt toggle in practice mode, and detailed trap alerts.
 */
export const Part2ResponseRenderer: React.FC<Part2ResponseRendererProps> = ({
  question,
  selectedOption,
  isFlagged = false,
  isExamMode = false,
  isSubmitted = false,
  onSelectOption,
  onToggleFlag,
  onAskAi,
}) => {
  const [isShowDetails, setIsShowDetails] = useState<boolean>(false);

  const trapInfo = getLcTrapLabelVi(question.trapType);
  const categoryLabel = getLcCategoryLabelVi(question.category);

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 sm:p-6 shadow-sm transition-colors space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-theme/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-theme-accent/15 text-theme-accent font-bold text-sm flex items-center justify-center">
            {question.questionNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-theme-primary">
                Part 2 &bull; Câu phản xạ #{question.questionNumber}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-theme-surface-2 border border-theme text-theme-secondary">
                {categoryLabel}
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary">
              Nghe câu hỏi và 3 câu phản hồi (A, B, C) &mdash; Chọn câu trả lời phù hợp nhất
            </p>
          </div>
        </div>

        {/* Flag button & Ask AI */}
        <div className="flex items-center gap-1.5">
          {onToggleFlag && (
            <button
              onClick={onToggleFlag}
              title="Đánh dấu xem lại"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isFlagged
                  ? 'bg-theme-warning/20 border-theme-warning/40 text-theme-warning'
                  : 'border-theme text-theme-secondary hover:bg-theme-surface-2'
              }`}
            >
              <Flag className="w-4 h-4" />
            </button>
          )}

          {!isExamMode && onAskAi && (
            <button
              onClick={onAskAi}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-theme-accent/10 border border-theme-accent/30 text-theme-accent text-xs font-medium hover:bg-theme-accent/20 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hỏi AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Prompt Question Section (Visible in Practice Mode or after Submission) */}
      {(!isExamMode || isSubmitted) && (
        <div className="p-3.5 rounded-xl bg-theme-surface-2 border border-theme flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-theme-primary">
              {question.promptText}
            </p>
            {question.promptTextVi && (
              <p className="text-[11px] text-theme-secondary mt-0.5">
                {question.promptTextVi}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3 Option Choices: A, B, C */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.key;
          const isCorrectAnswer = option.key === question.correctAnswer;

          let cardStyle = 'border-theme hover:bg-theme-surface-2 text-theme-primary';
          let badgeStyle = 'bg-theme-surface-2 text-theme-secondary border-theme';

          if (isSubmitted) {
            if (isCorrectAnswer) {
              cardStyle = 'border-theme-success bg-theme-success/10 text-theme-primary font-medium';
              badgeStyle = 'bg-theme-success text-white border-theme-success';
            } else if (isSelected && !isCorrectAnswer) {
              cardStyle = 'border-theme-error bg-theme-error/10 text-theme-primary';
              badgeStyle = 'bg-theme-error text-white border-theme-error';
            }
          } else if (isSelected) {
            cardStyle = 'border-theme-accent bg-theme-accent/10 text-theme-accent font-semibold shadow-xs';
            badgeStyle = 'bg-theme-accent text-white border-theme-accent';
          }

          const hasSentenceText = option.text && option.text.trim().length > 0 && option.text.trim() !== `(${option.key})` && option.text.trim() !== option.key;

          return (
            <button
              key={option.key}
              onClick={() => onSelectOption(option.key as 'A' | 'B' | 'C')}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-8 h-8 rounded-xl border font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${badgeStyle}`}>
                  {option.key}
                </span>

                <div className="min-w-0">
                  {hasSentenceText ? (
                    <p className="text-xs sm:text-sm font-medium text-theme-primary truncate">
                      {option.text}
                    </p>
                  ) : (
                    <p className="text-xs text-theme-secondary font-medium">
                      Đáp án {option.key}
                    </p>
                  )}

                  {option.vietnameseText && (
                    <p className="text-[11px] text-theme-secondary mt-0.5 truncate">
                      {option.vietnameseText}
                    </p>
                  )}
                </div>
              </div>

              {isSubmitted && isCorrectAnswer && (
                <CheckCircle2 className="w-5 h-5 text-theme-success shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Review / Detailed Explanation (Visible after Submission or in Practice Mode) */}
      {(!isExamMode || isSubmitted) && (
        <div className="pt-2 border-t border-theme space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsShowDetails(!isShowDetails)}
              className="text-xs font-semibold text-theme-accent hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isShowDetails ? 'Ẩn Giải Thích' : 'Xem Lời Dịch & Cạm Bẫy'}</span>
            </button>

            {trapInfo && trapInfo.label !== 'Không có bẫy' && (
              <span className="text-[11px] text-theme-warning font-medium">
                Bẫy: {trapInfo.label}
              </span>
            )}
          </div>

          {isShowDetails && (
            <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme text-xs space-y-2 animate-fade-in">
              <p className="font-bold text-theme-primary">
                Đáp án đúng: <span className="text-theme-success">({question.correctAnswer})</span>
              </p>
              <p className="text-theme-secondary leading-relaxed">
                {question.explanation || 'Chú ý từ để hỏi (Wh-word) hoặc trợ động từ đầu câu để chọn câu phản hồi phù hợp.'}
              </p>
              {trapInfo && trapInfo.label !== 'Không có bẫy' && (
                <p className="text-[11px] text-theme-warning pt-1 border-t border-theme/40">
                  <span className="font-semibold">Chi tiết bẫy:</span> {trapInfo.advice}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
