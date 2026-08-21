import React from 'react';
import type { StructuredLCExamPayload } from '../../../types/toeicListening';
import { Part1PhotographRenderer } from './Part1PhotographRenderer';
import { Part2ResponseRenderer } from './Part2ResponseRenderer';
import { Part3ConversationRenderer } from './Part3ConversationRenderer';
import { Part4TalkRenderer } from './Part4TalkRenderer';

interface LcExamStreamRendererProps {
  examData: StructuredLCExamPayload;
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  isExamMode: boolean;
  isSubmitted: boolean;
  activeTranscriptLineId?: string | null;
  onSelectAnswer: (questionNumber: number, answerKey: string) => void;
  onToggleFlag: (questionNumber: number) => void;
  onAskAi: (questionNumber: number) => void;
  onSeek: (seconds: number) => void;
}

/**
 * Renders all 4 Listening Parts in standard ETS sequence (Part 1 -> Part 2 -> Part 3 -> Part 4).
 */
export const LcExamStreamRenderer: React.FC<LcExamStreamRendererProps> = ({
  examData,
  userAnswers,
  flaggedQuestions,
  isExamMode,
  isSubmitted,
  activeTranscriptLineId,
  onSelectAnswer,
  onToggleFlag,
  onAskAi,
  onSeek,
}) => {
  return (
    <div className="space-y-8">
      {/* Part 1 Header & Questions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-theme/50 pb-2">
          <h3 className="font-extrabold text-sm sm:text-base text-theme-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-accent" />
            <span>{examData.parts.part1.title}</span>
          </h3>
          <span className="text-xs text-theme-secondary">Câu 1 - 6</span>
        </div>

        <div className="space-y-6">
          {examData.parts.part1.questions.map((questionItem) => (
            <Part1PhotographRenderer
              key={questionItem.id}
              question={questionItem}
              selectedOption={userAnswers[questionItem.questionNumber]}
              isFlagged={!!flaggedQuestions[questionItem.questionNumber]}
              isExamMode={isExamMode}
              isSubmitted={isSubmitted}
              onSelectOption={(opt) => onSelectAnswer(questionItem.questionNumber, opt)}
              onToggleFlag={() => onToggleFlag(questionItem.questionNumber)}
              onAskAi={() => onAskAi(questionItem.questionNumber)}
            />
          ))}
        </div>
      </section>

      {/* Part 2 Header & Questions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-theme/50 pb-2">
          <h3 className="font-extrabold text-sm sm:text-base text-theme-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-warning" />
            <span>{examData.parts.part2.title}</span>
          </h3>
          <span className="text-xs text-theme-secondary">Câu 7 - 31</span>
        </div>

        <div className="space-y-5">
          {examData.parts.part2.questions.map((questionItem) => (
            <Part2ResponseRenderer
              key={questionItem.id}
              question={questionItem}
              selectedOption={userAnswers[questionItem.questionNumber]}
              isFlagged={!!flaggedQuestions[questionItem.questionNumber]}
              isExamMode={isExamMode}
              isSubmitted={isSubmitted}
              onSelectOption={(opt) => onSelectAnswer(questionItem.questionNumber, opt)}
              onToggleFlag={() => onToggleFlag(questionItem.questionNumber)}
              onAskAi={() => onAskAi(questionItem.questionNumber)}
            />
          ))}
        </div>
      </section>

      {/* Part 3 Header & Conversations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-theme/50 pb-2">
          <h3 className="font-extrabold text-sm sm:text-base text-theme-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-accent" />
            <span>{examData.parts.part3.title}</span>
          </h3>
          <span className="text-xs text-theme-secondary">Câu 32 - 70</span>
        </div>

        <div className="space-y-6">
          {examData.parts.part3.conversations.map((conv) => (
            <Part3ConversationRenderer
              key={conv.id}
              conversation={conv}
              userAnswers={userAnswers}
              flaggedQuestions={flaggedQuestions}
              isExamMode={isExamMode}
              isSubmitted={isSubmitted}
              activeTranscriptLineId={activeTranscriptLineId}
              onSelectOption={onSelectAnswer}
              onToggleFlag={onToggleFlag}
              onAskAi={(qNum) => onAskAi(qNum)}
              onSeekToTimestamp={onSeek}
            />
          ))}
        </div>
      </section>

      {/* Part 4 Header & Talks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-theme/50 pb-2">
          <h3 className="font-extrabold text-sm sm:text-base text-theme-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-success" />
            <span>{examData.parts.part4.title}</span>
          </h3>
          <span className="text-xs text-theme-secondary">Câu 71 - 100</span>
        </div>

        <div className="space-y-6">
          {examData.parts.part4.talks.map((talk) => (
            <Part4TalkRenderer
              key={talk.id}
              talk={talk}
              userAnswers={userAnswers}
              flaggedQuestions={flaggedQuestions}
              isExamMode={isExamMode}
              isSubmitted={isSubmitted}
              activeTranscriptLineId={activeTranscriptLineId}
              onSelectOption={onSelectAnswer}
              onToggleFlag={onToggleFlag}
              onAskAi={(qNum) => onAskAi(qNum)}
              onSeekToTimestamp={onSeek}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
