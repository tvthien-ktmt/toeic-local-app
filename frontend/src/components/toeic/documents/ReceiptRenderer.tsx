import React from 'react';
import { Receipt } from 'lucide-react';
import { BlockRenderer } from '../content/BlockRenderer';
import type { DocumentData } from '../../../types/toeicContent';

interface ReceiptRendererProps {
  document: DocumentData;
}

/**
 * Realistic Receipt / Invoice document renderer with receipt border styling and line items.
 */
export const ReceiptRenderer: React.FC<ReceiptRendererProps> = ({ document }) => {
  return (
    <div className="rounded-2xl border-2 border-dashed border-teal-500/40 bg-theme-surface shadow-md overflow-hidden my-3 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="bg-teal-500/10 border-b border-teal-500/20 px-4 py-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-teal-500 text-white shadow-xs">
          <Receipt className="w-3.5 h-3.5" /> RECEIPT / INVOICE
        </span>
        {document.title && (
          <span className="text-xs font-bold text-theme-primary">{document.title}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 space-y-3 font-mono text-xs sm:text-sm">
        {document.blocks.map((block, index) => (
          <BlockRenderer key={index} block={block} />
        ))}
      </div>
    </div>
  );
};
