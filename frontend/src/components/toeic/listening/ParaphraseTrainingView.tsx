import React, { useState } from 'react';
import { ArrowRightLeft, Volume2, CheckCircle2 } from 'lucide-react';
import type { LCParaphraseItem } from '../../../types/toeicListening';
import { MOCK_LC_PARAPHRASE_ITEMS } from '../../../data/sampleLcData';
import { LcFeatureUpdatingCard } from './LcFeatureUpdatingCard';

interface ParaphraseTrainingViewProps {
  onComplete?: () => void;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Dedicated TOEIC Paraphrase Training Module.
 * Teaches high-frequency phrase equivalence patterns used in Part 3 and Part 4.
 */
export const ParaphraseTrainingView: React.FC<ParaphraseTrainingViewProps> = ({
  onNavigateHome,
  onNavigateCatalog,
}) => {
  const [selectedItem, setSelectedItem] = useState<LCParaphraseItem | undefined>(MOCK_LC_PARAPHRASE_ITEMS[0]);
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  const handleToggleReveal = (id: number) => {
    setRevealedIds((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const handlePlayAudio = (phrase: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (MOCK_LC_PARAPHRASE_ITEMS.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-theme-accent" />
              <span>Cặp Từ Paraphrase Tần Suất Cao</span>
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1">
              Học các cách diễn đạt tương đương giữa Audio nói và Đáp án viết trong đề thi.
            </p>
          </div>
        </div>

        <LcFeatureUpdatingCard
          title="Luyện Bắt Cặp Từ Paraphrase (Đồng Nghĩa)"
          description="Dữ liệu các cặp từ paraphrase tần suất cao trong Part 3 & Part 4 đang được trích xuất từ các bộ đề ETS 2024 và Hacker."
          badge="Tính Năng Đang Cập Nhật Dữ Liệu"
          onNavigateHome={onNavigateHome}
          onNavigateCatalog={onNavigateCatalog}
        />
      </div>
    );
  }

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 sm:p-7 shadow-sm transition-colors space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-theme/50 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-theme-primary flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-theme-accent" />
            <span>Luyện Cặp Từ Paraphrase Tần Suất Cao Trong TOEIC</span>
          </h3>
          <p className="text-xs text-theme-secondary mt-0.5">
            TOEIC Listening luôn đổi từ trong audio sang từ đồng nghĩa trong câu hỏi/đáp án
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-theme-surface-2 border border-theme text-xs font-bold text-theme-accent">
          {MOCK_LC_PARAPHRASE_ITEMS.length} Cặp Trọng Tâm
        </span>
      </div>

      {/* Grid of Paraphrase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_LC_PARAPHRASE_ITEMS.map((item) => {
          const isRevealed = !!revealedIds[item.id];
          const isSelected = selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-theme-accent bg-theme-accent/5 shadow-xs'
                  : 'border-theme bg-theme-surface hover:bg-theme-surface-2'
              }`}
            >
              {/* Card Header: Topic badge */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-theme-surface-2 border border-theme text-theme-secondary">
                  {item.topic}
                </span>
                <span className="text-[10px] text-theme-secondary">Xuất hiện: {item.frequency || 'Cao'}</span>
              </div>

              {/* Spoken phrase vs Written phrase */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-theme-surface border border-theme">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-theme-accent text-white">
                      Audio
                    </span>
                    <span className="font-bold text-theme-primary">{item.spokenPhrase}</span>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePlayAudio(item.spokenPhrase);
                    }}
                    className="p-1 rounded-md text-theme-secondary hover:text-theme-primary cursor-pointer"
                    title="Nghe audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-theme-surface-2 border border-theme">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-theme-success text-white">
                      Đề Thi
                    </span>
                    <span className="font-bold text-theme-primary">{item.paraphrasedInAnswer}</span>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-theme-success" />
                </div>
              </div>

              {/* Reveal Explanation Drawer */}
              <div className="pt-2 border-t border-theme/40 text-xs">
                {isRevealed ? (
                  <div className="space-y-1 text-theme-secondary animate-fade-in">
                    <p className="font-semibold text-theme-primary">Ví dụ trong ngữ cảnh:</p>
                    <p className="italic">"{item.exampleContext}"</p>
                    <p className="text-[11px] text-theme-secondary">{item.vietnameseMeaning}</p>
                  </div>
                ) : (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleReveal(item.id);
                    }}
                    className="text-xs text-theme-accent font-semibold hover:underline cursor-pointer"
                  >
                    Xem câu ví dụ &amp; ngữ cảnh...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
