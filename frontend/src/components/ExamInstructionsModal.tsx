import React from 'react';
import { ShieldAlert, CheckCircle2, Flag, ArrowRight, X, Sparkles } from 'lucide-react';
import type { TestItem } from '../api/documents';

interface ExamInstructionsModalProps {
  test: TestItem;
  mode: 'full_exam' | 'practice';
  onStartTest: () => void;
  onClose: () => void;
}

/**
 * Official Exam Instructions Modal displayed prior to entering the 75-minute real exam room (Module III).
 */
export const ExamInstructionsModal: React.FC<ExamInstructionsModalProps> = ({
  test,
  mode,
  onStartTest,
  onClose,
}) => {
  const isFullExam = mode === 'full_exam';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-theme pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-theme-accent text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> QUY CHẾ PHÒNG THI CHUẨN TOEIC RC
            </div>
            <h2 className="text-xl font-black text-theme-primary">
              {test.filename.replace(/^\[.*?\]\s*/, '')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-theme-surface-2 text-theme-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Structure Badges */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-theme-surface-2 border border-theme">
            <span className="text-[11px] text-theme-secondary font-medium">Cấu Trúc</span>
            <div className="text-sm font-black text-theme-primary mt-0.5">100 Câu Hỏi</div>
          </div>
          <div className="p-3 rounded-2xl bg-theme-surface-2 border border-theme">
            <span className="text-[11px] text-theme-secondary font-medium">Thời Gian</span>
            <div className="text-sm font-black text-theme-warning mt-0.5">
              {isFullExam ? '75 Phút' : 'Tự Do'}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-theme-surface-2 border border-theme">
            <span className="text-[11px] text-theme-secondary font-medium">Thang Điểm</span>
            <div className="text-sm font-black text-theme-success mt-0.5">5 - 495 RC</div>
          </div>
        </div>

        {/* Exam Rules List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-theme-secondary tracking-wider">
            Các Lưu Ý Quan Trọng Trong Khi Thi:
          </h3>

          <div className="space-y-2.5 text-xs text-theme-primary">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-theme-surface-2 border border-theme">
              <CheckCircle2 className="w-4 h-4 text-theme-success shrink-0 mt-0.5" />
              <div>
                <strong>Cấu trúc chuẩn 3 phần:</strong> Part 5 (30 câu từ loại/ngữ pháp), Part 6 (16 câu điền đoạn văn), Part 7 (54 câu đọc hiểu đơn & đoạn kép).
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-theme-surface-2 border border-theme">
              <Flag className="w-4 h-4 text-theme-warning shrink-0 mt-0.5" />
              <div>
                <strong>Điều hướng & Đánh dấu:</strong> Bạn có thể quay lại câu trước bất kỳ lúc nào và sử dụng tính năng <span className="text-theme-warning font-bold">Đánh dấu (Flag)</span> để xem lại câu chưa chắc chắn.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-theme-surface-2 border border-theme">
              <ShieldAlert className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
              <div>
                <strong>Tuyệt đối không hiển thị đáp án trong khi thi:</strong> Hệ thống tự động lưu nháp đáp án để bảo toàn bài thi khi gặp sự cố mạng hoặc tải lại trang.
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="space-y-2 pt-2 border-t border-theme">
          <button
            onClick={onStartTest}
            className="w-full py-3.5 rounded-2xl bg-theme-accent hover:bg-theme-accent-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition cursor-pointer"
          >
            <span>BẮT ĐẦU LÀM BÀI (START TEST)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-theme-secondary hover:text-theme-primary transition"
          >
            Quay Lại Danh Mục
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructionsModal;
