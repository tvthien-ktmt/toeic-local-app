import React from 'react';
import { Clock, Send, Headphones, Sparkles, ChevronLeft } from 'lucide-react';
import type { LCExamDocument, LCExamResult, LCTestMode } from '../../../types/toeicListening';

interface LcExamTakeHeaderProps {
  document: LCExamDocument;
  mode: LCTestMode;
  timeRemainingSeconds: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  isSubmitted: boolean;
  result: LCExamResult | null;
  onBack: () => void;
  onSubmit: () => void;
}

/**
 * Top sticky header for the TOEIC Listening exam taking interface.
 * Shows title, mode indicator, countdown timer, answering progress bar, and submit trigger.
 */
export const LcExamTakeHeader: React.FC<LcExamTakeHeaderProps> = ({
  document,
  mode,
  timeRemainingSeconds,
  totalQuestions,
  answeredCount,
  flaggedCount,
  isSubmitted,
  result,
  onBack,
  onSubmit,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-theme-surface/95 backdrop-blur-md border-b border-theme shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2 transition-colors shrink-0"
            title="Trở về danh sách đề thi"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-theme-primary truncate">
                {document.title}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                mode === 'full_exam'
                  ? 'bg-theme-warning/15 text-theme-warning border border-theme-warning/30'
                  : 'bg-theme-accent/15 text-theme-accent border border-theme-accent/30'
              }`}>
                {mode === 'full_exam' ? 'Thi Thử Chuẩn ETS' : 'Luyện Tập Tự Do'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-theme-secondary mt-0.5">
              <span className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-theme-accent" />
                <span>100 Câu LC (Part 1-4)</span>
              </span>
              <span>&bull;</span>
              <span>Đã làm: <strong className="text-theme-primary">{answeredCount}/{totalQuestions}</strong></span>
              {flaggedCount > 0 && (
                <>
                  <span>&bull;</span>
                  <span className="text-theme-warning font-semibold">Đánh dấu: {flaggedCount}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Timer & Submit Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Countdown Clock */}
          {!isSubmitted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-2 border border-theme text-xs font-mono font-bold text-theme-primary">
              <Clock className="w-4 h-4 text-theme-accent" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          )}

          {/* Scaled Score Pill if submitted */}
          {isSubmitted && result && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-success/15 border border-theme-success/30 text-xs font-bold text-theme-success">
              <Sparkles className="w-4 h-4" />
              <span>Điểm LC: {result.scaledScore}/495 ({result.rawCorrectCount}/{totalQuestions})</span>
            </div>
          )}

          {/* Submit Exam Button */}
          {!isSubmitted && (
            <button
              onClick={onSubmit}
              className="px-4 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nộp Bài Thi LC</span>
              <span className="sm:hidden">Nộp Bài</span>
            </button>
          )}
        </div>
      </div>

      {/* Thin progress line at the very bottom of the header */}
      <div className="w-full h-1 bg-theme-surface-2">
        <div
          className="h-full bg-theme-accent transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
