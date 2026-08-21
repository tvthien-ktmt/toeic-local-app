import React from 'react';
import { Flag, Sparkles, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import type { LCSubQuestionData } from '../../../types/toeicListening';

interface Part3QuestionItemCardProps {
  questionItem: LCSubQuestionData;
  selectedAnswer?: string;
  isFlagged?: boolean;
  isExamMode?: boolean;
  isSubmitted?: boolean;
  onSelectOption: (questionNumber: number, optionKey: 'A' | 'B' | 'C' | 'D') => void;
  onToggleFlag?: (questionNumber: number) => void;
  onAskAi?: (questionNumber: number) => void;
}

/**
 * Strips leading (A), (B), (C), (D) or A., B., C., D. from option text if present.
 */
function cleanOptionText(text: string, letter: string): string {
  if (!text) {
    return `Lựa chọn (${letter})`;
  }
  const cleaned = text.replace(new RegExp(`^\\s*\\(?${letter}\\)?[\\.\\:\\)]?\\s*`, 'i'), '').trim();
  
  return cleaned.length > 0 ? cleaned : `Lựa chọn (${letter})`;
}

/**
 * Individual sub-question card for TOEIC Part 3 Conversations.
 */
export const Part3QuestionItemCard: React.FC<Part3QuestionItemCardProps> = ({
  questionItem,
  selectedAnswer,
  isFlagged = false,
  isExamMode = false,
  isSubmitted = false,
  onSelectOption,
  onToggleFlag,
  onAskAi,
}) => {
  return (
    <div className="p-4 rounded-xl bg-theme-surface border border-theme space-y-3 shadow-2xs">
      {/* Question Stem Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-theme-accent/15 text-theme-accent font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            {questionItem.questionNumber}
          </span>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-theme-primary leading-snug">
              {questionItem.stem}
            </h4>
            {questionItem.stemVi && (
              <p className="text-[11px] text-theme-secondary mt-0.5 leading-snug">
                {questionItem.stemVi}
              </p>
            )}
          </div>
        </div>

        {/* Flag / AI Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onToggleFlag && (
            <button
              onClick={() => onToggleFlag(questionItem.questionNumber)}
              title="Đánh dấu câu này"
              className={`p-1 rounded-md border text-xs transition-colors cursor-pointer ${
                isFlagged
                  ? 'bg-theme-warning/20 border-theme-warning/40 text-theme-warning'
                  : 'border-theme text-theme-secondary hover:bg-theme-surface-2'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}

          {!isExamMode && onAskAi && (
            <button
              onClick={() => onAskAi(questionItem.questionNumber)}
              className="p-1 rounded-md bg-theme-accent/10 border border-theme-accent/30 text-theme-accent hover:bg-theme-accent/20 transition-colors cursor-pointer"
              title="Hỏi AI câu này"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Question Graphics for this sub-question if present */}
      {questionItem.graphicImageUrl && (
        <div className="flex justify-center p-2.5 bg-theme-surface-2 rounded-xl border border-theme my-2">
          <img
            src={questionItem.graphicImageUrl}
            alt={`Hình ảnh / Biểu đồ câu ${questionItem.questionNumber}`}
            className="max-h-60 rounded-lg object-contain"
            loading="lazy"
          />
        </div>
      )}

      {questionItem.graphicHtml && (
        <div
          className="p-3 bg-theme-surface-2 rounded-xl border border-theme overflow-x-auto text-xs text-theme-primary my-2"
          dangerouslySetInnerHTML={{ __html: questionItem.graphicHtml }}
        />
      )}

      {/* 4 Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questionItem.options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          const isCorrect = option.key === questionItem.correctAnswer;

          let optionStyle = 'border-theme hover:bg-theme-surface-2 text-theme-primary';
          let keyBadgeStyle = 'bg-theme-surface-2 text-theme-secondary border-theme';

          if (isSubmitted) {
            if (isCorrect) {
              optionStyle = 'border-theme-success bg-theme-success/10 text-theme-primary font-medium';
              keyBadgeStyle = 'bg-theme-success text-white border-theme-success';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-theme-error bg-theme-error/10 text-theme-primary';
              keyBadgeStyle = 'bg-theme-error text-white border-theme-error';
            }
          } else if (isSelected) {
            optionStyle = 'border-theme-accent bg-theme-accent/10 text-theme-accent font-semibold shadow-xs';
            keyBadgeStyle = 'bg-theme-accent text-white border-theme-accent';
          }

          const displayText = cleanOptionText(option.text, option.key);

          return (
            <button
              key={option.key}
              onClick={() => onSelectOption(questionItem.questionNumber, option.key)}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${optionStyle}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-6 h-6 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${keyBadgeStyle}`}>
                  {option.key}
                </span>
                <div className="min-w-0">
                  <p className="text-xs leading-snug truncate">{displayText}</p>
                  {option.vietnameseText && (
                    <p className="text-[10px] text-theme-secondary mt-0.5 leading-snug truncate">
                      {option.vietnameseText}
                    </p>
                  )}
                </div>
              </div>
              {isSubmitted && isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-theme-success shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-question explanation in Review mode */}
      {isSubmitted && (
        <div className="p-3 rounded-lg bg-theme-surface-2 border border-theme text-xs space-y-1 text-theme-secondary">
          <p className="font-semibold text-theme-primary">Giải thích:</p>
          <p>{questionItem.explanation}</p>
          {questionItem.paraphrasePairs && questionItem.paraphrasePairs.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-theme-accent font-medium mt-1">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>
                Paraphrase: "{questionItem.paraphrasePairs[0].original}" &rarr; "{questionItem.paraphrasePairs[0].paraphrased}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
