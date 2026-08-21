import React from 'react';
import { Mail, Paperclip } from 'lucide-react';
import { BlockRenderer } from '../content/BlockRenderer';
import type { DocumentData, EmailMetadata } from '../../../types/toeicContent';

interface EmailRendererProps {
  document: DocumentData;
  userAnswers?: Record<number, string>;
  activeQuestionNumber?: number;
  onSelectBlank?: (questionNumber: number) => void;
}

/**
 * Authentic Email document renderer with metadata header bar and formatted body blocks.
 */
export const EmailRenderer: React.FC<EmailRendererProps> = ({
  document,
  userAnswers,
  activeQuestionNumber,
  onSelectBlank,
}) => {
  // Find email metadata block if exists
  const metaBlock = document.blocks.find((blockItem) => blockItem.type === 'metadata');
  const meta = (metaBlock?.data || {}) as EmailMetadata;
  const contentBlocks = document.blocks.filter((blockItem) => blockItem.type !== 'metadata');

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-theme-surface shadow-md overflow-hidden my-3">
      {/* Email Top Header */}
      <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-sky-500/15">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-sky-500 text-white shadow-xs">
            <Mail className="w-3.5 h-3.5" /> E-MAIL
          </span>
          {document.title && (
            <span className="text-xs font-bold text-theme-primary truncate">{document.title}</span>
          )}
        </div>

        {meta.from && (
          <div className="flex text-xs">
            <span className="w-16 shrink-0 font-bold text-theme-secondary uppercase">From:</span>
            <span className="font-semibold text-theme-primary">{meta.from}</span>
          </div>
        )}
        {meta.to && (
          <div className="flex text-xs">
            <span className="w-16 shrink-0 font-bold text-theme-secondary uppercase">To:</span>
            <span className="text-theme-primary">{meta.to}</span>
          </div>
        )}
        {meta.date && (
          <div className="flex text-xs">
            <span className="w-16 shrink-0 font-bold text-theme-secondary uppercase">Date:</span>
            <span className="text-theme-secondary">{meta.date}</span>
          </div>
        )}
        {meta.subject && (
          <div className="flex text-xs pt-1 border-t border-sky-500/10 font-semibold">
            <span className="w-16 shrink-0 font-bold text-theme-secondary uppercase">Subject:</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold">{meta.subject}</span>
          </div>
        )}
        {meta.attachments && meta.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-theme-secondary pt-1">
            <Paperclip className="w-3 h-3 text-sky-500" />
            <span className="font-bold">Attachments:</span>
            <span>{meta.attachments.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Email Body */}
      <div className="p-4 sm:p-5 space-y-3 bg-theme-surface">
        {contentBlocks.map((block, index) => (
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
