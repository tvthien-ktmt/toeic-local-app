import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { BookOpen, Volume2 } from 'lucide-react';
import type { VocabularyItem } from '../api/vocabulary';
import { speakText } from '../utils/tts';

interface FlashcardGridViewProps {
  vocabList: VocabularyItem[];
}

/**
 * Virtualized grid list rendering the full vocabulary vocabulary catalog with audio pronunciation buttons.
 */
export const FlashcardGridView: React.FC<FlashcardGridViewProps> = ({ vocabList }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-theme-primary flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-theme-accent" />
        Tất Cả Từ Vựng Trích Xuất ({vocabList.length})
      </h2>

      {vocabList.length > 100 ? (
        <List
          height={650}
          itemCount={vocabList.length}
          itemSize={160}
          width="100%"
        >
          {({ index, style }: { index: number; style: React.CSSProperties }) => {
            const vocabItem = vocabList[index];

            return (
              <div style={style} className="pr-2 pb-3">
                <div className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-2 shadow-lg h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-theme-accent">{vocabItem.word}</span>
                    <button
                      onClick={() => speakText(vocabItem.word)}
                      className="p-1 text-theme-secondary hover:text-theme-accent transition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-theme-secondary font-mono">
                    {vocabItem.ipa} • {vocabItem.part_of_speech}
                  </p>
                  <p className="text-sm font-semibold text-theme-success">{vocabItem.meaning_vi}</p>
                  {vocabItem.example_sentence && (
                    <p className="text-xs text-theme-primary italic border-l-2 border-theme-accent pl-2 truncate">
                      "{vocabItem.example_sentence}"
                    </p>
                  )}
                </div>
              </div>
            );
          }}
        </List>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabList.map((vocabItem) => (
            <div key={vocabItem.id} className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-theme-accent">{vocabItem.word}</span>
                <button
                  onClick={() => speakText(vocabItem.word)}
                  className="p-1 text-theme-secondary hover:text-theme-accent transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-theme-secondary font-mono">{vocabItem.ipa} • {vocabItem.part_of_speech}</p>
              <p className="text-sm font-semibold text-theme-success">{vocabItem.meaning_vi}</p>
              {vocabItem.example_sentence && (
                <p className="text-xs text-theme-primary italic border-l-2 border-theme-accent pl-2">
                  "{vocabItem.example_sentence}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
