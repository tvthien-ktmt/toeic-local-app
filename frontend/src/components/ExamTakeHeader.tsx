import React from 'react';
import { ArrowLeft, Clock, Send, Trophy, Flag } from 'lucide-react';

interface ExamDocument {
  id: number;
  filename: string;
  category: string;
  series: string;
  test_number: number;
  markdown_content: string;
  is_builtin: boolean;
}

interface ExamTakeHeaderProps {
  document: ExamDocument | null;
  mode: 'full_exam' | 'practice';
  answeredCount: number;
  totalQuestions: number;
  progressPercent: number;
  flaggedCount: number;
  timeLeft: number;
  isSubmitting: boolean;
  examResult: any | null;
  onBack: () => void;
  onSubmitExam: () => void;
  onShowResultModal: () => void;
}

/**
 * Sticky top navigation header for exam taking with progress bar, countdown timer, and submit trigger.
 */
export const ExamTakeHeader: React.FC<ExamTakeHeaderProps> = ({
  document,
  mode,
  answeredCount,
  totalQuestions,
  progressPercent,
  flaggedCount,
  timeLeft,
  isSubmitting,
  examResult,
  onBack,
  onSubmitExam,
  onShowResultModal,
}) => {
  const formatTimer = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;

    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <header className="sticky top-16 z-40 bg-theme-surface/95 backdrop-blur-md border-b border-theme shadow-md px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface-3 border border-theme text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded-md">
                {mode === 'full_exam' ? 'Thi Thật 75m' : 'Luyện Tập Tự Do'}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-theme-primary truncate max-w-md">
                {document?.filename.replace(/^\[.*?\]\s*/, '')}
              </h1>
            </div>
            <p className="text-[11px] text-theme-secondary">
              Đã làm: <strong className="text-theme-primary">{answeredCount} / {totalQuestions} câu</strong> ({progressPercent}%)
              {flaggedCount > 0 && (
                <span className="ml-2 text-theme-warning inline-flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  <span>{flaggedCount} đánh dấu</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-4">
          {mode === 'full_exam' && !examResult && (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold border transition-all ${
                timeLeft < 300
                  ? 'bg-theme-error/20 text-theme-error border-theme-error/30 animate-pulse'
                  : timeLeft < 900
                  ? 'bg-theme-warning/20 text-theme-warning border-theme-warning/30'
                  : 'bg-theme-success/20 text-theme-success border-theme-success/30'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}

          {examResult ? (
            <button
              onClick={onShowResultModal}
              className="px-4 sm:px-6 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all duration-200 animate-pulse cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-white" />
              <span>Xem Bảng Điểm TOEIC ({examResult.toeic_score}/495)</span>
            </button>
          ) : (
            <button
              onClick={onSubmitExam}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-2 rounded-xl bg-theme-success hover:opacity-90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang nộp...' : 'Nộp Bài Thi'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
