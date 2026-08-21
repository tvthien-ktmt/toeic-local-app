import React from 'react';
import { Volume2, Play, Calendar } from 'lucide-react';
import type { LCErrorNotebookItem } from '../../../types/toeicListening';
import { getLcTrapLabelVi } from '../../../utils/lcScoreCalculator';

interface LcErrorCardProps {
  item: LCErrorNotebookItem;
  onSpeak: (text: string) => void;
  onRetest: (item: LCErrorNotebookItem) => void;
}

/**
 * Individual Mistake item card in the LC Error Bank.
 */
export const LcErrorCard: React.FC<LcErrorCardProps> = ({
  item,
  onSpeak,
  onRetest,
}) => {
  const trapLabel = getLcTrapLabelVi(item.trapType);

  return (
    <div className="p-5 rounded-2xl bg-theme-surface border border-theme shadow-sm hover:border-theme-accent/50 transition-all space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-theme-accent/15 text-theme-accent font-bold text-xs flex items-center justify-center">
            Q{item.questionNumber}
          </span>
          <div>
            <span className="text-xs font-bold text-theme-primary">
              Part {item.part} &bull; {item.category}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-theme-error/15 text-theme-error border border-theme-error/30">
                Bẫy: {trapLabel.label}
              </span>
              <span className="text-[10px] text-theme-secondary">
                Sai {item.mistakeCount} lần
              </span>
            </div>
          </div>
        </div>

        {/* SRS Badge & Retest */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-theme-surface-2 border border-theme text-theme-secondary flex items-center gap-1">
            <Calendar className="w-3 h-3 text-theme-accent" />
            <span>Ôn: {item.nextReviewDate}</span>
          </span>
          <button
            onClick={() => onRetest(item)}
            className="px-3 py-1.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Luyện Lại</span>
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="p-3.5 rounded-xl bg-theme-surface-2 border border-theme text-xs space-y-1">
        <p className="font-semibold text-theme-primary">{item.questionStem}</p>
        {item.transcriptExcerpt && (
          <div className="pt-2 border-t border-theme/40 flex items-start justify-between gap-2">
            <p className="text-[11px] text-theme-secondary italic leading-relaxed">
              "{item.transcriptExcerpt}"
            </p>
            <button
              onClick={() => onSpeak(item.transcriptExcerpt || '')}
              className="p-1 rounded-md text-theme-accent hover:bg-theme-accent/10 shrink-0 cursor-pointer"
              title="Nghe phát âm"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Answer Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-theme-error/10 border border-theme-error/30 text-theme-primary">
          <span className="font-bold text-theme-error block text-[11px]">Bạn đã chọn:</span>
          <span>{item.userSelectedOption}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-theme-success/10 border border-theme-success/30 text-theme-primary">
          <span className="font-bold text-theme-success block text-[11px]">Đáp án chuẩn:</span>
          <span>{item.correctOption}</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-3 rounded-xl bg-theme-surface-2/60 border border-theme/50 text-[11px] text-theme-secondary space-y-1">
        <p className="font-bold text-theme-primary">Phân tích bẫy:</p>
        <p>{item.explanation}</p>
        {item.notes && (
          <p className="text-theme-warning font-medium mt-1">
            Ghi chú: {item.notes}
          </p>
        )}
      </div>
    </div>
  );
};
