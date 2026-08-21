import React from 'react';
import { InlineRenderer } from './InlineRenderer';
import type { ContentBlock } from '../../../types/toeicContent';

interface BlockRendererProps {
  block: ContentBlock;
  userAnswers?: Record<number, string>;
  activeQuestionNumber?: number;
  onSelectBlank?: (questionNumber: number) => void;
}

/**
 * Universal block renderer translating semantic content blocks into accessible React UI components.
 */
export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  userAnswers,
  activeQuestionNumber,
  onSelectBlank,
}) => {
  if (block.type === 'heading') {
    return (
      <h3 className="text-base sm:text-lg font-bold text-theme-primary tracking-tight mt-2 mb-2 pb-1 border-b border-theme/40">
        <InlineRenderer
          nodes={block.children}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      </h3>
    );
  }

  if (block.type === 'subheading') {
    return (
      <h4 className="text-sm sm:text-base font-semibold text-theme-primary/90 mt-2 mb-1">
        <InlineRenderer
          nodes={block.children}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      </h4>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <p className="text-sm text-theme-primary leading-relaxed my-2 text-justify">
        <InlineRenderer
          nodes={block.children}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      </p>
    );
  }

  if (block.type === 'list' && block.items) {
    return (
      <ul className="my-2 pl-5 space-y-1.5 list-disc text-sm text-theme-primary">
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>
            <InlineRenderer
              nodes={item.children}
              userAnswers={userAnswers}
              activeQuestionNumber={activeQuestionNumber}
              onSelectBlank={onSelectBlank}
            />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'table' && block.headers && block.rows) {
    return (
      <div className="my-4 overflow-x-auto rounded-xl border border-theme bg-theme-surface shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-surface-2 border-b border-theme text-theme-primary font-bold">
              {block.headers.map((hdr, hIndex) => (
                <th key={hIndex} className="px-3 py-2 border-r border-theme last:border-r-0">
                  {hdr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme/60 text-theme-secondary">
            {block.rows.map((row, rIndex) => (
              <tr key={rIndex} className="hover:bg-theme-surface-2/40 transition-colors">
                {row.map((cell, cIndex) => (
                  <td key={cIndex} className="px-3 py-2 border-r border-theme/60 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === 'signature') {
    return (
      <div className="my-3 pt-2 text-sm text-theme-primary font-medium italic border-t border-theme/30 whitespace-pre-line">
        <InlineRenderer
          nodes={block.children}
          userAnswers={userAnswers}
          activeQuestionNumber={activeQuestionNumber}
          onSelectBlank={onSelectBlank}
        />
      </div>
    );
  }

  if (block.type === 'divider') {
    return <hr className="my-4 border-t border-theme/60" />;
  }

  return (
    <div className="text-sm text-theme-primary my-1">
      <InlineRenderer
        nodes={block.children}
        userAnswers={userAnswers}
        activeQuestionNumber={activeQuestionNumber}
        onSelectBlank={onSelectBlank}
      />
    </div>
  );
};
