import React from 'react';

interface BlankRendererProps {
  questionNumber?: number;
  selectedAnswer?: string;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Interactive semantic blank component for Part 6 text completion.
 */
export const BlankRenderer: React.FC<BlankRendererProps> = ({
  questionNumber,
  selectedAnswer,
  isActive = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 mx-1.5 px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold transition-all border shadow-sm ${
        isActive
          ? 'bg-theme-accent text-white border-theme-accent ring-2 ring-theme-accent/30 scale-105'
          : selectedAnswer
          ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/40 hover:bg-theme-accent/25'
          : 'bg-theme-surface-2 text-theme-secondary border-theme hover:border-theme-accent/50'
      }`}
      title={questionNumber ? `Chuyển tới câu hỏi ${questionNumber}` : 'Chỗ trống cần điền'}
    >
      <span className="opacity-80">[{questionNumber || '---'}]</span>
      {selectedAnswer ? (
        <span className="px-1.5 py-0.2 rounded bg-theme-accent text-white font-extrabold text-[11px]">
          {selectedAnswer}
        </span>
      ) : (
        <span className="tracking-widest text-[10px] opacity-60">____</span>
      )}
    </button>
  );
};
