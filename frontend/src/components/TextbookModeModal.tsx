import React from 'react';
import { BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import type { TestItem } from '../api/documents';

interface TextbookModeModalProps {
  selectedTest: TestItem;
  onConfirmStart: (mode: 'full_exam' | 'practice') => void;
  onClose: () => void;
}

/**
 * Modal dialog for selecting exam mode (75-minute full timed test vs untimed self-paced practice).
 */
export const TextbookModeModal: React.FC<TextbookModeModalProps> = ({
  selectedTest,
  onConfirmStart,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-theme-accent/20 border border-theme-accent/30 text-theme-accent flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-theme-primary">
            {selectedTest.filename.replace(/^\[.*?\]\s*/, '')}
          </h3>
          <p className="text-xs text-theme-secondary">
            Vui lòng chọn chế độ thi phù hợp với nhu cầu ôn tập của bạn
          </p>
        </div>

        {/* Mode Cards */}
        <div className="space-y-3">
          {/* Mode 1: Full Exam 75m */}
          <div
            onClick={() => onConfirmStart('full_exam')}
            className="group cursor-pointer p-4 rounded-xl alert-warning border border-theme-warning/40 hover:border-theme-warning transition-all duration-200 flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-theme-warning/20 text-theme-warning flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-bold text-theme-warning">Thi Thật RC (75 Phút)</h4>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-theme-warning text-white rounded">Khuyên Dùng</span>
              </div>
              <p className="text-xs text-theme-secondary leading-relaxed">
                Có đồng hồ đếm ngược 75:00. Tự động nộp bài khi hết giờ và tính điểm TOEIC RC chuẩn (5-495 điểm).
              </p>
            </div>
          </div>

          {/* Mode 2: Unlimited Practice */}
          <div
            onClick={() => onConfirmStart('practice')}
            className="group cursor-pointer p-4 rounded-xl alert-success border border-theme-success/40 hover:border-theme-success transition-all duration-200 flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-theme-success/20 text-theme-success flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-theme-success mb-0.5">Luyện Tập Tự Do (Không Giới Hạn)</h4>
              <p className="text-xs text-theme-secondary leading-relaxed">
                Không giới hạn thời gian. Xem ngay đáp án, giải thích chi tiết và bản dịch Tiếng Việt từng câu.
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
        >
          Hủy Bỏ
        </button>
      </div>
    </div>
  );
};
