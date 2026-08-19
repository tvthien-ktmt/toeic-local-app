import React from 'react';
import { BookOpen, CheckCircle2, XCircle, Check } from 'lucide-react';
import type { QuestionItem } from '../api/questions';
import { MarkdownPassage } from './MarkdownPassage';

interface DocumentQuestionItemCardProps {
  questionItem: QuestionItem;
  index: number;
  userChoice: string | undefined;
  isExamSubmitted: boolean;
  showDetail: boolean;
  onSelectOption: (questionId: number, optionLetter: string) => void;
  onToggleShowAnswer: (questionId: number) => void;
  onOpenGrammarModal: (topic: string) => void;
}

/**
 * Individual practice question card displaying text, options A-D, instant answer feedback, option explanations, and grammar references.
 */
export const DocumentQuestionItemCard: React.FC<DocumentQuestionItemCardProps> = ({
  questionItem,
  index,
  userChoice,
  isExamSubmitted,
  showDetail,
  onSelectOption,
  onToggleShowAnswer,
  onOpenGrammarModal,
}) => {
  const getOptionLetter = (optionString: string): string => {
    const clean = optionString.trim();
    if (clean.startsWith('A') || clean.startsWith('(A)')) {
      return 'A';
    }
    if (clean.startsWith('B') || clean.startsWith('(B)')) {
      return 'B';
    }
    if (clean.startsWith('C') || clean.startsWith('(C)')) {
      return 'C';
    }
    if (clean.startsWith('D') || clean.startsWith('(D)')) {
      return 'D';
    }

    return clean.charAt(0);
  };

  let optExps: Record<string, string> = {};
  if (questionItem.option_explanations_json) {
    try {
      optExps = JSON.parse(questionItem.option_explanations_json);
    } catch (parseError) {}
  }

  return (
    <div className="bg-theme-surface-2 rounded-2xl p-6 border border-theme space-y-4 shadow-sm hover:border-theme-accent transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-theme-accent/20 text-theme-accent font-mono text-xs font-bold border border-theme-accent/30">
            Câu {index + 1} (Part {questionItem.part})
          </span>

          <button
            onClick={() => onOpenGrammarModal(questionItem.grammar_topic || 'general grammar')}
            className="px-2.5 py-1 rounded-lg bg-theme-accent/15 hover:bg-theme-accent/25 text-theme-accent border border-theme-accent/30 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{questionItem.grammar_topic || 'unclassified'}</span>
          </button>
        </div>

        <button
          onClick={() => onToggleShowAnswer(questionItem.id)}
          className="px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-2 text-theme-primary text-xs font-semibold border border-theme transition cursor-pointer"
        >
          {showDetail ? 'Ẩn đáp án' : 'Xem giải thích'}
        </button>
      </div>

      <div className="text-base font-bold text-theme-primary leading-relaxed select-text">
        <MarkdownPassage text={questionItem.question_text} />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {questionItem.options.map((optionString, optionIndex) => {
          const letter = getOptionLetter(optionString);
          const isSelected = userChoice === letter;
          const isOptCorrect =
            questionItem.correct_answer &&
            letter.toUpperCase() === questionItem.correct_answer.toUpperCase();

          let optStyle = 'bg-theme-surface border-theme text-theme-primary hover:bg-theme-surface-2';

          if (showDetail) {
            if (isOptCorrect) {
              optStyle = 'alert-success border-theme-success font-bold text-theme-success shadow-lg';
            } else if (isSelected) {
              optStyle = 'alert-error border-theme-error font-bold text-theme-error';
            } else {
              optStyle = 'bg-theme-surface border-theme text-theme-secondary opacity-60';
            }
          } else if (isSelected) {
            optStyle = 'bg-theme-accent/20 border-theme-accent text-theme-accent font-bold';
          }

          return (
            <button
              key={optionIndex}
              disabled={isExamSubmitted}
              onClick={() => onSelectOption(questionItem.id, letter)}
              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between ${optStyle} ${
                isExamSubmitted ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span>{optionString}</span>
              {showDetail && isOptCorrect && (
                <CheckCircle2 className="w-4 h-4 text-theme-success shrink-0" />
              )}
              {showDetail && isSelected && !isOptCorrect && (
                <XCircle className="w-4 h-4 text-theme-error shrink-0" />
              )}
              {!showDetail && isSelected && (
                <Check className="w-4 h-4 text-theme-accent shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Explanations */}
      {showDetail && (
        <div className="p-4 rounded-xl bg-theme-surface border border-theme space-y-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-theme-success">Đáp án chính xác:</span>
            <span className="px-2 py-0.5 rounded alert-success font-bold">
              {questionItem.correct_answer || 'N/A'}
            </span>
          </div>

          {Object.keys(optExps).length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-theme-accent block">
                Giải thích chi tiết các lựa chọn:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(optExps).map(([letter, expText]) => (
                  <div key={letter} className="p-2 bg-theme-surface-2 border border-theme rounded-lg">
                    <span className="font-bold text-theme-warning font-mono mr-1">({letter}):</span>
                    <span className="text-theme-primary">{expText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questionItem.explanation && (
            <p className="text-theme-primary leading-relaxed pt-1">
              <span className="font-bold text-theme-warning">Giải thích chung:</span>{' '}
              {questionItem.explanation}
            </p>
          )}

          {questionItem.translated_sentence && (
            <div className="p-3 bg-theme-surface-2 border border-theme rounded-xl space-y-1">
              <span className="font-bold text-theme-success block">
                Bản dịch tiếng Việt hoàn chỉnh:
              </span>
              <p className="text-theme-primary italic leading-relaxed">
                "{questionItem.translated_sentence}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
