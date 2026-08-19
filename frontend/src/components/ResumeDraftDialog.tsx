import React from 'react';
import { BookOpen } from 'lucide-react';

interface ResumeDraftDialogProps {
  savedAnswerCount: number;
  onResume: () => void;
  onStartFresh: () => void;
}

/**
 * Dialog prompting the user whether to resume a previously saved in-progress exam attempt.
 */
export const ResumeDraftDialog: React.FC<ResumeDraftDialogProps> = ({
  savedAnswerCount,
  onResume,
  onStartFresh,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-theme-surface border border-theme-accent/40 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-theme-accent/20 border border-theme-accent/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-theme-accent" />
          </div>
          <div>
            <h3 className="font-bold text-base text-theme-primary">Tiếp Tục Làm Dở?</h3>
            <p className="text-xs text-theme-secondary mt-0.5">Phát hiện lần làm chưa hoàn thành</p>
          </div>
        </div>
        <p className="text-xs text-theme-secondary leading-relaxed">
          Bạn đã làm được <strong className="text-theme-primary">{savedAnswerCount} câu</strong> trong lần trước nhưng chưa nộp.
          Muốn tiếp tục từ đó hay bắt đầu lại từ đầu?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onStartFresh}
            className="flex-1 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
          >
            Bắt Đầu Mới
          </button>
          <button
            onClick={onResume}
            className="flex-1 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-lg transition-all hover:bg-theme-accent-hover"
          >
            Tiếp Tục Làm
          </button>
        </div>
      </div>
    </div>
  );
};
