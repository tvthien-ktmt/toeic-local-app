import React from 'react';

export type PaletteFilterType = 'ALL' | 'ANSWERED' | 'UNANSWERED' | 'FLAGGED';

interface FullToeicPaletteSidebarProps {
  startQ: number;
  endQ: number;
  currentQuestionNumber: number;
  filteredQuestions: number[];
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  paletteFilter: PaletteFilterType;
  onSetPaletteFilter: (filter: PaletteFilterType) => void;
  onSelectQuestion: (questionNumber: number) => void;
}

/**
 * Responsive 100-question matrix palette sidebar for Full 2-Skill TOEIC test navigation.
 */
export const FullToeicPaletteSidebar: React.FC<FullToeicPaletteSidebarProps> = ({
  startQ,
  endQ,
  currentQuestionNumber,
  filteredQuestions,
  userAnswers,
  flaggedQuestions,
  paletteFilter,
  onSetPaletteFilter,
  onSelectQuestion,
}) => {
  const answeredCount = Object.keys(userAnswers).filter(
    (keyString) => Number(keyString) >= startQ && Number(keyString) <= endQ
  ).length;

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-theme-primary">
          Question Palette ({startQ} - {endQ})
        </span>
        <span className="text-[11px] text-theme-secondary">
          Đã làm {answeredCount}/{endQ - startQ + 1}
        </span>
      </div>

      {/* Palette Filters */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-theme-surface-2 rounded-xl border border-theme text-[10px]">
        {(['ALL', 'ANSWERED', 'UNANSWERED', 'FLAGGED'] as const).map((filterOption) => (
          <button
            key={filterOption}
            type="button"
            onClick={() => onSetPaletteFilter(filterOption)}
            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              paletteFilter === filterOption
                ? 'bg-theme-accent text-white shadow-xs'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {filterOption === 'ALL'
              ? 'Tất cả'
              : filterOption === 'ANSWERED'
              ? 'Đã làm'
              : filterOption === 'UNANSWERED'
              ? 'Chưa làm'
              : 'Đánh dấu'}
          </button>
        ))}
      </div>

      {/* 100 Question Number Grid */}
      <div className="grid grid-cols-5 gap-1.5 max-h-80 overflow-y-auto p-1">
        {filteredQuestions.map((qNum) => {
          const isCurrent = currentQuestionNumber === qNum;
          const isAnswered = Boolean(userAnswers[qNum]);
          const isFlagged = Boolean(flaggedQuestions[qNum]);

          return (
            <button
              key={qNum}
              type="button"
              onClick={() => onSelectQuestion(qNum)}
              className={`h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer relative ${
                isCurrent ? 'ring-2 ring-theme-accent shadow-xs' : ''
              } ${
                isAnswered
                  ? 'bg-theme-accent text-white font-black'
                  : 'bg-theme-surface-2 border border-theme text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <span>{qNum}</span>
              {isFlagged && (
                <span className="w-1.5 h-1.5 rounded-full bg-theme-warning absolute top-1 right-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
