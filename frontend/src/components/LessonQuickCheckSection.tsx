import React from 'react';
import { CheckCircle2, FileCheck } from 'lucide-react';
import { MarkdownPassage } from './MarkdownPassage';

interface QuickCheckQ {
  id: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  part: number;
}

interface LessonQuickCheckSectionProps {
  quickCheck: QuickCheckQ[];
  quizAnswers: Record<number, string>;
  isQuizSubmitted: boolean;
  onSelectOption: (questionId: number, optionLetter: string) => void;
  onSubmitQuiz: () => void;
}

/**
 * Quick-check practice test section inside the lesson modal with immediate answer evaluation.
 */
export const LessonQuickCheckSection: React.FC<LessonQuickCheckSectionProps> = ({
  quickCheck,
  quizAnswers,
  isQuizSubmitted,
  onSelectOption,
  onSubmitQuiz,
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-theme-accent" />
        <span>Bài Kiểm Tra Nhanh</span>
        <span className="text-xs bg-theme-accent/20 text-theme-accent border border-theme-accent/30 px-2 py-0.5 rounded-full font-bold">
          {quickCheck.length} câu
        </span>
      </h3>
      {quickCheck.map((quickCheckItem, index) => (
        <div
          key={quickCheckItem.id}
          className="bg-theme-surface-2 rounded-xl p-4 mb-3 border border-theme shadow-sm"
        >
          <div className="text-theme-primary text-sm mb-2.5 font-medium">
            <strong>{index + 1}.</strong> <MarkdownPassage text={quickCheckItem.question_text} />
          </div>
          <div className="flex flex-col gap-1.5">
            {Object.entries(quickCheckItem.options).map(([opt, text]) => {
              const isSelected = quizAnswers[quickCheckItem.id] === opt;
              const isCorrect = isQuizSubmitted && opt === quickCheckItem.correct_answer;
              const isWrong = isQuizSubmitted && isSelected && opt !== quickCheckItem.correct_answer;

              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (!isQuizSubmitted) {
                      onSelectOption(quickCheckItem.id, opt);
                    }
                  }}
                  className={`text-left p-2.5 rounded-lg text-xs sm:text-sm transition-all border cursor-pointer ${
                    isCorrect
                      ? 'alert-success border-theme-success font-bold'
                      : isWrong
                      ? 'alert-error border-theme-error font-bold'
                      : isSelected
                      ? 'bg-theme-accent/20 border-theme-accent text-theme-accent font-semibold'
                      : 'bg-theme-surface border-theme text-theme-primary hover:border-theme-accent/40'
                  }`}
                >
                  <strong>({opt})</strong> {text as string}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!isQuizSubmitted ? (
        <button
          onClick={onSubmitQuiz}
          disabled={Object.keys(quizAnswers).length < quickCheck.length}
          className={`w-full py-3 rounded-xl text-sm font-bold transition shadow ${
            Object.keys(quizAnswers).length >= quickCheck.length
              ? 'bg-theme-accent hover:bg-theme-accent-hover text-white cursor-pointer'
              : 'bg-theme-surface-2 text-theme-secondary border border-theme cursor-not-allowed'
          }`}
        >
          Xem Đáp Án
        </button>
      ) : (
        <div className="alert-success rounded-xl p-3 text-center font-bold text-sm flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 alert-success-icon" />
          <span>
            Kết quả:{' '}
            {
              quickCheck.filter(
                (quickCheckItem) => quizAnswers[quickCheckItem.id] === quickCheckItem.correct_answer
              ).length
            }
            /{quickCheck.length} câu đúng
          </span>
        </div>
      )}
    </div>
  );
};
