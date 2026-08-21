import React, { useState } from 'react';
import { Part5QuestionRenderer } from './questions/Part5QuestionRenderer';
import { Part6PassageRenderer } from './passages/Part6PassageRenderer';
import { Part7PassageSetRenderer } from './passages/Part7PassageSetRenderer';
import type { NormalizedParts } from '../../types/toeicContent';

interface StructuredExamStreamProps {
  parts: NormalizedParts;
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  isSubmitted: boolean;
  mode: 'full_exam' | 'practice';
  questionRefs: React.RefObject<Record<number, HTMLDivElement | null>>;
  onSelectAnswer: (questionNumber: number, optionKey: string) => void;
  onToggleFlag: (questionNumber: number) => void;
  onFetchAiExplanation?: (questionNumber: number) => void;
}

/**
 * Main structured stream renderer rendering Part 5, Part 6, and Part 7
 * in strict compliance with Render_QuestionRC.md specifications.
 */
export const StructuredExamStream: React.FC<StructuredExamStreamProps> = ({
  parts,
  userAnswers,
  flaggedQuestions,
  isSubmitted,
  mode,
  questionRefs,
  onSelectAnswer,
  onToggleFlag,
  onFetchAiExplanation,
}) => {
  const [activeBlankQuestion, setActiveBlankQuestion] = useState<number | undefined>();

  const handleSelectBlank = (questionNumber: number) => {
    setActiveBlankQuestion(questionNumber);
    const targetElement = questionRefs.current?.[questionNumber];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-12">
      {/* ========================================================================= */}
      {/* PART 5: INCOMPLETE SENTENCES                                              */}
      {/* ========================================================================= */}
      {parts.part5 && parts.part5.questions.length > 0 && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-theme-surface border border-theme p-4 sm:p-5 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-theme-accent text-white font-mono text-xs font-black">
                  PART 5
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-theme-primary">
                  Incomplete Sentences (Câu 101–130)
                </h2>
              </div>
              <p className="text-xs text-theme-secondary mt-1">
                Chọn một phương án đúng nhất (A, B, C, hoặc D) để hoàn thành mỗi câu sau.
              </p>
            </div>
            <span className="text-xs font-bold text-theme-accent">
              {parts.part5.questions.length} câu hỏi
            </span>
          </div>

          <div className="space-y-4">
            {parts.part5.questions.map((questionItem) => (
              <Part5QuestionRenderer
                key={questionItem.number}
                question={questionItem}
                selectedOption={userAnswers[questionItem.number]}
                isFlagged={!!flaggedQuestions[questionItem.number]}
                isSubmitted={isSubmitted}
                mode={mode}
                cardRef={(element) => {
                  if (questionRefs.current) {
                    questionRefs.current[questionItem.number] = element;
                  }
                }}
                onSelectAnswer={onSelectAnswer}
                onToggleFlag={onToggleFlag}
                onFetchAiExplanation={onFetchAiExplanation}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* PART 6: TEXT COMPLETION                                                   */}
      {/* ========================================================================= */}
      {parts.part6 && parts.part6.passages.length > 0 && (
        <section className="space-y-6">
          <div className="rounded-2xl bg-theme-surface border border-theme p-4 sm:p-5 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-theme-accent text-white font-mono text-xs font-black">
                  PART 6
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-theme-primary">
                  Text Completion (Câu 131–146)
                </h2>
              </div>
              <p className="text-xs text-theme-secondary mt-1">
                Đọc các đoạn văn sau và chọn từ/câu thích hợp nhất để điền vào 4 vị trí ô trống.
              </p>
            </div>
            <span className="text-xs font-bold text-theme-accent">
              {parts.part6.passages.length} đoạn văn (16 câu)
            </span>
          </div>

          <div className="space-y-8">
            {parts.part6.passages.map((passage) => (
              <Part6PassageRenderer
                key={passage.passage_id}
                passage={passage}
                userAnswers={userAnswers}
                flaggedQuestions={flaggedQuestions}
                isSubmitted={isSubmitted}
                mode={mode}
                activeQuestionNumber={activeBlankQuestion}
                questionRefs={questionRefs}
                onSelectAnswer={onSelectAnswer}
                onToggleFlag={onToggleFlag}
                onSelectBlank={handleSelectBlank}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* PART 7: READING COMPREHENSION                                             */}
      {/* ========================================================================= */}
      {parts.part7 && parts.part7.passage_sets.length > 0 && (
        <section className="space-y-6">
          <div className="rounded-2xl bg-theme-surface border border-theme p-4 sm:p-5 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-theme-accent text-white font-mono text-xs font-black">
                  PART 7
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-theme-primary">
                  Reading Comprehension (Câu 147–200)
                </h2>
              </div>
              <p className="text-xs text-theme-secondary mt-1">
                Đọc các bài đọc đơn, bài đọc kép và bài đọc ba để trả lời các câu hỏi đọc hiểu.
              </p>
            </div>
            <span className="text-xs font-bold text-theme-accent">
              {parts.part7.passage_sets.length} nhóm bài đọc (54 câu)
            </span>
          </div>

          <div className="space-y-8">
            {parts.part7.passage_sets.map((passageSet) => (
              <Part7PassageSetRenderer
                key={passageSet.passage_set_id}
                passageSet={passageSet}
                userAnswers={userAnswers}
                flaggedQuestions={flaggedQuestions}
                isSubmitted={isSubmitted}
                mode={mode}
                questionRefs={questionRefs}
                onSelectAnswer={onSelectAnswer}
                onToggleFlag={onToggleFlag}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
