import React from 'react';
import { TrendingDown } from 'lucide-react';
import type { DashboardWeaknessItem } from '../api/documents';

interface DashboardWeaknessSectionProps {
  weaknessData: DashboardWeaknessItem[];
  examHistoryLength: number;
}

/**
 * Grammar weakness breakdown section highlighting topics with low user accuracy and suggesting targeted reviews.
 */
export const DashboardWeaknessSection: React.FC<DashboardWeaknessSectionProps> = ({
  weaknessData,
  examHistoryLength,
}) => {
  if (weaknessData.length === 0) {
    return null;
  }

  return (
    <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
          <TrendingDown className="w-5 h-5 text-theme-error" />
          <h2>Chủ Điểm Hay Sai Nhất — Tích Luỹ Qua Các Lần Thi</h2>
        </div>
        <span className="text-xs alert-error border border-theme-error/30 px-2.5 py-1 rounded-full font-semibold">
          {weaknessData.filter((weaknessItem) => weaknessItem.error_rate >= 40).length} chủ điểm cần ôn ngay
        </span>
      </div>
      <p className="text-xs text-theme-secondary">
        Phân tích tổng hợp từ {examHistoryLength} lần thi. Những chủ điểm có tỉ lệ sai cao nhất cần ôn lại trước kỳ thi.
      </p>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {weaknessData.slice(0, 10).map((weaknessItem, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              weaknessItem.error_rate >= 60
                ? 'alert-error border-theme-error/30'
                : weaknessItem.error_rate >= 40
                ? 'alert-warning border-theme-warning/30'
                : 'bg-theme-surface-2 border-theme'
            }`}
          >
            <span
              className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 border ${
                weaknessItem.error_rate >= 60
                  ? 'alert-error border-theme-error'
                  : weaknessItem.error_rate >= 40
                  ? 'alert-warning border-theme-warning'
                  : 'alert-success border-theme-success'
              }`}
            >
              {Math.round(weaknessItem.error_rate)}%
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-theme-primary truncate">
                {weaknessItem.grammar_topic}
              </div>
              <div className="text-[10px] text-theme-secondary">
                {weaknessItem.wrong} sai • {weaknessItem.skipped} bỏ trống • {weaknessItem.correct} đúng (/{weaknessItem.total_questions})
              </div>
            </div>
            <div className="w-24 h-2 rounded-full bg-theme-surface-2 overflow-hidden shrink-0 border border-theme">
              <div
                className={`h-full rounded-full ${
                  weaknessItem.error_rate >= 60
                    ? 'bg-theme-error'
                    : weaknessItem.error_rate >= 40
                    ? 'bg-theme-warning'
                    : 'bg-theme-success'
                }`}
                style={{ width: `${Math.min(100, weaknessItem.error_rate)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
