import React, { useState } from 'react';
import { Radio, BookOpen, Volume2, Search } from 'lucide-react';
import type { Part4TalkData, LCTranscriptWord } from '../../../types/toeicListening';
import { Part4QuestionItemCard } from './Part4QuestionItemCard';

interface Part4TalkRendererProps {
  talk: Part4TalkData;
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  isExamMode?: boolean;
  isSubmitted?: boolean;
  activeTranscriptLineId?: string | null;
  onSelectOption: (questionNumber: number, optionKey: 'A' | 'B' | 'C' | 'D') => void;
  onToggleFlag?: (questionNumber: number) => void;
  onAskAi?: (questionNumber: number) => void;
  onSeekToTimestamp?: (seconds: number) => void;
}

/**
 * Dedicated renderer for TOEIC Part 4 Short Talks.
 * Displays 3 questions, talk metadata (Announcement, Tour, Advertisement), transcript sync, and vocabulary lookup.
 */
export const Part4TalkRenderer: React.FC<Part4TalkRendererProps> = ({
  talk,
  userAnswers,
  flaggedQuestions,
  isExamMode = false,
  isSubmitted = false,
  activeTranscriptLineId,
  onSelectOption,
  onToggleFlag,
  onAskAi,
  onSeekToTimestamp,
}) => {
  const [isShowTranscript, setIsShowTranscript] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<LCTranscriptWord | null>(null);

  const getTalkTypeLabel = (type: string): string => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'Thông báo nội bộ / Nơi công cộng';
      case 'ADVERTISEMENT':
        return 'Quảng cáo thương mại';
      case 'TELEPHONE_MESSAGE':
        return 'Tin nhắn thoại ghi âm';
      case 'TOUR_PUBLIC_INFO':
        return 'Hướng dẫn tham quan / Du lịch';
      case 'WORKPLACE_PRESENTATION':
        return 'Thuyết trình / Báo cáo công việc';
      case 'NEWS_BROADCAST':
        return 'Bản tin thời sự / Thời tiết / Giao thông';
      case 'INSTRUCTIONS':
        return 'Hướng dẫn quy trình sử dụng';
      default:
        return 'Bài nói ngắn';
    }
  };

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 sm:p-6 shadow-sm transition-colors space-y-6">
      {/* Top Banner: Talk Header & Type */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-theme/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-theme-warning/15 text-theme-warning font-bold text-xs flex items-center justify-center">
            Q{talk.startQuestionNumber}-{talk.endQuestionNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-theme-primary">
                Part 4 &bull; {talk.title}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-theme-warning/15 text-theme-warning border border-theme-warning/30 flex items-center gap-1">
                <Radio className="w-3 h-3" />
                <span>{getTalkTypeLabel(talk.talkType)}</span>
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary">
              Người nói: {talk.speaker} &bull; Lắng nghe bài nói và hoàn thành 3 câu hỏi bên dưới
            </p>
          </div>
        </div>

        {/* Practice Mode Transcript Switcher */}
        {(!isExamMode || isSubmitted) && (
          <button
            onClick={() => setIsShowTranscript(!isShowTranscript)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme hover:bg-theme-surface-2 text-xs font-medium text-theme-accent transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isShowTranscript ? 'Ẩn Transcript' : 'Xem Transcript & Từ Vựng'}</span>
          </button>
        )}
      </div>

      {/* Visual Question Graphics (Images or Tables) */}
      {(talk.graphicImageUrl || talk.questions?.find((subQuestionItem) => subQuestionItem.graphicImageUrl)?.graphicImageUrl) && (
        <div className="flex justify-center p-3 bg-theme-surface-2 rounded-2xl border border-theme">
          <img
            src={talk.graphicImageUrl || talk.questions?.find((subQuestionItem) => subQuestionItem.graphicImageUrl)?.graphicImageUrl}
            alt="Talk Graphic Diagram"
            className="max-h-72 rounded-xl object-contain shadow-xs"
            loading="lazy"
          />
        </div>
      )}

      {(talk.graphicHtml || talk.questions?.find((subQuestionItem) => subQuestionItem.graphicHtml)?.graphicHtml) && (
        <div
          className="p-4 bg-theme-surface-2 rounded-2xl border border-theme overflow-x-auto text-xs text-theme-primary"
          dangerouslySetInnerHTML={{
            __html: (talk.graphicHtml || talk.questions?.find((subQuestionItem) => subQuestionItem.graphicHtml)?.graphicHtml) || '',
          }}
        />
      )}

      {/* Synchronized Transcript Viewer (Visible in Practice or Review Mode) */}
      {isShowTranscript && (
        <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-theme-primary flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-theme-accent" />
              <span>Transcript Đồng Bộ Bài Nói:</span>
            </h5>
            <span className="text-[10px] text-theme-secondary">
              Nhấp vào câu để tua tới đoạn tương ứng
            </span>
          </div>

          <div className="space-y-2.5">
            {talk.transcript.map((line) => {
              const isActive = activeTranscriptLineId === line.id;

              return (
                <div
                  key={line.id}
                  onClick={() => onSeekToTimestamp && onSeekToTimestamp(line.startTimeSeconds)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-theme-accent/15 border-theme-accent/40 shadow-xs'
                      : 'bg-theme-surface border-transparent hover:border-theme'
                  }`}
                >
                  <p className="text-xs text-theme-primary leading-relaxed flex flex-wrap gap-x-1 gap-y-0.5">
                    {(line.textEn || '').split(' ').map((word, wordIndex) => {
                      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                      const matchedWord = talk.vocabularyList?.find(
                        (interactiveWord) => interactiveWord.word.toLowerCase() === cleanWord
                      );

                      if (matchedWord) {
                        return (
                          <span
                            key={wordIndex}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedWord(matchedWord);
                            }}
                            className="underline decoration-theme-accent decoration-2 underline-offset-2 font-semibold text-theme-accent hover:text-theme-accent-hover cursor-pointer"
                            title={`Nhấp tra từ: ${matchedWord.meaningVi}`}
                          >
                            {word}
                          </span>
                        );
                      }

                      return <span key={wordIndex}>{word}</span>;
                    })}
                  </p>

                  {line.textVi && (
                    <p className="text-[11px] text-theme-secondary mt-1 pt-1 border-t border-theme/30 italic">
                      {line.textVi}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Dictionary Popup Card */}
          {selectedWord && (
            <div className="p-3 rounded-xl bg-theme-surface border border-theme-accent/50 shadow-md text-xs space-y-1 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-theme-accent flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  {selectedWord.word} <span className="text-xs font-normal text-theme-secondary">[{selectedWord.ipa}]</span>
                </span>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-[10px] font-bold text-theme-secondary hover:text-theme-primary cursor-pointer"
                >
                  Đóng
                </button>
              </div>
              <p className="font-medium text-theme-primary">{selectedWord.meaningVi}</p>
              {selectedWord.collocations && selectedWord.collocations.length > 0 && (
                <div className="text-[11px] text-theme-secondary">
                  <strong>Cụm từ TOEIC:</strong> {selectedWord.collocations.join(' • ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3 Questions Set */}
      <div className="space-y-6">
        {talk.questions.map((subQ) => (
          <Part4QuestionItemCard
            key={subQ.id}
            questionItem={subQ}
            selectedAnswer={userAnswers[subQ.questionNumber]}
            isFlagged={!!flaggedQuestions[subQ.questionNumber]}
            isExamMode={isExamMode}
            isSubmitted={isSubmitted}
            onSelectOption={onSelectOption}
            onToggleFlag={onToggleFlag}
            onAskAi={onAskAi}
          />
        ))}
      </div>
    </div>
  );
};
