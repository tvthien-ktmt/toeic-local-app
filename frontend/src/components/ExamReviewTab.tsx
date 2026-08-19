import React from 'react';
import { CheckCircle2, XCircle, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { MarkdownPassage } from './MarkdownPassage';

interface DetailedQuestionResult {
  id: number;
  question_text: string;
  part: number;
  options: string[];
  correct_answer: string;
  user_answer: string | null;
  is_correct: boolean;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
  common_trap?: string;
}

interface ExamReviewTabProps {
  filteredQuestions: DetailedQuestionResult[];
  filterPart: 'ALL' | 'PART5' | 'PART6' | 'PART7' | 'INCORRECT' | 'SKIPPED';
  onSetFilterPart: (part: 'ALL' | 'PART5' | 'PART6' | 'PART7' | 'INCORRECT' | 'SKIPPED') => void;
  onFetchAiExplanation: (questionItem: DetailedQuestionResult) => void;
}

/**
 * Tab component for reviewing completed exam questions with filters (Incorrect, Skipped, Part 5-7) and explanations.
 */
export const ExamReviewTab: React.FC<ExamReviewTabProps> = ({
  filteredQuestions,
  filterPart,
  onSetFilterPart,
  onFetchAiExplanation,
}) => {
  return (
    <>
      {/* Filter Row */}
      <div className="sticky top-0 z-10 bg-theme-surface border-b border-theme px-6 py-3 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-theme-secondary shrink-0">Lọc câu:</span>
        {[
          { id: 'ALL', label: 'Tất Cả' },
          { id: 'INCORRECT', label: 'Câu Sai' },
          { id: 'SKIPPED', label: 'Bỏ Trống' },
          { id: 'PART5', label: 'Part 5' },
          { id: 'PART6', label: 'Part 6' },
          { id: 'PART7', label: 'Part 7' },
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => onSetFilterPart(filterOption.id as any)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterPart === filterOption.id
                ? 'bg-theme-accent text-white'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      <div className="p-6 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-theme-secondary text-sm">
            Không có câu hỏi nào theo bộ lọc này.
          </div>
        ) : (
          filteredQuestions.map((questionItem, index) => {
            const isSkipped = !questionItem.user_answer;
            const isWrong = !questionItem.is_correct && !isSkipped;

            return (
              <div
                key={questionItem.id}
                id={`review-q-${questionItem.id}`}
                className={`bg-theme-surface rounded-2xl p-5 border transition-all ${
                  isWrong
                    ? 'border-theme-error/50 ring-1 ring-theme-error/20'
                    : isSkipped
                    ? 'border-theme-warning/50 ring-1 ring-theme-warning/20'
                    : 'border-theme'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-theme-surface-2 border border-theme text-xs font-extrabold text-theme-primary flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="text-[11px] font-bold text-theme-secondary">
                      Part {questionItem.part}
                    </span>
                    {questionItem.grammar_topic && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-theme-surface-2 text-theme-secondary border border-theme">
                        {questionItem.grammar_topic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {questionItem.is_correct ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full alert-success text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 alert-success-icon" /> Đúng
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full alert-warning text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-theme-warning" /> Bỏ trống
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full alert-error text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 alert-error-icon" /> Sai
                      </span>
                    )}

                    <button
                      onClick={() => onFetchAiExplanation(questionItem)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-theme-accent text-white text-xs font-bold shadow transition-all hover:opacity-90 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Giải Thích</span>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                {questionItem.part === 5 ? (
                  <p className="text-sm font-semibold text-theme-primary mb-3 leading-relaxed whitespace-pre-wrap">
                    {questionItem.question_text}
                  </p>
                ) : (
                  <div className="text-sm text-theme-primary mb-3">
                    <MarkdownPassage text={questionItem.question_text} />
                  </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {questionItem.options.map((optionString) => {
                    const optionChar = optionString.charAt(0);
                    const isCorrectOpt = optionChar === questionItem.correct_answer;
                    const isUserOpt = optionChar === questionItem.user_answer;
                    let style = 'bg-theme-surface border-theme text-theme-secondary';
                    if (isCorrectOpt) {
                      style = 'alert-success border-theme-success font-bold text-theme-success';
                    } else if (isUserOpt && !questionItem.is_correct) {
                      style = 'alert-error border-theme-error font-bold text-theme-error';
                    }

                    return (
                      <div
                        key={optionString}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}
                      >
                        <span>{optionString}</span>
                        {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-theme-success" />}
                        {isUserOpt && !questionItem.is_correct && <XCircle className="w-4 h-4 text-theme-error" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation + Common Trap */}
                {(questionItem.explanation || questionItem.translated_sentence) && (
                  <div className="p-3 rounded-xl bg-theme-surface border border-theme text-xs space-y-2">
                    {questionItem.explanation && (
                      <p className="text-theme-secondary leading-relaxed">{questionItem.explanation}</p>
                    )}
                    {questionItem.translated_sentence && (
                      <div className="pt-2 border-t border-theme text-theme-success">
                        <strong>Bản dịch:</strong> {questionItem.translated_sentence}
                      </div>
                    )}
                    {questionItem.common_trap && (
                      <div className="pt-2 border-t border-theme flex gap-2 text-theme-error">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><strong>Bẫy phổ biến:</strong> {questionItem.common_trap}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
