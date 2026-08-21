import React from 'react';
import { Globe, Lock } from 'lucide-react';
import { BlockRenderer } from '../content/BlockRenderer';
import type { DocumentData } from '../../../types/toeicContent';

interface WebPageRendererProps {
  document: DocumentData;
  userAnswers?: Record<number, string>;
  activeQuestionNumber?: number;
  onSelectBlank?: (questionNumber: number) => void;
}

/**
 * Authentic Web Page renderer with browser URL bar, navigation links, and styled web content.
 */
export const WebPageRenderer: React.FC<WebPageRendererProps> = ({
  document,
  userAnswers,
  activeQuestionNumber,
  onSelectBlank,
}) => {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-theme-surface shadow-md overflow-hidden my-3">
      {/* Mock Browser Top Navigation Bar */}
      <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-80" />
        </div>

        {/* Browser URL Input Box */}
        <div className="flex-1 max-w-md mx-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-theme-surface border border-theme text-xs text-theme-secondary">
          <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="font-mono text-[11px] truncate">
            https://www.{document.title ? document.title.toLowerCase().replace(/[^a-z0-9]/g, '') : 'example'}.com
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500 text-white">
          <Globe className="w-3 h-3" /> WEB
        </span>
      </div>

      {/* Web Page Content */}
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
