import React from 'react';
import { MarkdownPassage } from './MarkdownPassage';
import { ExamQuestionCard } from './ExamQuestionCard';
import type { QuestionItem, PassageGroup } from '../utils/examGrouping';

interface ExamQuestionStreamProps {
  groups: PassageGroup[];
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  revealedExplanations: Record<number, boolean>;
  mode: 'full_exam' | 'practice';
  isSubmitted: boolean;
  questionRefs: React.RefObject<Record<number, HTMLDivElement | null>>;
  onSelectAnswer: (questionId: number, optionChar: string) => void;
  onToggleFlag: (questionId: number) => void;
  onToggleExplanation: (questionId: number) => void;
  onFetchAiExplanation: (questionItem: QuestionItem) => void;
}

/**
 * Main stream renderer for exam passages and questions, organizing Part 5 single items and Part 6/7 multi-question reading passages.
 */
export const ExamQuestionStream: React.FC<ExamQuestionStreamProps> = ({
  groups,
  userAnswers,
  flaggedQuestions,
  revealedExplanations,
  mode,
  isSubmitted,
  questionRefs,
  onSelectAnswer,
  onToggleFlag,
  onToggleExplanation,
  onFetchAiExplanation,
}) => {
  return (
    <div className="space-y-8">
      {groups.map((group) => {
        if (!group.isPassageGroup) {
          const singleQuestion = group.questions[0].item;

          return (
            <ExamQuestionCard
              key={singleQuestion.id}
              questionItem={singleQuestion}
              promptText={singleQuestion.question_text}
              selectedOpt={userAnswers[singleQuestion.id]}
              isFlagged={!!flaggedQuestions[singleQuestion.id]}
              isRevealed={!!revealedExplanations[singleQuestion.id]}
              mode={mode}
              isSubmitted={isSubmitted}
              cardRef={(element) => {
                if (questionRefs.current) {
                  questionRefs.current[singleQuestion.id] = element;
                }
              }}
              onSelectAnswer={onSelectAnswer}
              onToggleFlag={onToggleFlag}
              onToggleExplanation={onToggleExplanation}
              onFetchAiExplanation={onFetchAiExplanation}
            />
          );
        }

        return (
          <div
            key={group.id}
            className="bg-theme-surface/50 rounded-3xl border-2 border-theme p-4 sm:p-6 space-y-5 shadow-lg"
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme/60 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-theme-accent text-white font-mono text-xs font-black shadow-sm">
                  Part {group.part} • Câu {group.qStart}–{group.qEnd}
                </span>
                <span className="text-xs font-bold text-theme-primary">
                  {group.docType || 'Reading Comprehension'}
                </span>
              </div>
              <span className="text-[11px] text-theme-secondary font-medium italic">
                Đoạn văn bên trái • Câu hỏi bên phải
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-6 xl:sticky xl:top-32 max-h-[75vh] overflow-y-auto pr-1">
                <MarkdownPassage text={group.passageText} />
              </div>

              <div className="xl:col-span-6 space-y-5">
                {group.questions.map(({ item, promptOnly }) => (
                  <ExamQuestionCard
                    key={item.id}
                    questionItem={item}
                    promptText={promptOnly}
                    isNestedInGroup={true}
                    selectedOpt={userAnswers[item.id]}
                    isFlagged={!!flaggedQuestions[item.id]}
                    isRevealed={!!revealedExplanations[item.id]}
                    mode={mode}
                    isSubmitted={isSubmitted}
                    cardRef={(element) => {
                      if (questionRefs.current) {
                        questionRefs.current[item.id] = element;
                      }
                    }}
                    onSelectAnswer={onSelectAnswer}
                    onToggleFlag={onToggleFlag}
                    onToggleExplanation={onToggleExplanation}
                    onFetchAiExplanation={onFetchAiExplanation}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
