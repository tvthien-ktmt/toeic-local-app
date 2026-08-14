import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Check, Square, FileText, Mail, MessageSquare, Globe, Calendar, Megaphone, Receipt, Newspaper } from 'lucide-react';

interface MarkdownPassageProps {
  text: string;
  className?: string;
}

/**
 * Detects document type and returns appropriate badge & icon.
 */
function getDocumentTypeInfo(typeText: string) {
  const lower = typeText.toLowerCase();
  if (lower.includes('e-mail') || lower.includes('email')) return { label: 'E-MAIL', icon: Mail, color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/30' };
  if (lower.includes('chat') || lower.includes('discussion') || lower.includes('message')) return { label: 'ONLINE CHAT', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (lower.includes('web') || lower.includes('page') || lower.includes('website')) return { label: 'WEB PAGE', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/30' };
  if (lower.includes('notice') || lower.includes('announcement')) return { label: 'NOTICE', icon: Megaphone, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
  if (lower.includes('article') || lower.includes('report') || lower.includes('review')) return { label: 'ARTICLE', icon: Newspaper, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' };
  if (lower.includes('schedule') || lower.includes('calendar') || lower.includes('timetable')) return { label: 'SCHEDULE', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30' };
  if (lower.includes('form') || lower.includes('invoice') || lower.includes('receipt') || lower.includes('order')) return { label: 'FORM / RECEIPT', icon: Receipt, color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/30' };
  return { label: 'DOCUMENT', icon: FileText, color: 'text-theme-accent', bg: 'bg-theme-accent/10 border-theme-accent/30' };
}

/**
 * Pre-processes TOEIC text to ensure raw markdown checkboxes, tables, email headers,
 * and sentence insertion markers [1], [2], [3], [4], [131] render beautifully as rich HTML.
 */
export function preprocessToeicMarkdown(text: string): string {
  if (!text) return '';
  let processed = text;

  // Replace raw single-line [x] or [ ] with markdown task list item syntax if not formatted as a list
  processed = processed.replace(/^(?!\s*[-*+])\s*\[([xX\s])\]\s+(.*)$/gm, '- [$1] $2');

  // Format Email / Memo headers (From:, To:, Date:, Subject:)
  processed = processed.replace(/^(From|To|Date|Subject|Re|Cc|Sent|Header):\s*(.*)$/gmi, '<div class="flex items-start gap-2 py-0.5 text-xs"><strong class="w-16 shrink-0 text-theme-secondary font-bold uppercase tracking-wider">$1:</strong><span class="text-theme-primary font-medium">$2</span></div>');

  // Format online chat lines: [9:30 AM] John Smith: message
  processed = processed.replace(/^\[?(\d{1,2}:\d{2}\s*(?:AM|PM)?)\]?\s+([A-Za-z\s\.\-]+):\s+(.*)$/gmi, 
    '<div class="my-1.5 p-2 rounded-xl bg-theme-surface-2/60 border border-theme/40 text-xs"><span class="font-bold text-theme-accent mr-2">$2</span><span class="text-[10px] text-theme-secondary opacity-75 mr-2">($1)</span><span class="text-theme-primary">$3</span></div>'
  );

  // Ensure table markdown formatting has blank lines around it so GFM parses it
  processed = processed.replace(/([^\n])\n(\|[^\n]+\|)/g, '$1\n\n$2');

  return processed;
}

export const MarkdownPassage: React.FC<MarkdownPassageProps> = ({ text, className }) => {
  if (!text) return null;

  // Check if text contains a passage header: "Questions XXX-XXX refer to the following..."
  const passageHeaderMatch = text.match(/^\s*(?:\*\*)?Questions?\s+(\d{3})[\s\-–]+(\d{3})\s+refer\s+to\s+the\s+following\s+([^.\n*]+)[\.\*]?\s*(?:\*\*)?\s*([\s\S]*)$/i);

  if (passageHeaderMatch) {
    const [, qStart, qEnd, docType, bodyText] = passageHeaderMatch;
    const typeInfo = getDocumentTypeInfo(docType);
    const Icon = typeInfo.icon;

    // Check if bodyText has a question split at the end (e.g. "\n\n147. What is...")
    const qSplitMatch = bodyText.match(/^([\s\S]*?)(?:\n\n(?=(?:\d{3}|33)\.\s+.*))/);
    const passageContent = qSplitMatch ? qSplitMatch[1] : bodyText;
    const questionContent = qSplitMatch ? bodyText.substring(qSplitMatch[1].length).trim() : '';

    const cleanPassage = preprocessToeicMarkdown(passageContent);
    const cleanQuestion = preprocessToeicMarkdown(questionContent);

    return (
      <div className={`space-y-4 select-text ${className || ''}`}>
        {/* TOEIC Reading Document Card (Styled authentic HTML paper view) */}
        <div className="rounded-2xl bg-theme-surface-2/70 border border-theme/80 shadow-md overflow-hidden">
          {/* Document Type Header Bar */}
          <div className="bg-theme-surface-2 px-4 py-2.5 border-b border-theme flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border uppercase tracking-wider ${typeInfo.bg} ${typeInfo.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {typeInfo.label}
              </span>
              <span className="text-xs font-semibold text-theme-secondary">
                Questions {qStart}–{qEnd}
              </span>
            </div>
            <span className="text-[11px] text-theme-secondary italic">
              Đọc đoạn văn dưới đây để trả lời câu hỏi
            </span>
          </div>

          {/* Passage Content Body */}
          <div className="p-4 sm:p-6 leading-relaxed text-xs sm:text-sm text-theme-primary space-y-3 font-sans">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customMarkdownComponents}
            >
              {cleanPassage}
            </ReactMarkdown>
          </div>
        </div>

        {/* Question Prompt Item (if attached) */}
        {cleanQuestion && (
          <div className="pt-2 text-xs sm:text-sm font-semibold text-theme-primary leading-relaxed border-t border-theme/50">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customMarkdownComponents}
            >
              {cleanQuestion}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  // Standard Part 5 or single passage text
  const cleanText = preprocessToeicMarkdown(text);

  return (
    <div className={`markdown-passage text-theme-primary leading-relaxed select-text ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={customMarkdownComponents}
      >
        {cleanText}
      </ReactMarkdown>
    </div>
  );
};

const customMarkdownComponents = {
  // Styled Tables for Part 6 / 7 forms, receipts, schedules
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-theme shadow-sm bg-theme-surface/60">
      <table className="min-w-full divide-y divide-theme text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-theme-surface-2 text-theme-primary font-bold">{children}</thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-theme/40 bg-theme-surface/50">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-theme-surface-2/60 transition-colors">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left font-bold text-theme-primary uppercase text-[11px] tracking-wider border-b border-theme">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 text-theme-primary text-xs font-medium border-b border-theme/30">
      {children}
    </td>
  ),

  // Custom GFM Task List Checkboxes ([x] / [ ])
  input: ({ type, checked }: any) => {
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
  p: ({ children }: any) => {
    return (
      <p className="mb-2 leading-relaxed text-xs sm:text-sm text-theme-primary">
        {React.Children.map(children, (child) => {
          if (typeof child === 'string') {
            // Match sentence insertion markers like [1], [2], [3], [4] or [___131___] or ------- [131]
            const parts = child.split(/(\-{2,}\s*\[\d+\]|\[___\d+___\]|\[\d+\])/g);
            if (parts.length > 1) {
              return parts.map((part, pIdx) => {
                if (/^(\-{2,}\s*\[\d+\]|\[___\d+___\]|\[\d+\])$/.test(part)) {
                  const num = part.replace(/[^\d]/g, '');
                  return (
                    <span
                      key={pIdx}
                      className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md alert-warning border border-theme-warning/40 font-mono text-[11px] font-extrabold text-theme-warning shadow-sm"
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
  ul: ({ children }: any) => <ul className="list-disc list-inside space-y-1 my-2 pl-2 text-xs sm:text-sm text-theme-primary">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-1 my-2 pl-2 text-xs sm:text-sm text-theme-primary">{children}</ol>,
  li: ({ children }: any) => <li className="text-theme-primary leading-relaxed">{children}</li>,

  // Headers
  h1: ({ children }: any) => <h1 className="text-sm sm:text-base font-extrabold text-theme-primary mt-3 mb-1.5 border-b border-theme pb-1">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xs sm:text-sm font-bold text-theme-primary mt-2.5 mb-1 text-theme-accent">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xs font-bold text-theme-primary mt-2 mb-1">{children}</h3>,

  // Blockquotes (Email & Memo cards)
  blockquote: ({ children }: any) => (
    <blockquote className="my-2.5 p-3 rounded-xl bg-theme-surface border-l-4 border-l-theme-accent border border-theme text-xs text-theme-primary space-y-1 shadow-sm">
      {children}
    </blockquote>
  ),

  // Code blocks & Horizontal Dividers
  code: ({ children }: any) => (
    <code className="px-1.5 py-0.5 rounded bg-theme-surface-2 border border-theme font-mono text-xs text-theme-accent">
      {children}
    </code>
  ),
  hr: () => <hr className="border-theme/40 my-3" />,
};
