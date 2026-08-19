import React from 'react';
import { Trophy, BookOpen, Clock, Target } from 'lucide-react';
import type { ExamResultData } from '../types/examResults';

interface ExamScoreTabProps {
  result: ExamResultData;
  wrongCount: number;
  skippedCount: number;
  onGoToWeaknessTab: () => void;
  onGoToReviewTab: () => void;
}

/**
 * Results score tab featuring scaled TOEIC reading score (0-495), accuracy breakdown per Part, and time spent metrics.
 */
export const ExamScoreTab: React.FC<ExamScoreTabProps> = ({
  result,
  wrongCount,
  skippedCount,
  onGoToWeaknessTab,
  onGoToReviewTab,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes} phút ${remainingSeconds} giây`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Score */}
        <div className="bg-theme-accent rounded-2xl p-6 text-white text-center shadow-lg border border-theme-accent">
          <Trophy className="w-10 h-10 text-white/90 mx-auto mb-2 animate-bounce" />
          <div className="text-5xl font-black">{result.toeic_score}</div>
          <div className="text-sm opacity-90 mb-2">/ 495 điểm RC</div>
          <div className="text-xs bg-white/20 rounded-full px-3 py-1 inline-block font-semibold">
            {result.raw_score}/{result.total_questions} câu (
            {Math.round(
              (result.raw_score /
                Math.max(result.gradeable_questions || result.total_questions, 1)) *
                100
            )}
            %)
          </div>
        </div>

        {/* Part Breakdown */}
        <div className="bg-theme-surface rounded-2xl p-5 border border-theme space-y-3">
          <h3 className="text-xs font-bold uppercase text-theme-secondary flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-theme-accent" /> Tỉ Lệ Đúng Theo Part
          </h3>
          {[
            { label: 'Part 5', correct: result.part5_correct, total: 30, color: 'bg-theme-accent' },
            { label: 'Part 6', correct: result.part6_correct, total: 16, color: 'bg-theme-warning' },
            { label: 'Part 7', correct: result.part7_correct, total: 54, color: 'bg-theme-success' },
          ].map((partOption) => (
            <div key={partOption.label}>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-theme-primary">
                  {partOption.label} ({partOption.total} câu)
                </span>
                <span className="text-theme-accent font-bold">
                  {partOption.correct}/{partOption.total}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-theme-surface-2 overflow-hidden border border-theme">
                <div
                  className={`h-full ${partOption.color} rounded-full`}
                  style={{ width: `${(partOption.correct / partOption.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Info + Skipped/Wrong */}
        <div className="bg-theme-surface rounded-2xl p-5 border border-theme space-y-3">
          <h3 className="text-xs font-bold uppercase text-theme-secondary flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-theme-warning" /> Chi Tiết Lượt Thi
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-theme">
              <span className="text-theme-secondary">Chế độ:</span>
              <span className="font-bold text-theme-primary">
                {result.mode === 'full_exam' ? 'Thi Thật (75m)' : 'Luyện Tập'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-theme">
              <span className="text-theme-secondary">Thời gian làm:</span>
              <span className="font-bold text-theme-primary">
                {formatTime(result.time_spent_seconds)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-theme">
              <span className="text-theme-secondary">Số câu sai:</span>
              <span className="font-bold text-theme-error">{wrongCount} câu</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-theme-secondary">Số câu bỏ trống:</span>
              <span className="font-bold text-theme-warning">{skippedCount} câu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onGoToWeaknessTab}
          className="flex-1 py-3 px-4 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
        >
          <Target className="w-4 h-4" />
          <span>Tổng Ôn {wrongCount + skippedCount} Câu Sai / Chưa Làm &rarr;</span>
        </button>
        <button
          onClick={onGoToReviewTab}
          className="flex-1 py-3 px-4 rounded-xl bg-theme-surface-2 border border-theme text-theme-primary font-bold text-xs transition-all flex items-center justify-center gap-2 hover:bg-theme-surface cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Xem Lại Toàn Bộ 100 Câu &rarr;</span>
        </button>
      </div>
    </div>
  );
};
