import React, { useState } from 'react';
import {
  BookMarked,
  RotateCcw,
  Headphones,
  Home,
} from 'lucide-react';
import type { LCErrorNotebookItem } from '../types/toeicListening';
import { LcErrorCard } from '../components/toeic/listening/LcErrorCard';
import { LcErrorRetestModal } from '../components/toeic/listening/LcErrorRetestModal';

interface LcErrorNotebookPageProps {
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Dedicated TOEIC Listening Error Notebook Page with Spaced Repetition (SRS).
 * Stores real wrong questions from exams or practice attempts.
 */
export const LcErrorNotebookPage: React.FC<LcErrorNotebookPageProps> = ({
  onNavigateHome,
  onNavigateCatalog,
}) => {
  const [errorsList, setErrorsList] = useState<LCErrorNotebookItem[]>([]);
  const [filterPart, setFilterPart] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [filterTrap, setFilterTrap] = useState<string>('ALL');
  const [activeRetestItem, setActiveRetestItem] = useState<LCErrorNotebookItem | null>(null);

  const filteredErrors = errorsList.filter((item) => {
    if (filterPart !== 'ALL' && item.part !== filterPart) {
      return false;
    }
    if (filterTrap !== 'ALL' && item.trapType !== filterTrap) {
      return false;
    }

    return true;
  });

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAdvanceSrs = (id: string) => {
    setErrorsList((previous) =>
      previous.map((err) =>
        err.id === id
          ? {
              ...err,
              srsLevel: Math.min(5, err.srsLevel + 1),
              nextReviewDate: 'Sau 3 ngày',
            }
          : err
      )
    );
    setActiveRetestItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-theme/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-error/15 text-theme-error text-xs font-bold mb-2">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Sổ Tay Lỗi Sai TOEIC Listening (SRS Error Bank)</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
            Kho Lưu Trữ &amp; Ôn Lại Lỗi Sai Lặp Lại Ngắt Quãng
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Mỗi câu làm sai trong bài thi LC sẽ được tự động phân loại cạm bẫy và lên lịch ôn tập sau 1 &rarr; 3 &rarr; 7 &rarr; 14 ngày.
          </p>
        </div>

        {/* Quick Review Action */}
        {filteredErrors.length > 0 && (
          <button
            onClick={() => {
              if (filteredErrors.length > 0) {
                setActiveRetestItem(filteredErrors[0]);
              }
            }}
            className="px-5 py-3 rounded-2xl bg-theme-error text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ôn Tập Toàn Bộ Câu Đến Hạn ({filteredErrors.length})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-theme-surface border border-theme">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-theme-secondary mr-2">Lọc theo Part:</span>
          {(['ALL', 1, 2, 3, 4] as const).map((partOption) => (
            <button
              key={partOption}
              onClick={() => setFilterPart(partOption)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterPart === partOption
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
              }`}
            >
              {partOption === 'ALL' ? 'Tất Cả Parts' : `Part ${partOption}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-theme-secondary">Bẫy:</span>
          <select
            value={filterTrap}
            onChange={(event) => setFilterTrap(event.target.value)}
            className="px-3 py-1.5 rounded-xl bg-theme-surface-2 text-theme-primary border border-theme text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả loại bẫy</option>
            <option value="KEYWORD_REPETITION">Bẫy lặp lại từ trong câu hỏi</option>
            <option value="SIMILAR_SOUND">Bẫy từ phát âm tương tự</option>
            <option value="INCORRECT_INFERENCE">Bẫy suy luận không có căn cứ</option>
            <option value="SPEED_OVERLOAD">Mất nhịp do tốc độ nhanh</option>
          </select>
        </div>
      </div>

      {/* Mistake Items Grid or Empty State */}
      {filteredErrors.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-surface border border-theme space-y-5 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-theme-accent/10 text-theme-accent flex items-center justify-center mx-auto">
            <BookMarked className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-theme-primary">Chưa có câu sai nào trong Sổ tay lỗi LC</h4>
            <p className="text-xs text-theme-secondary leading-relaxed">
              Mọi câu trả lời sai khi làm bài thi hoặc luyện tập sẽ tự động được lưu trữ tại đây kèm cạm bẫy và lịch ôn tập Spaced Repetition.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {onNavigateCatalog && (
              <button
                onClick={onNavigateCatalog}
                className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Headphones className="w-4 h-4" />
                <span>Đến Kho Đề Thi LC</span>
              </button>
            )}

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 rounded-xl border border-theme text-xs font-bold text-theme-secondary hover:bg-theme-surface-2 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Trở Về Trang Chủ</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredErrors.map((item) => (
            <LcErrorCard
              key={item.id}
              item={item}
              onSpeak={handleSpeak}
              onRetest={(retestItem) => setActiveRetestItem(retestItem)}
            />
          ))}
        </div>
      )}

      {/* Retest Modal Popup */}
      <LcErrorRetestModal
        item={activeRetestItem}
        onClose={() => setActiveRetestItem(null)}
        onAdvanceSrs={handleAdvanceSrs}
      />
    </div>
  );
};
