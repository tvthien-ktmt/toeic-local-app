import React from 'react';
import { Sparkles, Headphones, BookOpen, ArrowRight } from 'lucide-react';

interface FullToeicPreTestModalProps {
  examMode: 'EXAM_MODE' | 'PRACTICE_MODE';
  onSelectExamMode: (mode: 'EXAM_MODE' | 'PRACTICE_MODE') => void;
  onStartExam: () => void;
  onCancel: () => void;
}

/**
 * Pre-test instructions and mode selector for Full 2-Skill TOEIC Simulation.
 */
export const FullToeicPreTestModal: React.FC<FullToeicPreTestModalProps> = ({
  examMode,
  onSelectExamMode,
  onStartExam,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-theme-accent/15 text-theme-accent flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-theme-primary">
            Quy Chế Phòng Thi TOEIC 2 Kỹ Năng (200 Câu)
          </h2>
          <p className="text-xs text-theme-secondary">
            Đúng chuẩn cấu trúc bài thi chính thức của Viện Khảo thí Giáo dục Hoa Kỳ (ETS)
          </p>
        </div>

        {/* Structure Summary Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-theme-surface-2 border border-theme space-y-1">
            <div className="flex items-center gap-1.5 text-theme-accent font-bold">
              <Headphones className="w-4 h-4" />
              <span>Section 1: Listening</span>
            </div>
            <p className="text-theme-secondary font-medium">100 câu &bull; 45 phút</p>
            <p className="text-[11px] text-theme-secondary">Part 1, 2, 3, 4 (Audio tự động)</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface-2 border border-theme space-y-1">
            <div className="flex items-center gap-1.5 text-theme-warning font-bold">
              <BookOpen className="w-4 h-4" />
              <span>Section 2: Reading</span>
            </div>
            <p className="text-theme-secondary font-medium">100 câu &bull; 75 phút</p>
            <p className="text-[11px] text-theme-secondary">Part 5, 6, 7 (Tự do điều hướng)</p>
          </div>
        </div>

        {/* Mode Choice */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
            Chọn Chế Độ Thi:
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSelectExamMode('EXAM_MODE')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                examMode === 'EXAM_MODE'
                  ? 'border-theme-warning bg-theme-warning/10 ring-2 ring-theme-warning'
                  : 'border-theme bg-theme-surface hover:bg-theme-surface-2'
              }`}
            >
              <span className="font-bold text-xs text-theme-primary flex items-center gap-1">
                <span>Chế Độ Thi Thật</span>
              </span>
              <p className="text-[11px] text-theme-secondary leading-snug">
                Không pause, không tua, tính điểm chuẩn 10-990.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectExamMode('PRACTICE_MODE')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                examMode === 'PRACTICE_MODE'
                  ? 'border-theme-accent bg-theme-accent/10 ring-2 ring-theme-accent'
                  : 'border-theme bg-theme-surface hover:bg-theme-surface-2'
              }`}
            >
              <span className="font-bold text-xs text-theme-primary flex items-center gap-1">
                <span>Chế Độ Luyện Tập</span>
              </span>
              <p className="text-[11px] text-theme-secondary leading-snug">
                Tra từ điển, xem gợi ý và ghi chú trực tiếp.
              </p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={onStartExam}
            className="flex-2 py-3 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bắt Đầu Phần Thi Listening (45 Phút)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
