import React from 'react';
import { BookMarked, RotateCcw } from 'lucide-react';
import type { ErrorNotebookResponse } from '../api/errorNotebook';

interface ErrorNotebookHeaderProps {
  data: ErrorNotebookResponse | null;
  isLoading: boolean;
  onStartRetestSession: () => void;
}

/**
 * Header banner and quick summary card for the Error Notebook page.
 */
export const ErrorNotebookHeader: React.FC<ErrorNotebookHeaderProps> = ({
  data,
  isLoading,
  onStartRetestSession,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-theme-surface p-6 sm:p-8 border border-theme shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-theme-accent text-xs font-bold uppercase tracking-wider">
            <BookMarked className="w-4 h-4" /> SỔ TAY LỖI SAI THÔNG MINH (ERROR NOTEBOOK)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary">
            Tập Hợp & Khắc Phục Câu Sai
          </h1>
          <p className="text-theme-secondary text-xs sm:text-sm max-w-xl leading-relaxed">
            Tự động gom lại tất cả các câu trả lời sai từ <strong className="text-theme-primary">Luyện tập dạng bài</strong> và <strong className="text-theme-primary">Đề thi thử 75 phút</strong>. Luyện lại cho tới khi đạt chuẩn <span className="text-theme-success font-bold">Mastered</span>!
          </p>
        </div>

        {/* Action Card */}
        <div className="flex flex-col gap-3 bg-theme-surface-2 p-5 rounded-2xl border border-theme shrink-0 min-w-[240px]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-theme-secondary font-medium">Tổng câu sai ghi nhận:</span>
            <span className="font-extrabold text-theme-error text-sm">{data?.total_mistakes || 0}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-theme-secondary font-medium">Đã khắc phục (Mastered):</span>
            <span className="font-extrabold text-theme-success text-sm">{data?.mastered_count || 0}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-theme-secondary font-medium">Cần làm lại:</span>
            <span className="font-extrabold text-theme-warning text-sm">{data?.needs_review_count || 0}</span>
          </div>

          <button
            onClick={onStartRetestSession}
            disabled={isLoading || !data || data.needs_review_count === 0}
            className="mt-2 w-full py-2.5 px-4 rounded-xl bg-theme-accent hover:bg-theme-accent-hover disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ôn Lại Câu Sai Ngay (Retest)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
