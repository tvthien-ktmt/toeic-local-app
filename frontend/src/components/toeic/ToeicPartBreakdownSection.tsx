import React from 'react';

interface ToeicPartBreakdownSectionProps {
  partBreakdown: Record<string, { correct: number; total: number; percentage: number }>;
}

/**
 * Breakdown of user performance across Part 1 through Part 7 with colored progress bars.
 */
export const ToeicPartBreakdownSection: React.FC<ToeicPartBreakdownSectionProps> = ({
  partBreakdown,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
        Chi Tiết Tỷ Lệ Làm Đúng Theo 7 Parts
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(partBreakdown).map(([partKey, data]) => {
          const isHigh = data.percentage >= 75;
          const isMedium = data.percentage >= 50 && data.percentage < 75;

          return (
            <div
              key={partKey}
              className="p-4 rounded-2xl bg-theme-surface-2 border border-theme space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-theme-primary">
                  {partKey}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isHigh
                      ? 'bg-theme-success/20 text-theme-success'
                      : isMedium
                      ? 'bg-theme-warning/20 text-theme-warning'
                      : 'bg-theme-error/20 text-theme-error'
                  }`}
                >
                  {data.correct}/{data.total} câu ({data.percentage}%)
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-theme-surface overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh
                      ? 'bg-theme-success'
                      : isMedium
                      ? 'bg-theme-warning'
                      : 'bg-theme-error'
                  }`}
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
