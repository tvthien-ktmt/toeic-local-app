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
  isGuidedMode?: boolean;
  generatingId: number | null;
  onSelectOption: (questionItem: QuestionItem, optionLetter: string) => void;
  onOpenGrammarModal: (topicName: string | null) => void;
  onGenerateSimilar: (questionId: number) => void;
}

/**
 * Practice question component rendering question prompt, choices A-D, grammar tags, Guided Mode strategy, and AI similar question generator.
 */
const PracticeQuestionCardComponent: React.FC<PracticeQuestionCardProps> = ({
  questionItem,
  index,
  userChoice,
  practiceMode,
  isMockSubmitted,
  isGuidedMode = false,
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

      {/* Guided Strategy Box (Section XXV, XXVII, XXIX) */}
      {isGuidedMode && !showFeedback && (
        <div className="p-4 rounded-2xl alert-warning border border-theme-warning/40 space-y-2.5 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold text-theme-warning">
            <Sparkles className="w-4 h-4" /> Chiến Thuật Giải Nhanh (Guided Mode — Part {questionItem.part}):
          </div>

          {questionItem.part === 5 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-theme-primary">
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">1. Vị trí chỗ trống:</strong>
                <p className="text-theme-secondary">Quan sát các từ đứng liền trước & sau khoảng trống để định vị cấu trúc ngữ pháp.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">2. Loại từ cần điền:</strong>
                <p className="text-theme-secondary">Xác định vị trí thiếu Danh từ, Động từ, Tính từ hay Trạng từ bổ nghĩa.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">3. Dạng bài trọng tâm:</strong>
                <p className="text-theme-primary font-semibold truncate">{questionItem.grammar_topic}</p>
              </div>
            </div>
          )}

          {questionItem.part === 6 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-theme-primary">
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">1. Đọc lướt ngữ cảnh:</strong>
                <p className="text-theme-secondary">Đọc trọn vẹn câu đứng trước và câu đứng sau ô trống để nắm mạch thông tin.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">2. Hòa hợp thì & Liên từ:</strong>
                <p className="text-theme-secondary">Chú ý mốc thời gian toàn bài để chia thì đúng hoặc chọn liên từ chuyển ý phù hợp.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">3. Câu chèn ngữ cảnh:</strong>
                <p className="text-theme-primary font-semibold">Nếu là câu chèn: Tìm từ nối (However, Therefore) hoặc đại từ chỉ định.</p>
              </div>
            </div>
          )}

          {questionItem.part === 7 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-theme-primary">
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">1. Đọc câu hỏi trước:</strong>
                <p className="text-theme-secondary">Gạch chân Keywords (tên người, ngày tháng, địa điểm, mục đích) trước khi đọc bài.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">2. Scan tìm chứng cứ:</strong>
                <p className="text-theme-secondary">Dò nhanh vị trí chứa từ khóa trong đoạn văn để xác định câu chứa manh mối (Evidence).</p>
              </div>
              <div className="p-2.5 rounded-xl bg-theme-surface border border-theme space-y-0.5">
                <strong className="text-theme-accent block">3. Loại suy bẫy Paraphrase:</strong>
                <p className="text-theme-primary font-semibold">Cảnh giác với đáp án dùng từ y hệt trong bài nhưng sai ngữ cảnh.</p>
              </div>
            </div>
          )}
        </div>
      )}

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

export const PracticeQuestionCard = React.memo(PracticeQuestionCardComponent);
