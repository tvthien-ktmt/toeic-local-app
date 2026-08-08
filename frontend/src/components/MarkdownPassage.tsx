import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Square } from 'lucide-react';

interface MarkdownPassageProps {
  text: string;
  className?: string;
}

/**
 * Pre-processes TOEIC text to ensure raw markdown checkboxes, tables, email headers,
 * and sentence insertion markers [1], [2], [3], [4], [131] render beautifully.
 */
export function preprocessToeicMarkdown(text: string): string {
  if (!text) return '';
  let processed = text;

  // Replace raw single-line [x] or [ ] with markdown task list item syntax if not formatted as a list
  processed = processed.replace(/^(?!\s*[-*+])\s*\[([xX\s])\]\s+(.*)$/gm, '- [$1] $2');

  // Format Email / Memo headers (From:, To:, Date:, Subject:)
  processed = processed.replace(/^(From|To|Date|Subject|Re|Cc|Sent|Header):\s*(.*)$/gmi, '**$1:** $2  ');

  // Ensure table markdown formatting has blank lines around it so GFM parses it
  processed = processed.replace(/([^\n])\n(\|[^\n]+\|)/g, '$1\n\n$2');

  return processed;
}

export const MarkdownPassage: React.FC<MarkdownPassageProps> = ({ text, className }) => {
  const cleanText = preprocessToeicMarkdown(text);

  return (
    <div className={`markdown-passage text-theme-primary leading-relaxed select-text ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Styled Tables for Part 6 / 7 forms, receipts, schedules
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-theme shadow-sm bg-theme-surface-2/40">
              <table className="min-w-full divide-y divide-theme text-xs sm:text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-theme-surface-2 text-theme-primary font-bold">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-theme/40 bg-theme-surface/50">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-theme-surface-2/60 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2 text-left font-bold text-theme-primary uppercase text-[11px] tracking-wider border-b border-theme">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-theme-primary text-xs sm:text-sm font-medium border-b border-theme/30">
              {children}
            </td>
          ),

          // Custom GFM Task List Checkboxes ([x] / [ ])
          input: ({ type, checked }) => {
            if (type === 'checkbox') {
              return (
                <span className="inline-flex items-center align-middle mr-1.5 -mt-0.5">
                  {checked ? (
                    <span className="w-4 h-4 rounded alert-success border border-theme-success flex items-center justify-center text-theme-success font-extrabold shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded bg-theme-surface-2 border border-theme flex items-center justify-center text-theme-secondary opacity-70">
                      <Square className="w-3 h-3 text-transparent" />
                    </span>
                  )}
                </span>
              );
            }
            return null;
          },

          // Paragraphs & Inline Insertion Marker Highlighting ([1], [2], [3], [4], [131])
          p: ({ children }) => {
            return (
              <p className="mb-2.5 leading-relaxed text-xs sm:text-sm text-theme-primary">
                {React.Children.map(children, (child) => {
                  if (typeof child === 'string') {
                    // Match sentence insertion markers like [1], [2], [3], [4] or ------- [131]
                    const parts = child.split(/(\-{2,}\s*\[\d+\]|\[\d+\])/g);
                    if (parts.length > 1) {
                      return parts.map((part, pIdx) => {
                        if (/^(\-{2,}\s*\[\d+\]|\[\d+\])$/.test(part)) {
                          const num = part.replace(/[^\d]/g, '');
                          return (
                            <span
                              key={pIdx}
                              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg alert-warning border border-theme-warning/40 font-mono text-[11px] font-extrabold text-theme-warning shadow-sm"
                              title={`Vị trí chèn câu [${num}]`}
                            >
                               [{num}]
                            </span>
                          );
                        }
                        return part;
                      });
                    }
                  }
                  return child;
                })}
              </p>
            );
          },

          // Lists
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pl-2 text-xs sm:text-sm text-theme-primary">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-2 text-xs sm:text-sm text-theme-primary">{children}</ol>,
          li: ({ children }) => <li className="text-theme-primary leading-relaxed">{children}</li>,

          // Headers
          h1: ({ children }) => <h1 className="text-base sm:text-lg font-bold text-theme-primary mt-3 mb-1.5 border-b border-theme pb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm sm:text-base font-bold text-theme-primary mt-2.5 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs sm:text-sm font-bold text-theme-primary mt-2 mb-1">{children}</h3>,

          // Blockquotes (Email & Memo cards)
          blockquote: ({ children }) => (
            <blockquote className="my-3 p-3 sm:p-4 rounded-xl bg-theme-surface-2 border-l-4 border-l-theme-accent border border-theme text-xs sm:text-sm text-theme-primary space-y-1 shadow-sm">
              {children}
            </blockquote>
          ),

          // Code blocks & Horizontal Dividers
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-theme-surface-2 border border-theme font-mono text-xs text-theme-accent">
              {children}
            </code>
          ),
          hr: () => <hr className="border-theme/40 my-3" />,
        }}
      >
        {cleanText}
      </ReactMarkdown>
    </div>
  );
};
