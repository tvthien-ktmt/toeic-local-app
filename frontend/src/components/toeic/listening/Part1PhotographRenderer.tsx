import React, { useState } from 'react';
import { ZoomIn, X, CheckCircle2, Sparkles, BookOpen, Flag } from 'lucide-react';
import type { Part1QuestionData } from '../../../types/toeicListening';
import { getLcTrapLabelVi, getLcCategoryLabelVi } from '../../../utils/lcScoreCalculator';

interface Part1PhotographRendererProps {
  question: Part1QuestionData;
  selectedOption?: string;
  isFlagged?: boolean;
  isExamMode?: boolean;
  isSubmitted?: boolean;
  onSelectOption: (optionKey: 'A' | 'B' | 'C' | 'D') => void;
  onToggleFlag?: () => void;
  onAskAi?: () => void;
}

/**
 * Dedicated renderer for TOEIC Part 1 Photographs.
 * Features photo zoom inspection, clean choice buttons, trap alerts, and vocabulary highlights.
 */
export const Part1PhotographRenderer: React.FC<Part1PhotographRendererProps> = ({
  question,
  selectedOption,
  isFlagged = false,
  isExamMode = false,
  isSubmitted = false,
  onSelectOption,
  onToggleFlag,
  onAskAi,
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [isShowTranscript, setIsShowTranscript] = useState<boolean>(false);

  const trapInfo = getLcTrapLabelVi(question.trapType);
  const categoryLabel = getLcCategoryLabelVi(question.category);

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 sm:p-6 shadow-sm transition-colors space-y-5">
      {/* Header Bar: Question Number + Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-theme/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-theme-accent/15 text-theme-accent font-bold text-sm flex items-center justify-center">
            {question.questionNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-theme-primary">
                Part 1 &bull; Hình ảnh #{question.questionNumber}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-theme-surface-2 border border-theme text-theme-secondary">
                {categoryLabel}
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary">
              Nghe 4 câu mô tả (A, B, C, D) và chọn câu miêu tả đúng nhất
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

      {/* Main Content: Photo & Choice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Photograph with Zoom Trigger */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative group rounded-xl overflow-hidden border border-theme bg-theme-surface-2 w-full aspect-4/3 flex items-center justify-center">
            <img
              src={question.imageUrl}
              alt={question.imageAlt}
              className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity hover:bg-black/90 shadow-md cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Phóng to</span>
            </button>
          </div>

          {question.keywords.length > 0 && !isExamMode && (
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
              {question.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-theme-surface-2 border border-theme text-theme-secondary"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Choices A, B, C, D */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="grid grid-cols-1 gap-2.5">
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
                  onClick={() => onSelectOption(option.key)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${cardStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
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

          {/* Transcript & Explanation Toggle (Visible after submission or in practice mode) */}
          {(!isExamMode || isSubmitted) && (
            <div className="pt-2">
              <button
                onClick={() => setIsShowTranscript(!isShowTranscript)}
                className="text-xs font-semibold text-theme-accent hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isShowTranscript ? 'Ẩn Giải Thích' : 'Xem Lời Dịch & Giải Thích'}</span>
              </button>

              {isShowTranscript && (
                <div className="mt-3 p-3.5 rounded-xl bg-theme-surface-2 border border-theme text-xs space-y-2 animate-fade-in">
                  <p className="font-bold text-theme-primary">
                    Đáp án đúng: <span className="text-theme-success">({question.correctAnswer})</span>
                  </p>
                  <p className="text-theme-secondary leading-relaxed">
                    {question.explanation || 'Lắng nghe kỹ động từ hành động và danh từ đồ vật trong bức ảnh.'}
                  </p>
                  {trapInfo && trapInfo.label !== 'Không có bẫy' && (
                    <div className="pt-1.5 border-t border-theme/40 text-[11px] text-theme-warning font-medium">
                      Cạm bẫy Part 1: {trapInfo.label} &bull; {trapInfo.advice}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Zoom Photo */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-theme-surface border border-theme">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={question.imageUrl}
              alt={question.imageAlt}
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
