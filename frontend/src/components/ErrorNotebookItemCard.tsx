import React from 'react';
import { Award, RotateCcw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { ErrorNotebookItem } from '../api/errorNotebook';

interface ErrorNotebookItemCardProps {
  item: ErrorNotebookItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Card component representing a single mistake entry in the error notebook with history and option breakdowns.
 */
export const ErrorNotebookItemCard: React.FC<ErrorNotebookItemCardProps> = ({
  item,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-6 space-y-4 shadow-sm hover:border-theme-accent/50 transition">
      {/* Card Header Badges */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-lg bg-theme-accent/20 text-theme-accent font-mono text-xs font-bold">
            Part {item.part}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-theme-surface-2 text-theme-secondary text-xs font-medium border border-theme">
            {item.grammar_topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.status === 'mastered' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold alert-success text-theme-success flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Đã Khắc Phục (Mastered)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold alert-warning text-theme-warning flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Cần Ôn Lại ({item.wrong_count} lần sai)
            </span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <p className="text-sm font-semibold text-theme-primary leading-relaxed whitespace-pre-wrap">
        {item.question_text}
      </p>

      {/* Compact Options List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {item.options.map((optionText, optionIdx) => {
          const letter = String.fromCharCode(65 + optionIdx);
          const isCorrect = letter === item.correct_answer;

          return (
            <div
              key={letter}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                isCorrect
                  ? 'bg-theme-success/15 border-theme-success text-theme-success font-bold'
                  : 'bg-theme-surface-2 border-theme text-theme-secondary'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                  isCorrect
                    ? 'bg-theme-success text-white'
                    : 'bg-theme-surface border border-theme'
                }`}
              >
                {letter}
              </span>
              <span>{optionText}</span>
            </div>
          );
        })}
      </div>

      {/* Toggle details button */}
      <div className="pt-2 border-t border-theme flex items-center justify-between">
        <button
          onClick={onToggleExpand}
          className="text-xs font-bold text-theme-accent flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>{isExpanded ? 'Thu gọn phân tích' : 'Xem giải thích chi tiết & bẫy'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-3 text-xs animate-in fade-in duration-150">
          {item.translated_sentence && (
            <div className="space-y-1">
              <span className="font-bold text-theme-accent">Dịch nghĩa câu hỏi:</span>
              <p className="text-theme-secondary italic">{item.translated_sentence}</p>
            </div>
          )}

          {item.common_trap && (
            <div className="p-3 rounded-lg alert-warning border border-theme-warning/30 space-y-1">
              <span className="font-bold text-theme-warning flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Bẫy thường gặp:
              </span>
              <p className="text-theme-primary">{item.common_trap}</p>
            </div>
          )}

          {item.explanation && (
            <div className="space-y-1">
              <span className="font-bold text-theme-primary">Giải thích chi tiết:</span>
              <p className="text-theme-secondary leading-relaxed whitespace-pre-wrap">{item.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
