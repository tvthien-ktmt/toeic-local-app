import React from 'react';
import { Clock, Home, Headphones } from 'lucide-react';

interface LcFeatureUpdatingCardProps {
  title: string;
  description: string;
  badge?: string;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Reusable placeholder and status screen displayed when listening exercise data is being updated.
 */
export const LcFeatureUpdatingCard: React.FC<LcFeatureUpdatingCardProps> = ({
  title,
  description,
  badge = 'Tính Năng Đang Cập Nhật',
  onNavigateHome,
  onNavigateCatalog,
}) => {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-theme-surface border border-theme max-w-xl mx-auto space-y-6 shadow-sm animate-fade-in">
      <div className="w-16 h-16 rounded-3xl bg-theme-accent/15 text-theme-accent flex items-center justify-center mx-auto shadow-inner">
        <Clock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-theme-warning/15 text-theme-warning border border-theme-warning/30">
          {badge}
        </span>
        <h3 className="text-xl font-extrabold text-theme-primary">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Trở Về Trang Chủ</span>
          </button>
        )}

        {onNavigateCatalog && (
          <button
            onClick={onNavigateCatalog}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-theme text-xs font-bold text-theme-secondary hover:bg-theme-surface-2 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Headphones className="w-4 h-4" />
            <span>Đến Kho Đề Thi LC</span>
          </button>
        )}
      </div>
    </div>
  );
};
