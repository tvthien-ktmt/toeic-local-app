import React, { useState } from 'react';
import { MarkdownPassage } from './MarkdownPassage';
import { BookOpen, CheckCircle2, XCircle, Search, AlertTriangle, Eye } from 'lucide-react';
import type { QuestionItem } from '../api/questions';

interface Part7EvidenceCardProps {
  questionItem: QuestionItem;
  index: number;
  userChoice: string | undefined;
  onSelectOption: (questionItem: QuestionItem, optionLetter: string) => void;
  onOpenGrammarModal: (topicName: string | null) => void;
}

/**
 * Enhanced Part 7 Practice Card with Passage View, Evidence Highlighting Mode, and Distractor Analysis (RC_Format.md Section 18-23).
 */
export const Part7EvidenceCard: React.FC<Part7EvidenceCardProps> = ({
  questionItem,
  index,
  userChoice,
  onSelectOption,
  onOpenGrammarModal,
}) => {
  const [isEvidenceModeActive, setIsEvidenceModeActive] = useState<boolean>(true);
  const isAnswered = !!userChoice;

  const parseOptionExplanations = (jsonString?: string | null): Record<string, string> => {
    if (!jsonString) {
      return {};
    }
    try {
      return JSON.parse(jsonString);
    } catch {
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
    <div className="bg-theme-surface rounded-3xl p-6 sm:p-8 border border-theme space-y-6 shadow-xl">
      {/* Meta Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-theme-success/20 text-theme-success font-mono text-xs font-bold border border-theme-success/30">
            Câu {index + 1} (Part 7 Reading)
          </span>

          <button
            onClick={() => onOpenGrammarModal(questionItem.grammar_topic)}
            className="px-2.5 py-1 rounded-xl bg-theme-accent/15 hover:bg-theme-accent/25 text-theme-accent border border-theme-accent/30 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{questionItem.grammar_topic || 'Đọc hiểu chi tiết'}</span>
          </button>

          {questionItem.topic_tag && (
            <span className="px-2.5 py-1 rounded-xl bg-theme-surface-2 text-theme-secondary text-xs font-medium border border-theme">
              {questionItem.topic_tag}
            </span>
          )}
        </div>

        {/* Evidence Mode Toggle Button */}
        <button
          onClick={() => setIsEvidenceModeActive(!isEvidenceModeActive)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
            isEvidenceModeActive
              ? 'bg-theme-accent text-white shadow-sm border-theme-accent'
              : 'bg-theme-surface-2 text-theme-secondary border-theme hover:text-theme-primary'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Evidence Mode (Soi Chứng Cứ): {isEvidenceModeActive ? 'BẬT' : 'TẮT'}</span>
        </button>
      </div>

      {/* Question Prompt */}
      <div className="text-base sm:text-lg font-bold text-theme-primary leading-relaxed select-text">
        <MarkdownPassage text={questionItem.question_text} />
      </div>

      {/* Interactive Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {questionItem.options.map((optionString) => {
          const letter = getOptionLetter(optionString);
          const isSelected = userChoice === letter;
          const isCorrect =
            isAnswered &&
            questionItem.correct_answer &&
            letter.toUpperCase() === questionItem.correct_answer.toUpperCase();
          const isWrong = isAnswered && isSelected && !isCorrect;

          return (
            <button
              key={letter}
              disabled={isAnswered}
              onClick={() => onSelectOption(questionItem, letter)}
              className={`p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${
                isCorrect
                  ? 'bg-theme-success/20 border-theme-success text-theme-success font-bold'
                  : isWrong
                  ? 'bg-theme-error/20 border-theme-error text-theme-error font-bold'
                  : isSelected
                  ? 'bg-theme-accent/20 border-theme-accent text-theme-primary'
                  : 'bg-theme-surface-2 border-theme hover:border-theme-accent/50 text-theme-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCorrect
                      ? 'bg-theme-success text-white'
                      : isWrong
                      ? 'bg-theme-error text-white'
                      : 'bg-theme-surface text-theme-secondary border border-theme'
                  }`}
                >
                  {letter}
                </span>
                <span>{optionString}</span>
              </div>

              {isCorrect && <CheckCircle2 className="w-5 h-5 text-theme-success shrink-0" />}
              {isWrong && <XCircle className="w-5 h-5 text-theme-error shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Evidence & Distractor Training Box (Visible after answering or when expanded) */}
      {isAnswered && (
        <div className="space-y-4 pt-2 border-t border-theme animate-in fade-in duration-200">
          {/* Evidence Highlight Box (Section 21) */}
          {isEvidenceModeActive && (
            <div className="p-4 rounded-2xl alert-success border border-theme-success/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-theme-success">
                <Search className="w-4 h-4" /> Dẫn Chứng Khẳng Định Đáp Án (Evidence Clue):
              </div>
              <p className="text-theme-primary leading-relaxed">
                {questionItem.explanation || 'Đối chiếu trực tiếp với câu thông tin chứa từ khóa trong văn bản đọc hiểu.'}
              </p>
            </div>
          )}

          {/* Vietnamese Sentence Translation */}
          {questionItem.translated_sentence && (
            <div className="p-4 rounded-2xl bg-theme-surface-2 border border-theme space-y-1.5 text-xs">
              <span className="font-bold text-theme-accent">Dịch Nghĩa Toàn Câu / Đoạn:</span>
              <p className="text-theme-secondary leading-relaxed italic">
                {questionItem.translated_sentence}
              </p>
            </div>
          )}

          {/* Distractor Training Box (Section 23) */}
          {questionItem.common_trap && (
            <div className="p-4 rounded-2xl alert-warning border border-theme-warning/30 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-theme-warning">
                <AlertTriangle className="w-4 h-4" /> Phân Tích Bẫy Gây Nhiễu (Distractor Breakdown):
              </div>
              <p className="text-theme-primary leading-relaxed">
                {questionItem.common_trap}
              </p>
            </div>
          )}

          {/* Option-by-option Explanations */}
          {Object.keys(optionExplanations).length > 0 && (
            <div className="p-4 rounded-2xl bg-theme-surface-2 border border-theme space-y-2 text-xs">
              <span className="font-bold text-theme-primary">Giải Thích Chi Tiết Từng Lựa Chọn:</span>
              <div className="space-y-1.5">
                {Object.entries(optionExplanations).map(([optKey, optExp]) => (
                  <div key={optKey} className="flex gap-2 text-theme-secondary">
                    <strong className="text-theme-primary shrink-0">({optKey}):</strong>
                    <span>{optExp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
