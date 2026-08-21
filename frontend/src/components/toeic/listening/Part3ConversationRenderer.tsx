import React, { useState } from 'react';
import { Users, BookOpen, Volume2, Search } from 'lucide-react';
import type { Part3ConversationData, LCTranscriptWord } from '../../../types/toeicListening';
import { Part3QuestionItemCard } from './Part3QuestionItemCard';

interface Part3ConversationRendererProps {
  conversation: Part3ConversationData;
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
 * Dedicated renderer for TOEIC Part 3 Conversations.
 * Displays 3 questions, multi-speaker dialogue header, interactive transcript sync, and paraphrase mappings.
 */
export const Part3ConversationRenderer: React.FC<Part3ConversationRendererProps> = ({
  conversation,
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

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 sm:p-6 shadow-sm transition-colors space-y-6">
      {/* Top Banner: Conversation Header & Speakers */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-theme/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-theme-accent/15 text-theme-accent font-bold text-xs flex items-center justify-center">
            Q{conversation.startQuestionNumber}-{conversation.endQuestionNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-theme-primary">
                Part 3 &bull; Hội thoại ngắn ({conversation.topic})
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-theme-surface-2 border border-theme text-theme-secondary flex items-center gap-1">
                <Users className="w-3 h-3 text-theme-accent" />
                <span>{conversation.speakers.join(' & ')}</span>
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary">
              Lắng nghe đoạn hội thoại và trả lời 3 câu hỏi liên tiếp bên dưới
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
      {(conversation.graphicImageUrl || conversation.questions?.find((subQuestionItem) => subQuestionItem.graphicImageUrl)?.graphicImageUrl) && (
        <div className="flex justify-center p-3 bg-theme-surface-2 rounded-2xl border border-theme">
          <img
            src={conversation.graphicImageUrl || conversation.questions?.find((subQuestionItem) => subQuestionItem.graphicImageUrl)?.graphicImageUrl}
            alt="Conversation Graphic Diagram"
            className="max-h-72 rounded-xl object-contain shadow-xs"
            loading="lazy"
          />
        </div>
      )}

      {(conversation.graphicHtml || conversation.questions?.find((subQuestionItem) => subQuestionItem.graphicHtml)?.graphicHtml) && (
        <div
          className="p-4 bg-theme-surface-2 rounded-2xl border border-theme overflow-x-auto text-xs text-theme-primary"
          dangerouslySetInnerHTML={{
            __html: (conversation.graphicHtml || conversation.questions?.find((subQuestionItem) => subQuestionItem.graphicHtml)?.graphicHtml) || '',
          }}
        />
      )}

      {/* Synchronized Transcript Viewer (Visible in Practice or Review Mode) */}
      {isShowTranscript && (
        <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-theme-primary flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-theme-accent" />
              <span>Transcript Đồng Bộ (Nhấp câu để nghe lại):</span>
            </h5>
            <span className="text-[10px] text-theme-secondary">
              Nhấp vào từ để tra từ điển nhanh
            </span>
          </div>

          <div className="space-y-2.5">
            {conversation.transcript.map((line) => {
              const isActive = activeTranscriptLineId === line.id;

              return (
                <div
                  key={line.id}
                  onClick={() => onSeekToTimestamp && onSeekToTimestamp(line.startTimeSeconds)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'border-theme-accent bg-theme-accent/15 shadow-sm'
                      : 'border-theme/40 bg-theme-surface hover:border-theme'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-theme-accent uppercase">
                      {line.speaker}:
                    </span>
                    <span className="text-[10px] text-theme-secondary font-mono">
                      {Math.floor(line.startTimeSeconds)}s - {Math.floor(line.endTimeSeconds)}s
                    </span>
                  </div>

                  <p className="text-xs text-theme-primary leading-relaxed flex flex-wrap gap-x-1 gap-y-0.5">
                    {(line.textEn || '').split(' ').map((word, wordIndex) => {
                      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                      const matchedWord = conversation.vocabularyList?.find(
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
        {conversation.questions.map((subQ) => (
          <Part3QuestionItemCard
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
