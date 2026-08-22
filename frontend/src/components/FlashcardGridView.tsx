import React, { useState } from 'react';
import { BookOpen, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { VocabularyItem } from '../api/vocabulary';
import { speakText } from '../utils/tts';

interface FlashcardGridViewProps {
  vocabList: VocabularyItem[];
}

const ITEMS_PER_PAGE = 30;

/**
 * Responsive grid list rendering vocabulary catalog with audio pronunciation buttons and clean pagination.
 */
export const FlashcardGridView: React.FC<FlashcardGridViewProps> = ({ vocabList }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(vocabList.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedList = vocabList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-extrabold text-theme-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-theme-accent" />
          Tất Cả Từ Vựng Trích Xuất ({vocabList.length})
        </h2>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-theme-secondary px-2">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedList.map((vocabItem) => (
          <div key={vocabItem.id} className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-2 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-theme-accent">{vocabItem.word}</span>
              <button
                onClick={() => speakText(vocabItem.word)}
                className="p-1.5 rounded-md hover:bg-theme-surface-2 text-theme-secondary hover:text-theme-accent transition cursor-pointer"
                title="Phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-theme-secondary font-mono">{vocabItem.ipa} • {vocabItem.part_of_speech}</p>
            <p className="text-sm font-semibold text-theme-success">{vocabItem.meaning_vi}</p>
            {vocabItem.example_sentence && (
              <p className="text-xs text-theme-primary italic border-l-2 border-theme-accent pl-2 line-clamp-2">
                "{vocabItem.example_sentence}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
