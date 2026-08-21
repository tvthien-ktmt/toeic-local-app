import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

interface SpeedTrainingSummaryCardProps {
  config: {
    title: string;
    timeLimitSeconds: number;
    targetSecPerQuestion: number;
  };
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  totalTimeSpent: number;
  avgSecPerQ: number;
  onRestartSprint: () => void;
  onSelectOtherMode: () => void;
}

/**
 * Summary card component displaying metrics, accuracy, average seconds per question, and speed verdict for completed sprints.
 */
export const SpeedTrainingSummaryCard: React.FC<SpeedTrainingSummaryCardProps> = ({
  config,
  correctCount,
  answeredCount,
  totalQuestions,
  totalTimeSpent,
  avgSecPerQ,
  onRestartSprint,
  onSelectOtherMode,
}) => {
  const isSpeedMastered = avgSecPerQ <= config.targetSecPerQuestion && correctCount >= totalQuestions * 0.8;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-theme-accent/20 border border-theme-accent/30 text-theme-accent flex items-center justify-center mx-auto mb-2">
          <Trophy className="w-8 h-8 text-theme-accent" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-theme-primary">
            Hoàn Thành Bài Sprint Tốc Độ!
          </h2>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            {config.title}
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-theme-surface-2 rounded-2xl p-4 border border-theme">
            <span className="text-xs text-theme-secondary font-medium">Độ Chính Xác</span>
            <div className="text-3xl font-black text-theme-success mt-1">
              {correctCount} / {answeredCount}
            </div>
            <span className="text-[10px] text-theme-secondary">Đã trả lời: {answeredCount}/{totalQuestions} câu</span>
          </div>

          <div className="bg-theme-surface-2 rounded-2xl p-4 border border-theme">
            <span className="text-xs text-theme-secondary font-medium">Thời Gian Chạy</span>
            <div className="text-3xl font-black text-theme-primary mt-1">
              {totalTimeSpent}s
            </div>
            <span className="text-[10px] text-theme-secondary">Giới hạn: {config.timeLimitSeconds}s</span>
          </div>

          <div className="bg-theme-surface-2 rounded-2xl p-4 border border-theme">
            <span className="text-xs text-theme-secondary font-medium">Tốc Độ Trung Bình</span>
            <div className="text-3xl font-black text-theme-accent mt-1">
              {avgSecPerQ}s / câu
            </div>
          </div>
        </div>

        {/* Speed Verdict Box */}
        <div
          className={`p-4 rounded-2xl max-w-2xl mx-auto text-xs font-semibold border ${
            isSpeedMastered
              ? 'alert-success border-theme-success/40 text-theme-success'
              : 'alert-warning border-theme-warning/40 text-theme-warning'
          }`}
        >
          {isSpeedMastered
            ? `Xuất sắc! Bạn đã đạt độ chuẩn xác cao cùng tốc độ lý tưởng (Dưới ${config.targetSecPerQuestion}s/câu).`
            : `Cần rèn thêm! Mục tiêu lý tưởng là ${config.targetSecPerQuestion}s/câu với độ chính xác > 80%. Hãy tiếp tục luyện thêm một bài Sprint nữa.`}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onRestartSprint}
            className="px-6 py-3 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chạy Lại Sprint Này</span>
          </button>

          <button
            onClick={onSelectOtherMode}
            className="px-6 py-3 rounded-xl bg-theme-surface-2 border border-theme text-theme-primary font-bold text-xs hover:bg-theme-surface transition cursor-pointer"
          >
            Chọn Chế Độ Khác
          </button>
        </div>
      </div>
    </div>
  );
};
