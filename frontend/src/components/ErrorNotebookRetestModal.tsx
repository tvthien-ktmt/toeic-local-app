import React from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import type { ErrorNotebookItem, RetestAttemptResponse } from '../api/errorNotebook';

interface ErrorNotebookRetestModalProps {
  currentRetestQ: ErrorNotebookItem;
  currentRetestIndex: number;
  totalRetestQuestions: number;
  retestScore: { correct: number; total: number };
  selectedOption: string;
  isSubmittingRetest: boolean;
  retestResult: RetestAttemptResponse | null;
  onAnswerRetest: (selectedLetter: string) => void;
  onNextRetestQuestion: () => void;
  onClose: () => void;
}

/**
 * Interactive Modal for retrying missed questions with instant diagnostic feedback and mastery updates.
 */
export const ErrorNotebookRetestModal: React.FC<ErrorNotebookRetestModalProps> = ({
  currentRetestQ,
  currentRetestIndex,
  totalRetestQuestions,
  retestScore,
  selectedOption,
  isSubmittingRetest,
  retestResult,
  onAnswerRetest,
  onNextRetestQuestion,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Retest Header */}
        <div className="flex items-center justify-between border-b border-theme pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-theme-accent/20 text-theme-accent font-bold text-xs">
              Câu {currentRetestIndex + 1} / {totalRetestQuestions}
            </span>
            <span className="text-xs text-theme-secondary font-medium">
              {currentRetestQ.grammar_topic &&
              !currentRetestQ.grammar_topic.toLowerCase().startsWith(`part ${currentRetestQ.part}`)
                ? `Part ${currentRetestQ.part} • ${currentRetestQ.grammar_topic}`
                : `Part ${currentRetestQ.part}`}
            </span>
            {retestScore.total > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-success/20 text-theme-success border border-theme-success/30">
                Đúng: {retestScore.correct}/{retestScore.total}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-theme-surface-2 text-theme-secondary transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Body */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-theme-primary leading-relaxed whitespace-pre-wrap">
            {currentRetestQ.question_text}
          </p>

          {/* Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {currentRetestQ.options.map((optionItem, optionIdx) => {
              const letter = String.fromCharCode(65 + optionIdx);
              const isSelected = selectedOption === letter;
              const isCorrect = retestResult && letter === retestResult.correct_answer;
              const isWrong = retestResult && isSelected && !retestResult.is_correct;

              return (
                <button
                  key={letter}
                  disabled={isSubmittingRetest || !!retestResult}
                  onClick={() => onAnswerRetest(letter)}
                  className={`w-full p-3 rounded-xl border text-left font-medium text-xs flex items-center gap-3 transition cursor-pointer ${
                    isCorrect
                      ? 'bg-theme-success/20 border-theme-success text-theme-success font-bold'
                      : isWrong
                      ? 'bg-theme-error/20 border-theme-error text-theme-error font-bold'
                      : isSelected
                      ? 'bg-theme-accent/20 border-theme-accent text-theme-primary'
                      : 'bg-theme-surface-2 border-theme hover:border-theme-accent/40 text-theme-primary'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-theme-surface border border-theme flex items-center justify-center font-bold">
                    {letter}
                  </span>
                  <span>{optionItem}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instant Feedback Panel */}
        {retestResult && (
          <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {retestResult.is_correct ? (
                  <span className="flex items-center gap-1 text-theme-success font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Chính xác!
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-theme-error font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" /> Chưa đúng! Đáp án là {retestResult.correct_answer}
                  </span>
                )}
              </div>
              {retestResult.is_mastered && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-success text-white">
                  Đạt chuẩn Mastered!
                </span>
              )}
            </div>

            {retestResult.translated_sentence && (
              <p className="text-xs text-theme-secondary italic">
                {retestResult.translated_sentence}
              </p>
            )}

            {retestResult.explanation && (
              <p className="text-xs text-theme-primary leading-relaxed whitespace-pre-wrap">
                {retestResult.explanation}
              </p>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        {retestResult && (
          <button
            onClick={onNextRetestQuestion}
            className="w-full py-3 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <span>{currentRetestIndex + 1 < totalRetestQuestions ? 'Câu Tiếp Theo' : 'Hoàn Thành Ôn Tập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
