import React, { useState } from 'react';
import { LayoutGrid, Filter, X } from 'lucide-react';
import type { LCExamResult } from '../../../types/toeicListening';

interface LcExamMatrixSidebarProps {
  totalQuestions: number;
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  currentQuestionNumber: number;
  isSubmitted: boolean;
  result: LCExamResult | null;
  correctAnswersMap?: Record<number, string>;
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (questionNumber: number) => void;
}

/**
 * 100-question matrix navigation sidebar for TOEIC Listening.
 * Supports filtering by Part (Part 1, 2, 3, 4), Unanswered, Flagged, and Wrong questions.
 */
export const LcExamMatrixSidebar: React.FC<LcExamMatrixSidebarProps> = ({
  totalQuestions,
  userAnswers,
  flaggedQuestions,
  currentQuestionNumber,
  isSubmitted,
  correctAnswersMap = {},
  isOpen,
  onClose,
  onSelectQuestion,
}) => {
  const [filterPart, setFilterPart] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNANSWERED' | 'FLAGGED' | 'WRONG'>('ALL');

  // Question ranges for Parts
  const getPartFromQuestionNumber = (qNum: number): 1 | 2 | 3 | 4 => {
    if (qNum <= 6) return 1;
    if (qNum <= 31) return 2;
    if (qNum <= 70) return 3;

    return 4;
  };

  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  const filteredQuestions = questionNumbers.filter((qNum) => {
    const part = getPartFromQuestionNumber(qNum);
    if (filterPart !== 'ALL' && part !== filterPart) {
      return false;
    }

    const isAnswered = !!userAnswers[qNum];
    const isFlagged = !!flaggedQuestions[qNum];
    const isCorrect = isSubmitted && correctAnswersMap[qNum] && userAnswers[qNum]?.toUpperCase() === correctAnswersMap[qNum]?.toUpperCase();

    if (filterStatus === 'UNANSWERED' && isAnswered) return false;
    if (filterStatus === 'FLAGGED' && !isFlagged) return false;
    if (filterStatus === 'WRONG' && (!isSubmitted || isCorrect)) return false;

    return true;
  });

  return (
    <aside
      className={`fixed lg:sticky top-0 lg:top-20 right-0 z-40 h-full lg:h-[calc(100vh-6rem)] w-80 bg-theme-surface border-l lg:border border-theme lg:rounded-2xl p-4 sm:p-5 shadow-xl lg:shadow-xs transition-transform duration-300 flex flex-col gap-3 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-theme/50 pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-theme-accent" />
          <h3 className="font-bold text-xs sm:text-sm text-theme-primary">
            Ma Trận 100 Câu LC
          </h3>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Part Filters */}
      <div className="space-y-1 shrink-0">
        <span className="text-[11px] font-semibold text-theme-secondary flex items-center gap-1">
          <Filter className="w-3 h-3 text-theme-accent" />
          <span>Lọc theo Part:</span>
        </span>
        <div className="grid grid-cols-5 gap-1">
          {(['ALL', 1, 2, 3, 4] as const).map((partVal) => (
            <button
              key={partVal}
              onClick={() => setFilterPart(partVal)}
              className={`py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterPart === partVal
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {partVal === 'ALL' ? 'Tất cả' : `P${partVal}`}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-theme-primary text-theme-base font-bold'
              : 'text-theme-secondary hover:bg-theme-surface-2'
          }`}
        >
          Tất cả ({totalQuestions})
        </button>
        <button
          onClick={() => setFilterStatus('UNANSWERED')}
          className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filterStatus === 'UNANSWERED'
              ? 'bg-theme-primary text-theme-base font-bold'
              : 'text-theme-secondary hover:bg-theme-surface-2'
          }`}
        >
          Chưa làm
        </button>
        <button
          onClick={() => setFilterStatus('FLAGGED')}
          className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filterStatus === 'FLAGGED'
              ? 'bg-theme-warning text-white font-bold'
              : 'text-theme-secondary hover:bg-theme-surface-2'
          }`}
        >
          Đánh dấu
        </button>
        {isSubmitted && (
          <button
            onClick={() => setFilterStatus('WRONG')}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'WRONG'
                ? 'bg-theme-error text-white font-bold'
                : 'text-theme-secondary hover:bg-theme-surface-2'
            }`}
          >
            Câu sai
          </button>
        )}
      </div>

      {/* Scrollable 100-Question Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-5 gap-1.5 pb-2">
          {filteredQuestions.map((qNum) => {
            const isAnswered = !!userAnswers[qNum];
            const isFlagged = !!flaggedQuestions[qNum];
            const isCurrent = currentQuestionNumber === qNum;
            const isCorrect =
              isSubmitted &&
              correctAnswersMap[qNum] &&
              userAnswers[qNum]?.toUpperCase() === correctAnswersMap[qNum]?.toUpperCase();

            let btnStyle = 'bg-theme-surface-2 text-theme-secondary border-theme hover:border-theme-accent';

            if (isSubmitted) {
              if (isCorrect) {
                btnStyle = 'bg-theme-success/15 border-theme-success/40 text-theme-success font-bold';
              } else if (isAnswered) {
                btnStyle = 'bg-theme-error/15 border-theme-error/40 text-theme-error font-bold';
              } else {
                btnStyle = 'bg-theme-surface-2 border-theme text-theme-secondary opacity-60';
              }
            } else if (isAnswered) {
              btnStyle = 'bg-theme-accent text-white border-theme-accent font-bold shadow-xs';
            }

            return (
              <button
                key={qNum}
                onClick={() => onSelectQuestion(qNum)}
                className={`relative h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnStyle} ${
                  isCurrent ? 'ring-2 ring-theme-accent ring-offset-1' : ''
                }`}
              >
                <span>{qNum}</span>

                {isFlagged && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-theme-warning" />
                )}

                {isSubmitted && isCorrect && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-theme-success text-white flex items-center justify-center text-[8px]">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Color Legends */}
      <div className="pt-2 border-t border-theme/50 text-[11px] text-theme-secondary flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-theme-accent" />
          <span>Đã chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-theme-warning" />
          <span>Cắm cờ</span>
        </div>
        {isSubmitted && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-theme-success" />
            <span>Đúng</span>
          </div>
        )}
      </div>
    </aside>
  );
};
