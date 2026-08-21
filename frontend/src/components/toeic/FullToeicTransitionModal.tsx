import React from 'react';
import { CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';

interface FullToeicTransitionModalProps {
  onStartReading: () => void;
}

/**
 * Section transition modal when Section 1 (Listening) completes and Section 2 (Reading) begins.
 */
export const FullToeicTransitionModal: React.FC<FullToeicTransitionModalProps> = ({
  onStartReading,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in text-center">
        <div className="w-14 h-14 rounded-2xl bg-theme-success/15 text-theme-success flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-theme-primary">
            Đã Hoàn Thành Phần Thi Listening!
          </h3>
          <p className="text-xs text-theme-secondary leading-relaxed">
            Bạn đã hoàn thành 100 câu Listening (Part 1 - 4). Tiếp theo bạn sẽ có <strong>75 phút</strong> để làm 100 câu Reading (Part 5 - 7).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface-2 border border-theme text-left text-xs space-y-2">
          <div className="font-bold text-theme-primary flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-theme-warning" />
            <span>Chiến thuật làm bài Reading:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-theme-secondary text-[11px]">
            <li>Part 5 &amp; 6: Cố gắng hoàn thành trong tối đa 20 - 25 phút.</li>
            <li>Part 7: Dành 50 - 55 phút để đọc kỹ các bài đọc đôi/ba.</li>
            <li>Sử dụng thanh Palette bên phải để đánh dấu câu cần xem lại.</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onStartReading}
          className="w-full py-3.5 rounded-2xl bg-theme-warning text-white font-black text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Bắt Đầu Phần Thi Reading (75 Phút)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
