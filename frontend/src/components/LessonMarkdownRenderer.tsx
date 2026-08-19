import React from 'react';
import { ZoomIn } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface LessonMarkdownRendererProps {
  content: string;
  onImageClick?: (url: string) => void;
}

/**
 * Rich markdown content renderer tailored for lesson theories with zoomable textbook mindmaps and callout styling.
 */
export const LessonMarkdownRenderer: React.FC<LessonMarkdownRendererProps> = ({
  content,
  onImageClick,
}) => {
  return (
    <div className="markdown-body text-theme-primary leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-black text-theme-primary mt-8 mb-4 border-b-2 border-theme-accent pb-2 tracking-tight flex items-center gap-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary mt-7 mb-3 border-b border-theme/60 pb-2 tracking-tight text-theme-accent">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-bold text-theme-primary mt-6 mb-2.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold text-theme-primary mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-sm sm:text-base leading-relaxed text-theme-primary mb-3.5">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 mb-4 pl-2 text-sm sm:text-base text-theme-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-2 text-sm sm:text-base text-theme-primary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-sm sm:text-base text-theme-primary">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-theme-accent bg-theme-surface-2/60 italic my-4 p-4 rounded-r-xl text-theme-primary text-sm shadow-sm">
              {children}
            </blockquote>
          ),
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
            <th className="px-3.5 py-2.5 text-left font-bold text-theme-primary uppercase text-[11px] tracking-wider border-b border-theme">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-theme-primary text-xs sm:text-sm font-medium border-b border-theme/30">
              {children}
            </td>
          ),
          hr: () => <hr className="my-6 border-theme/60" />,
          code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
            inline ? (
              <code className="bg-theme-surface-2 px-1.5 py-0.5 rounded text-xs font-mono text-theme-accent border border-theme">
                {children}
              </code>
            ) : (
              <pre className="bg-theme-surface-2 p-4 rounded-xl text-xs font-mono overflow-x-auto my-3 border border-theme text-theme-primary shadow-inner">
                <code>{children}</code>
              </pre>
            ),
          img: ({ src, alt }: { src?: string; alt?: string }) => (
            <div className="my-4 text-center cursor-pointer group inline-block w-full">
              <img 
                src={src} 
                alt={alt || 'Visual Guide'} 
                onClick={() => onImageClick && src && onImageClick(src)}
                className="max-w-full rounded-xl border border-theme shadow-lg transition-transform duration-300 group-hover:scale-[1.02] max-h-[500px] object-contain mx-auto"
              />
              <p className="text-xs text-theme-secondary mt-1.5 font-medium flex items-center justify-center gap-1">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Bấm vào hình để phóng to</span>
              </p>
            </div>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
