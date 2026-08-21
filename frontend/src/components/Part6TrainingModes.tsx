import React from 'react';
import { AlignLeft, FileText, Layers } from 'lucide-react';

export type Part6DisplayMode = 'local' | 'context' | 'full_text';

interface Part6TrainingModesProps {
  activeMode: Part6DisplayMode;
  onChangeMode: (mode: Part6DisplayMode) => void;
}

/**
 * Switcher toolbar for Part 6 training modes (Local, Context, Full Text) according to RC_Format.md Section 17.
 */
export const Part6TrainingModes: React.FC<Part6TrainingModesProps> = ({
  activeMode,
  onChangeMode,
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-theme-surface border border-theme flex-wrap gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-bold text-theme-primary flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-theme-accent" />
          Chế Độ Luyện Part 6 (Mục 17):
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChangeMode('local')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'local'
              ? 'bg-theme-accent text-white shadow-sm'
              : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>1. Local (Câu chứa Blank)</span>
        </button>

        <button
          onClick={() => onChangeMode('context')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'context'
              ? 'bg-theme-accent text-white shadow-sm'
              : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>2. Context (Đoạn Văn)</span>
        </button>

        <button
          onClick={() => onChangeMode('full_text')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'full_text'
              ? 'bg-theme-accent text-white shadow-sm'
              : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Full Text (Toàn Bộ Bài)</span>
        </button>
      </div>
    </div>
  );
};
