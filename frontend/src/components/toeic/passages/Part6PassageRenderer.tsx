import React from 'react';
import { DocumentRenderer } from '../documents/DocumentRenderer';
import { Part6QuestionRenderer } from '../questions/Part6QuestionRenderer';
import type { Part6PassageData, DocumentData } from '../../../types/toeicContent';

interface Part6PassageRendererProps {
  passage: Part6PassageData;
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  isSubmitted: boolean;
  mode: 'full_exam' | 'practice';
  activeQuestionNumber?: number;
  questionRefs?: React.RefObject<Record<number, HTMLDivElement | null>>;
  onSelectAnswer: (questionNumber: number, optionKey: string) => void;
  onToggleFlag: (questionNumber: number) => void;
  onSelectBlank: (questionNumber: number) => void;
}

/**
 * Renders a complete Part 6 passage unit with its document on the left and linked questions on the right.
 */
export const Part6PassageRenderer: React.FC<Part6PassageRendererProps> = ({
  passage,
  userAnswers,
  flaggedQuestions,
  isSubmitted,
  mode,
  activeQuestionNumber,
  questionRefs,
  onSelectAnswer,
  onToggleFlag,
  onSelectBlank,
}) => {
  const docData: DocumentData = {
    document_id: passage.passage_id,
    document_type: passage.document_type,
    title: passage.header,
    blocks: passage.blocks,
  };

  return (
    <div className="rounded-3xl border border-theme bg-theme-surface/60 p-4 sm:p-6 shadow-md space-y-6">
      {/* Passage Unit Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-theme/60 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-theme-accent text-white font-mono text-xs font-black shadow-xs">
            Part 6 • Câu {passage.start_q}–{passage.end_q}
          </span>
          <span className="text-xs font-bold text-theme-primary">
            {passage.document_type} (Điền từ vào chỗ trống)
          </span>
        </div>
        <span className="text-[11px] text-theme-secondary italic">
          Đoạn văn bên trái • 4 câu hỏi bên phải
        </span>
      </div>

      {/* Split Grid: Left Document vs Right Questions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Document */}
        <div className="xl:col-span-6 xl:sticky xl:top-28 max-h-[75vh] overflow-y-auto pr-1">
          <DocumentRenderer
            document={docData}
            userAnswers={userAnswers}
            activeQuestionNumber={activeQuestionNumber}
            onSelectBlank={onSelectBlank}
          />
        </div>

        {/* Right Column: 4 Linked Questions */}
        <div className="xl:col-span-6 space-y-4">
          {passage.questions.map((questionItem) => (
            <Part6QuestionRenderer
              key={questionItem.number}
              question={questionItem}
              selectedOption={userAnswers[questionItem.number]}
              isFlagged={!!flaggedQuestions[questionItem.number]}
              isSubmitted={isSubmitted}
              mode={mode}
              cardRef={(element) => {
                if (questionRefs?.current) {
                  questionRefs.current[questionItem.number] = element;
                }
              }}
              onSelectAnswer={onSelectAnswer}
              onToggleFlag={onToggleFlag}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
