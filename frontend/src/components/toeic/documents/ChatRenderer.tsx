import React from 'react';
import { MessageSquare } from 'lucide-react';
import { InlineRenderer } from '../content/InlineRenderer';
import type { DocumentData } from '../../../types/toeicContent';

interface ChatRendererProps {
  document: DocumentData;
}

/**
 * Authentic online chat discussion renderer with chat bubbles and speaker timeline.
 */
export const ChatRenderer: React.FC<ChatRendererProps> = ({ document }) => {
  const chatBlock = document.blocks.find((blockItem) => blockItem.type === 'chat_dialog');
  const messages = chatBlock?.messages || [];

  // Group distinct speakers to assign consistent pastel badges
  const speakers = Array.from(new Set(messages.map((messageItem) => messageItem.speaker)));
  const getSpeakerColor = (speaker: string) => {
    const speakerIndex = speakers.indexOf(speaker);
    if (speakerIndex % 3 === 0) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (speakerIndex % 3 === 1) return 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30';

    return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-theme-surface shadow-md overflow-hidden my-3">
      {/* Top Header */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
          <MessageSquare className="w-3.5 h-3.5" /> ONLINE CHAT DISCUSSION
        </span>
        {document.title && (
          <span className="text-xs font-bold text-theme-primary">{document.title}</span>
        )}
      </div>

      {/* Message Stream */}
      <div className="p-4 sm:p-5 space-y-3.5 bg-theme-surface">
        {messages.map((msg, index) => {
          const colorClass = getSpeakerColor(msg.speaker);

          return (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${colorClass}`}>
                  {msg.speaker}
                </span>
                {msg.time && (
                  <span className="text-[10px] text-theme-secondary opacity-75 font-mono">
                    {msg.time}
                  </span>
                )}
              </div>
              <div className="p-3 rounded-2xl bg-theme-surface-2/60 border border-theme/40 text-sm text-theme-primary leading-relaxed">
                <InlineRenderer nodes={msg.children} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
