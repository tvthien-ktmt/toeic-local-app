import React from 'react';
import { Flag, HelpCircle } from 'lucide-react';
import type { QuestionItem } from '../utils/examGrouping';
import type { ExamResultData } from '../types/examResults';

interface ExamMatrixSidebarProps {
  questions: QuestionItem[];
  filteredMatrixQs: QuestionItem[];
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
  matrixFilter: 'ALL' | 'PART5' | 'PART6' | 'PART7' | 'FLAGGED' | 'UNANSWERED';
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  examResult: ExamResultData | null;
  onSetMatrixFilter: (filter: 'ALL' | 'PART5' | 'PART6' | 'PART7' | 'FLAGGED' | 'UNANSWERED') => void;
  onScrollToQuestion: (questionId: number) => void;
}

/**
 * Sidebar matrix panel providing jump navigation for all 100 exam questions, with status indicators.
 * Implements overflow-safe scrolling and responsive buttons.
 */
export const ExamMatrixSidebar: React.FC<ExamMatrixSidebarProps> = ({
  filteredMatrixQs,
  answeredCount,
  flaggedCount,
  unansweredCount,
  matrixFilter,
  userAnswers,
  flaggedQuestions,
  examResult,
  onSetMatrixFilter,
  onScrollToQuestion,
}) => {
  return (
    <div className="bg-theme-surface rounded-3xl p-5 border border-theme shadow-xl space-y-4 lg:sticky lg:top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme pb-3">
        <h3 className="font-bold text-sm text-theme-primary">Ma Trận Câu Hỏi</h3>
        <span className="text-xs font-semibold text-theme-secondary">
          {answeredCount}/100 đã trả lời
        </span>
      </div>

      {/* Matrix Filters */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 touch-pan-x"
        style={{ scrollbarWidth: 'thin' }}
      >
        {(
          [
            'ALL',
            'PART5',
            'PART6',
            'PART7',
            'FLAGGED',
            'UNANSWERED',
          ] as ('ALL' | 'PART5' | 'PART6' | 'PART7' | 'FLAGGED' | 'UNANSWERED')[]
        ).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => onSetMatrixFilter(filterOption)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
              matrixFilter === filterOption
                ? 'bg-theme-accent text-white'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            {filterOption === 'ALL' && 'Tất Cả'}
            {filterOption === 'PART5' && 'P5'}
            {filterOption === 'PART6' && 'P6'}
            {filterOption === 'PART7' && 'P7'}
            {filterOption === 'FLAGGED' && (
              <>
                <Flag className="w-3 h-3 shrink-0" />
                <span>{flaggedCount > 0 ? flaggedCount : ''}</span>
              </>
            )}
            {filterOption === 'UNANSWERED' && (
              <>
                <HelpCircle className="w-3 h-3 shrink-0" />
                <span>{unansweredCount > 0 ? unansweredCount : ''}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Question Grid Buttons */}
      <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {filteredMatrixQs.map((matrixQuestionItem) => {
          const userAns = userAnswers[matrixQuestionItem.id] || userAnswers[matrixQuestionItem.q_num];
          const isAnswered2 = !!userAns;
          const isFlagged2 =
            !!flaggedQuestions[matrixQuestionItem.id] || !!flaggedQuestions[matrixQuestionItem.q_num];
          const isSubmitted = !!examResult;
          const isCorrect2 =
            isSubmitted && userAns === matrixQuestionItem.correct_answer;
          const isWrong2 =
            isSubmitted &&
            userAns &&
            userAns !== matrixQuestionItem.correct_answer;
          const isSkipped2 = isSubmitted && !userAns;

          let gridStyle =
            'bg-theme-surface-2 hover:bg-theme-surface text-theme-secondary border border-theme';
          if (isSubmitted) {
            if (isCorrect2) {
              gridStyle = 'bg-theme-success text-white font-bold shadow-md';
            } else if (isWrong2) {
              gridStyle = 'bg-theme-error text-white font-bold shadow-md';
            } else if (isSkipped2) {
              gridStyle = 'alert-warning border border-theme-warning/50 font-bold';
            }
          } else if (isFlagged2) {
            gridStyle = 'bg-theme-warning text-white shadow-md font-bold';
          } else if (isAnswered2) {
            gridStyle = 'bg-theme-accent text-white shadow-md';
          }

          return (
            <button
              key={matrixQuestionItem.id}
              onClick={() => onScrollToQuestion(matrixQuestionItem.id)}
              className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all cursor-pointer ${gridStyle}`}
            >
              {matrixQuestionItem.q_num}
              {isFlagged2 && !isSubmitted && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-theme-error border border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="pt-3 border-t border-theme flex items-center justify-between text-[11px] text-theme-secondary flex-wrap gap-2">
        {examResult ? (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-theme-success" /> Đúng
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-theme-error" /> Sai
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md alert-warning border border-theme-warning/50" /> Bỏ trống
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-theme-accent" /> Đã làm
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-theme-warning" /> Đánh dấu
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-md bg-theme-surface-2 border border-theme" /> Chưa làm
            </div>
          </>
        )}
      </div>
    </div>
  );
};
