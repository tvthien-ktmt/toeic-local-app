import React from 'react';
import { Clock, ArrowLeft, Home } from 'lucide-react';
import type { LCExamDocument } from '../../../types/toeicListening';

interface LcExamNotReadyStateProps {
  examDocument: LCExamDocument;
  onBack: () => void;
  onNavigateHome?: () => void;
}

/**
 * Clean informative placeholder screen displayed when an exam document's questions are still being prepared.
 */
export const LcExamNotReadyState: React.FC<LcExamNotReadyStateProps> = ({
  examDocument,
  onBack,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen bg-theme-base flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-md w-full bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-theme-warning/15 text-theme-warning flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-theme-warning/15 text-theme-warning border border-theme-warning/30">
            Đang Cập Nhật Dữ Liệu
          </span>
          <h2 className="text-xl font-extrabold text-theme-primary">
            {examDocument.title}
          </h2>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
            Đề thi này hiện đang được cập nhật câu hỏi 4 Part và file nghe bản xứ.
            Vui lòng quay lại sau hoặc chọn đề thi khác từ kho đề!
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onBack}
            className="w-full py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở Về Kho Đề LC</span>
          </button>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 rounded-2xl border border-theme text-xs font-bold text-theme-secondary hover:bg-theme-surface-2 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Trở Về Trang Chủ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
