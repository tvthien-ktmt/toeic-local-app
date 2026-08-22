import React from 'react';
import { CheckCircle2, XCircle, Flag, Sparkles, Eye } from 'lucide-react';

interface QuestionItem {
  id: number;
  q_num: number;
  part: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
  common_trap?: string;
}

interface ExamQuestionCardProps {
  questionItem: QuestionItem;
  promptText: string;
  isNestedInGroup?: boolean;
  selectedOpt?: string;
  isFlagged: boolean;
  isRevealed: boolean;
  mode: 'full_exam' | 'practice';
  isSubmitted: boolean;
  cardRef?: (element: HTMLDivElement | null) => void;
  onSelectAnswer: (questionId: number, optionChar: string) => void;
  onToggleFlag: (questionId: number) => void;
  onToggleExplanation: (questionId: number) => void;
  onFetchAiExplanation: (questionItem: QuestionItem) => void;
}

/**
 * Individual exam question card with A-D option selection, flagging, instant practice reveal, and AI explanation launcher.
 */
const ExamQuestionCardComponent: React.FC<ExamQuestionCardProps> = ({
  questionItem,
  promptText,
  isNestedInGroup = false,
  selectedOpt,
  isFlagged,
  isRevealed,
  mode,
  isSubmitted,
  cardRef,
  onSelectAnswer,
  onToggleFlag,
  onToggleExplanation,
  onFetchAiExplanation,
}) => {
  const isAnswered = !!selectedOpt;
  const isCorrect = isSubmitted && selectedOpt === questionItem.correct_answer;
  const isWrong = isSubmitted && selectedOpt && selectedOpt !== questionItem.correct_answer;
  const isSkipped = isSubmitted && !selectedOpt;

  return (
    <div
      ref={cardRef}
      className={`bg-theme-surface rounded-2xl border transition-all p-5 sm:p-6 space-y-4 shadow-sm ${
        isSubmitted
          ? isCorrect
            ? 'border-theme-success/50 alert-success'
            : isWrong
            ? 'border-theme-error/50 alert-error'
            : 'border-theme-warning/40 alert-warning'
          : isFlagged
          ? 'border-theme-warning/50 shadow-sm'
          : isAnswered
          ? 'border-theme-accent/40'
          : 'border-theme'
      } ${isNestedInGroup ? 'border-theme/70 bg-theme-surface' : ''}`}
    >
      {/* Question Header */}
      <div className="flex items-center justify-between border-b border-theme/50 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shadow-md ${
              isSubmitted
                ? isCorrect
                  ? 'bg-theme-success text-white'
                  : isWrong
                  ? 'bg-theme-error text-white'
                  : 'bg-theme-warning text-white'
                : 'bg-theme-accent text-white'
            }`}
          >
            {questionItem.q_num}
          </span>
          <div>
            <span className="text-xs font-bold text-theme-primary">
              {questionItem.grammar_topic &&
              !questionItem.grammar_topic.toLowerCase().startsWith(`part ${questionItem.part}`)
                ? `Part ${questionItem.part} • ${questionItem.grammar_topic}`
                : `Part ${questionItem.part}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Status Badge if Submitted */}
          {isSubmitted &&
            (isCorrect ? (
              <span className="flex items-center gap-1 text-xs font-bold alert-success text-theme-success px-2.5 py-1 rounded-full border border-theme-success/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
              </span>
            ) : isSkipped ? (
              <span className="flex items-center gap-1 text-xs font-bold alert-warning text-theme-warning px-2.5 py-1 rounded-full border border-theme-warning/30">
                ⬜ Bỏ Trống
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold alert-error text-theme-error px-2.5 py-1 rounded-full border border-theme-error/30">
                <XCircle className="w-3.5 h-3.5" /> Sai ({selectedOpt})
              </span>
            ))}

          {/* AI Explanation Button */}
          {(isSubmitted || mode === 'practice') && (
            <button
              onClick={() => onFetchAiExplanation(questionItem)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Giải Thích</span>
            </button>
          )}

          {/* Flag for Review Toggle */}
          {!isSubmitted && (
            <button
              onClick={() => onToggleFlag(questionItem.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isFlagged
                  ? 'alert-warning border-theme-warning/40 shadow-sm font-bold'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border-theme'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-current' : ''}`} />
              <span>{isFlagged ? 'Đã Đánh Dấu' : 'Đánh Dấu'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="text-sm font-semibold text-theme-primary leading-relaxed whitespace-pre-wrap">
        {promptText.startsWith(`${questionItem.q_num}.`)
          ? promptText
          : `${questionItem.q_num}. ${promptText}`}
      </div>

      {/* Options List */}
      <div className="space-y-2.5 pt-2">
        {questionItem.options.map((opt) => {
          const optChar = opt.charAt(0);
          const isSelected = selectedOpt === optChar;
          const isCorrectOpt = isSubmitted && optChar === questionItem.correct_answer;
          const isUserWrongOpt = isSubmitted && isSelected && optChar !== questionItem.correct_answer;

          const rawClean = opt.replace(/^\s*\(?[A-Da-d][\.\)]?\s*[-—]?\s*/, '').trim();
          const optionBody =
            rawClean && rawClean !== '—' && rawClean !== '-'
              ? rawClean
              : opt.length > 2
              ? opt.substring(2).trim()
              : '';
          const displayText =
            optionBody && optionBody !== '—' && optionBody !== '-'
              ? optionBody
              : `Phương án (${optChar})`;

          let optStyle =
            'bg-theme-surface-2 hover:bg-theme-surface border-theme text-theme-secondary hover:text-theme-primary';
          if (isCorrectOpt) {
            optStyle = 'alert-success border-theme-success font-bold text-theme-success shadow-md';
          } else if (isUserWrongOpt) {
            optStyle = 'alert-error border-theme-error font-bold text-theme-error shadow-md';
          } else if (isSelected) {
            optStyle = 'bg-theme-accent/20 border-theme-accent text-theme-primary font-bold shadow-md';
          }

          return (
            <div
              key={opt}
              onClick={() => !isSubmitted && onSelectAnswer(questionItem.id, optChar)}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
                isSubmitted ? 'cursor-default' : 'cursor-pointer'
              } ${optStyle}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCorrectOpt
                      ? 'bg-theme-success text-white border-theme-success'
                      : isUserWrongOpt
                      ? 'bg-theme-error text-white border-theme-error'
                      : isSelected
                      ? 'bg-theme-accent text-white border-theme-accent'
                      : 'border-theme-secondary/40 text-theme-secondary'
                  }`}
                >
                  {optChar}
                </div>
                <span>{displayText}</span>
              </div>
              {isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-theme-success shrink-0" />}
              {isUserWrongOpt && <XCircle className="w-5 h-5 text-theme-error shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Post-submission or Practice Mode: Show Explanation & Translation */}
      {(isSubmitted || (mode === 'practice' && isRevealed)) && (
        <div className="pt-3 border-t border-theme space-y-3">
          <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme text-xs space-y-2 animate-fade-in">
            <div className="font-bold text-theme-success flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Đáp án đúng: ({questionItem.correct_answer})
            </div>
            {questionItem.explanation && (
              <p className="text-theme-secondary leading-relaxed">{questionItem.explanation}</p>
            )}
            {questionItem.translated_sentence && (
              <div className="pt-2 border-t border-theme text-theme-accent">
                <strong>Bản dịch:</strong> {questionItem.translated_sentence}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Practice Mode Toggle Button */}
      {mode === 'practice' && !isSubmitted && (
        <div className="pt-2 border-t border-theme/50">
          <button
            onClick={() => onToggleExplanation(questionItem.id)}
            className="px-3.5 py-1.5 rounded-xl bg-theme-surface-3 hover:bg-theme-surface-2 text-theme-accent border border-theme-accent/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{isRevealed ? 'Ẩn Giải Thích' : 'Xem Đáp Án & Giải Thích Tức Thì'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const ExamQuestionCard = React.memo(ExamQuestionCardComponent);
