import React from 'react';
import { Target } from 'lucide-react';
import type { TodayPlanStep } from '../api/documents';

interface DashboardAdaptivePlanSectionProps {
  todayAdaptivePlan: TodayPlanStep[];
  onNavigateTab?: (tab: 'textbooks' | 'upload' | 'practice' | 'flashcards' | 'dashboard' | 'roadmap' | 'errors' | 'speed') => void;
}

/**
 * 5-step personalized daily action plan card section for learning routine acceleration.
 */
export const DashboardAdaptivePlanSection: React.FC<DashboardAdaptivePlanSectionProps> = ({
  todayAdaptivePlan,
  onNavigateTab,
}) => {
  if (!todayAdaptivePlan || todayAdaptivePlan.length === 0) {
    return null;
  }

  return (
    <div className="bg-theme-surface rounded-3xl p-6 sm:p-8 border border-theme shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-theme-accent/20 text-theme-accent flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-theme-primary">
            Kế Hoạch Hành Động Cá Nhân Hóa Hôm Nay (5 Bước)
          </h2>
        </div>
        <span className="text-xs text-theme-secondary font-medium">
          Ước tính: ~55 phút hoàn thành
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {todayAdaptivePlan.map((stepItem) => (
          <div
            key={stepItem.step}
            className="bg-theme-surface-2 p-4 rounded-2xl border border-theme space-y-3 flex flex-col justify-between hover:border-theme-accent transition shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-theme-accent text-white font-black text-xs flex items-center justify-center">
                  {stepItem.step}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-theme-accent/15 text-theme-accent border border-theme-accent/20">
                  {stepItem.badge}
                </span>
              </div>

              <h4 className="text-sm font-bold text-theme-primary line-clamp-1">
                {stepItem.title}
              </h4>
              <p className="text-[11px] text-theme-secondary line-clamp-2 leading-relaxed">
                {stepItem.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-theme">
              <span className="text-[10px] text-theme-secondary font-medium block">
                Thời lượng: <strong>{stepItem.target_time}</strong>
              </span>
              <button
                onClick={() => onNavigateTab && onNavigateTab(stepItem.action_tab)}
                className="w-full py-1.5 rounded-lg bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
