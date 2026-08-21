import React from 'react';
import { Tag } from 'lucide-react';
import { BlockRenderer } from '../content/BlockRenderer';
import type { DocumentData } from '../../../types/toeicContent';

interface AdvertisementRendererProps {
  document: DocumentData;
  userAnswers?: Record<number, string>;
  activeQuestionNumber?: number;
  onSelectBlank?: (questionNumber: number) => void;
}

/**
 * Advertisement / Promotional document renderer.
 */
export const AdvertisementRenderer: React.FC<AdvertisementRendererProps> = ({
  document,
  userAnswers,
  activeQuestionNumber,
  onSelectBlank,
}) => {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-theme-surface shadow-md overflow-hidden my-3">
      {/* Top Header */}
      <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
          <Tag className="w-3.5 h-3.5" /> ADVERTISEMENT
        </span>
        {document.title && (
          <span className="text-xs font-bold text-theme-primary">{document.title}</span>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-6 space-y-3 bg-theme-surface">
        {document.blocks.map((block, index) => (
          <BlockRenderer
            key={index}
            block={block}
            userAnswers={userAnswers}
            activeQuestionNumber={activeQuestionNumber}
            onSelectBlank={onSelectBlank}
          />
        ))}
      </div>
    </div>
  );
};
