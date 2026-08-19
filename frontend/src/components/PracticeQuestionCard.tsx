import React from 'react';
import { CheckCircle2, XCircle, RefreshCw, Sparkles, BookOpen, Languages, Check } from 'lucide-react';
import type { QuestionItem } from '../api/questions';
import { MarkdownPassage } from './MarkdownPassage';

interface PracticeQuestionCardProps {
  questionItem: QuestionItem;
  index: number;
  userChoice: string | undefined;
  practiceMode: 'part_practice' | 'full_mock';
  isMockSubmitted: boolean;
  generatingId: number | null;
  onSelectOption: (questionItem: QuestionItem, optionLetter: string) => void;
  onOpenGrammarModal: (topicName: string | null) => void;
  onGenerateSimilar: (questionId: number) => void;
}

/**
 * Practice question component rendering question prompt, choices A-D, grammar tags, and AI similar question generator.
 */
export const PracticeQuestionCard: React.FC<PracticeQuestionCardProps> = ({
  questionItem,
  index,
  userChoice,
  practiceMode,
  isMockSubmitted,
  generatingId,
  onSelectOption,
  onOpenGrammarModal,
  onGenerateSimilar,
}) => {
  const isAnswered = !!userChoice;
  const showFeedback =
    practiceMode === 'part_practice'
      ? isAnswered
      : practiceMode === 'full_mock' && isMockSubmitted;

  const parseOptionExplanations = (jsonString?: string | null): Record<string, string> => {
    if (!jsonString) {
      return {};
    }
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      return {};
    }
  };

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

  const optionExplanations = parseOptionExplanations(questionItem.option_explanations_json);

  return (
    <div className="bg-theme-surface rounded-3xl p-6 sm:p-8 border border-theme space-y-5 shadow-xl">
      {/* Meta header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-3 py-1 rounded-xl bg-theme-accent/20 text-theme-accent font-mono text-xs font-bold border border-theme-accent/30">
            Câu {index + 1} (Part {questionItem.part})
          </span>

          <button
            onClick={() => onOpenGrammarModal(questionItem.grammar_topic)}
            className="px-2.5 py-1 rounded-xl bg-theme-accent/15 hover:bg-theme-accent/25 text-theme-accent border border-theme-accent/30 text-xs font-semibold flex items-center space-x-1 transition-colors"
            title="Bấm để xem thẻ Ôn Nhanh Ngữ Pháp"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{questionItem.grammar_topic}</span>
          </button>

          {questionItem.topic_tag && (
            <span className="px-2.5 py-1 rounded-xl bg-theme-surface-2 text-theme-secondary text-xs font-medium border border-theme">
              {questionItem.topic_tag}
            </span>
          )}
        </div>

        {practiceMode === 'part_practice' && (
          <button
            onClick={() => onGenerateSimilar(questionItem.id)}
            disabled={generatingId === questionItem.id}
            className="px-3 py-1.5 rounded-xl bg-theme-accent/20 hover:bg-theme-accent/30 text-theme-accent border border-theme-accent/40 text-xs font-semibold transition flex items-center gap-1.5"
          >
            {generatingId === questionItem.id ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Sinh câu tương tự</span>
          </button>
        )}
      </div>

      {/* Question Text */}
      <div className="text-base sm:text-lg font-bold text-theme-primary leading-relaxed select-text">
        <MarkdownPassage text={questionItem.question_text} />
      </div>

      {/* Interactive Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {questionItem.options.map((optionString, optionIndex) => {
          const letter = getOptionLetter(optionString);
          const isSelected = userChoice === letter;
          const isCorrect =
            questionItem.correct_answer &&
            letter.toUpperCase() === questionItem.correct_answer.toUpperCase();

          let optionStyle = 'bg-theme-surface-2 hover:bg-theme-surface border-theme text-theme-primary';

          if (showFeedback) {
            if (isCorrect) {
              optionStyle = 'alert-success border-theme-success font-bold text-theme-success shadow';
            } else if (isSelected) {
              optionStyle = 'alert-error border-theme-error font-bold text-theme-error';
            } else {
              optionStyle = 'bg-theme-surface-2 border-theme text-theme-secondary opacity-60';
            }
          } else if (isSelected) {
            optionStyle = 'bg-theme-accent/20 border-theme-accent text-theme-accent font-bold';
          }

          return (
            <button
              key={optionIndex}
              disabled={practiceMode === 'full_mock' ? isMockSubmitted : isAnswered}
              onClick={() => onSelectOption(questionItem, letter)}
              className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between ${optionStyle}`}
            >
              <span>{optionString}</span>
              {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-theme-success shrink-0" />}
              {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-theme-error shrink-0" />}
              {!showFeedback && isSelected && <Check className="w-5 h-5 text-theme-accent shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation & Translation Card after answer */}
      {showFeedback && (
        <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3 text-xs sm:text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-theme-success">Đáp án chính xác:</span>
            <span className="px-2.5 py-0.5 rounded alert-success font-bold">
              {questionItem.correct_answer || 'Chưa xác định trong đề gốc'}
            </span>
          </div>

          {userChoice && optionExplanations[userChoice] && (
            <div className="p-3 bg-theme-surface border border-theme rounded-xl space-y-1">
              <span className="font-bold text-theme-accent block">
                Giải thích cho lựa chọn ({userChoice}) của bạn:
              </span>
              <p className="text-theme-primary leading-relaxed">{optionExplanations[userChoice]}</p>
            </div>
          )}

          {questionItem.explanation && (
            <p className="text-theme-primary leading-relaxed">
              <span className="font-bold text-theme-warning">Giải thích chung:</span> {questionItem.explanation}
            </p>
          )}

          {questionItem.translated_sentence && (
            <div className="p-3 bg-theme-surface border border-theme rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-theme-success">
                <Languages className="w-4 h-4" />
                <span>Bản dịch tiếng Việt hoàn chỉnh:</span>
              </div>
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
