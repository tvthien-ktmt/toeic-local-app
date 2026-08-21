import React from 'react';
import { RotateCcw, Volume2, CheckCircle2 } from 'lucide-react';
import type { LCErrorNotebookItem } from '../../../types/toeicListening';

interface LcErrorRetestModalProps {
  item: LCErrorNotebookItem | null;
  onClose: () => void;
  onAdvanceSrs: (id: string) => void;
}

/**
 * Retest modal for reviewing mistaken questions with TTS audio and SRS interval advancement.
 */
export const LcErrorRetestModal: React.FC<LcErrorRetestModalProps> = ({
  item,
  onClose,
  onAdvanceSrs,
}) => {
  if (!item) {
    return null;
  }

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-theme/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-theme-accent/15 text-theme-accent">
              <RotateCcw className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-theme-primary">
                Ôn Tập Câu Sai: Part {item.part} &bull; Câu {item.questionNumber}
              </h3>
              <p className="text-[11px] text-theme-secondary">
                Lặp lại ngắt quãng SRS Level {item.srsLevel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-theme-secondary hover:text-theme-primary cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* Audio Simulation Button */}
        <div className="p-4 rounded-2xl bg-theme-surface-2 border border-theme flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-theme-primary">
              Nghe Lại Câu Hỏi &amp; Đoạn Hội Thoại:
            </p>
            <p className="text-[11px] text-theme-secondary">
              Nhấp nút bên cạnh để phát âm chuẩn
            </p>
          </div>
          <button
            onClick={() => handleSpeak(item.transcriptExcerpt || item.questionStem)}
            className="p-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Phát Audio</span>
          </button>
        </div>

        {/* Question & Explanation Recap */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-theme-surface-2 border border-theme">
            <p className="font-semibold text-theme-primary">{item.questionStem}</p>
          </div>
          <div className="p-3 rounded-xl bg-theme-success/10 border border-theme-success/30 text-theme-primary">
            <p className="font-bold text-theme-success">Đáp án chuẩn:</p>
            <p>{item.correctOption}</p>
          </div>
          <div className="p-3 rounded-xl bg-theme-surface-2 border border-theme text-theme-secondary">
            <p className="font-bold text-theme-primary">Lý do giải thích:</p>
            <p className="mt-0.5">{item.explanation}</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-2 pt-2 border-t border-theme/50">
          <button
            onClick={() => onAdvanceSrs(item.id)}
            className="px-4 py-2.5 rounded-xl bg-theme-success text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã Hiểu &amp; Tăng Cấp SRS (Nhắc lại sau 7 ngày)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
