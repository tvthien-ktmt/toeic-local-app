import React from 'react';
import { ArrowLeft, Clock, ArrowRight, Send } from 'lucide-react';

interface FullToeicHeaderBarProps {
  examStage: 'PRE_TEST' | 'LISTENING' | 'TRANSITION' | 'READING' | 'RESULT';
  formattedTimer: string;
  onNavigateHome: () => void;
  onTransitionToReading: () => void;
  onSubmitExam: () => void;
}

/**
 * Top fixed exam navigation and timer control bar for Full 2-Skill TOEIC test.
 */
export const FullToeicHeaderBar: React.FC<FullToeicHeaderBarProps> = ({
  examStage,
  formattedTimer,
  onNavigateHome,
  onTransitionToReading,
  onSubmitExam,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-theme-surface border-b border-theme px-4 py-3 shadow-xs flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNavigateHome}
          className="p-1.5 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2 transition-colors cursor-pointer"
          title="Thoát phòng thi"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-theme-primary">
              TOEIC Official 2-Skill Full Test (200 Câu)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-accent/15 text-theme-accent border border-theme-accent/30">
              {examStage === 'LISTENING' ? 'Phần 1: Listening' : examStage === 'READING' ? 'Phần 2: Reading' : 'Chuẩn Bị'}
            </span>
          </div>
          <p className="text-[11px] text-theme-secondary">
            Mô phỏng 100% định dạng đề thi thực tế ETS
          </p>
        </div>
      </div>

      {/* Timer & Controls */}
      <div className="flex items-center gap-3">
        {examStage === 'LISTENING' && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-theme-accent/10 border border-theme-accent/30 text-theme-accent font-mono font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>{formattedTimer}</span>
          </div>
        )}

        {examStage === 'READING' && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-theme-warning/10 border border-theme-warning/30 text-theme-warning font-mono font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>{formattedTimer}</span>
          </div>
        )}

        {examStage === 'LISTENING' && (
          <button
            type="button"
            onClick={onTransitionToReading}
            className="px-4 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Chuyển Sang Reading</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {examStage === 'READING' && (
          <button
            type="button"
            onClick={onSubmitExam}
            className="px-5 py-2 rounded-xl bg-theme-success text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Bài Thi</span>
          </button>
        )}
      </div>
    </header>
  );
};
