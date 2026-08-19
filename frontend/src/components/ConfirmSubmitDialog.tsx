import React from 'react';
import { AlertTriangle, XCircle, Flag, CheckCircle2 } from 'lucide-react';

interface ConfirmSubmitDialogProps {
  unansweredCount: number;
  flaggedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal prompt displaying unanswered and flagged question counts prior to exam submission.
 */
export const ConfirmSubmitDialog: React.FC<ConfirmSubmitDialogProps> = ({
  unansweredCount,
  flaggedCount,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-theme-surface border border-theme-warning/40 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl alert-warning border border-theme-warning/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-theme-warning" />
          </div>
          <div>
            <h3 className="font-bold text-base text-theme-primary">Xác Nhận Nộp Bài</h3>
            <p className="text-xs text-theme-secondary mt-0.5">Hành động này không thể hoàn tác</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {unansweredCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl alert-error border border-theme-error/20">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{unansweredCount} câu chưa trả lời</strong> — sẽ tính là bỏ trống (0 điểm)
              </span>
            </div>
          )}
          {flaggedCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl alert-warning border border-theme-warning/20">
              <Flag className="w-4 h-4 shrink-0" />
              <span>
                <strong>{flaggedCount} câu đã đánh dấu</strong> cần xem lại — bạn có muốn xem lại trước không?
              </span>
            </div>
          )}
          {unansweredCount === 0 && flaggedCount === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl alert-success border border-theme-success/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Bạn đã trả lời đầy đủ tất cả câu hỏi. Sẵn sàng nộp bài!</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
          >
            Quay Lại Làm Tiếp
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-theme-success text-white font-bold text-xs shadow-lg transition-all hover:opacity-90"
          >
            Nộp Bài Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
