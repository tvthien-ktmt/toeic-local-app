import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface LcDashboardTodayPlanSectionProps {
  onNavigateTab?: (tab: string) => void;
}

/**
 * 4-step daily study action plan for TOEIC Listening dashboard.
 */
export const LcDashboardTodayPlanSection: React.FC<LcDashboardTodayPlanSectionProps> = ({
  onNavigateTab,
}) => {
  return (
    <div className="lg:col-span-7 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-theme-accent" />
          <span>Kế Hoạch Luyện Tập Hôm Nay (45 Phút)</span>
        </h3>
        <span className="text-xs text-theme-secondary font-medium">4 Nhiệm Vụ Trọng Tâm</span>
      </div>

      <div className="space-y-3">
        {/* Task 1 */}
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme flex items-center justify-between gap-3 hover:border-theme-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center font-bold text-xs">
              15m
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-theme-primary">
                Luyện Bẫy Part 2 — Câu Hỏi Gián Tiếp &amp; Tránh Bẫy Lặp Từ
              </h4>
              <p className="text-[11px] text-theme-secondary">
                15 câu hỏi phản xạ nhanh
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('lc_practice')}
            className="p-2 rounded-xl bg-theme-surface-2 border border-theme hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
            title="Bắt đầu luyện tập"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Task 2 */}
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme flex items-center justify-between gap-3 hover:border-theme-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-theme-warning/15 text-theme-warning flex items-center justify-center font-bold text-xs">
              15m
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-theme-primary">
                Chiến Thuật Part 3 — Câu Hỏi Suy Luận &amp; Hành Động Tiếp Theo
              </h4>
              <p className="text-[11px] text-theme-secondary">
                3 đoạn hội thoại thực tế
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('lc_practice')}
            className="p-2 rounded-xl bg-theme-surface-2 border border-theme hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
            title="Bắt đầu luyện tập"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Task 3 */}
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme flex items-center justify-between gap-3 hover:border-theme-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-theme-success/15 text-theme-success flex items-center justify-center font-bold text-xs">
              10m
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-theme-primary">
                Chép Chính Tả — Dictation Bắt Âm Nối
              </h4>
              <p className="text-[11px] text-theme-secondary">
                5 câu trình độ Intermediate
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('lc_practice')}
            className="p-2 rounded-xl bg-theme-surface-2 border border-theme hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
            title="Bắt đầu luyện tập"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Task 4 */}
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme flex items-center justify-between gap-3 hover:border-theme-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-theme-error/15 text-theme-error flex items-center justify-center font-bold text-xs">
              5m
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-theme-primary">
                Sổ Tay Lỗi Sai — Ôn Lại 8 Câu Sai Theo SRS
              </h4>
              <p className="text-[11px] text-theme-secondary">
                Lặp lại ngắt quãng để ghi nhớ cạm bẫy
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('lc_errors')}
            className="p-2 rounded-xl bg-theme-surface-2 border border-theme hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
            title="Mở sổ tay lỗi sai"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
