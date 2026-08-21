import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { DocumentRenderer } from '../documents/DocumentRenderer';
import { Part7QuestionRenderer } from '../questions/Part7QuestionRenderer';
import type { Part7PassageSetData } from '../../../types/toeicContent';

interface Part7PassageSetRendererProps {
  passageSet: Part7PassageSetData;
  userAnswers: Record<number, string>;
  flaggedQuestions: Record<number, boolean>;
  isSubmitted: boolean;
  mode: 'full_exam' | 'practice';
  questionRefs?: React.RefObject<Record<number, HTMLDivElement | null>>;
  onSelectAnswer: (questionNumber: number, optionKey: string) => void;
  onToggleFlag: (questionNumber: number) => void;
}

/**
 * Renders Part 7 Single, Double, and Triple passage sets with multi-document tab/column layouts and questions on the right.
 */
export const Part7PassageSetRenderer: React.FC<Part7PassageSetRendererProps> = ({
  passageSet,
  userAnswers,
  flaggedQuestions,
  isSubmitted,
  mode,
  questionRefs,
  onSelectAnswer,
  onToggleFlag,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<number>(0);
  const isMultiDoc = passageSet.documents.length > 1;

  return (
    <div className="rounded-3xl border border-theme bg-theme-surface/60 p-4 sm:p-6 shadow-md space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-theme/60 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-theme-accent text-white font-mono text-xs font-black shadow-xs">
            Part 7 • Câu {passageSet.start_q}–{passageSet.end_q}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-theme-primary px-2.5 py-0.5 rounded-lg bg-theme-surface-2 border border-theme">
            <Layers className="w-3.5 h-3.5 text-theme-accent" />
            {passageSet.passage_type} PASSAGE ({passageSet.documents.length} văn bản)
          </span>
        </div>
        <span className="text-[11px] text-theme-secondary italic">
          {passageSet.header}
        </span>
      </div>

      {/* Main Grid: Left Documents vs Right Questions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Documents */}
        <div className="xl:col-span-6 xl:sticky xl:top-28 max-h-[75vh] overflow-y-auto pr-1 space-y-4">
          {/* If Multi-Document on smaller screens, offer tab switcher */}
          {isMultiDoc && (
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-theme-surface-2 border border-theme mb-3 overflow-x-auto">
              {passageSet.documents.map((doc, idx) => (
                <button
                  key={doc.document_id}
                  type="button"
                  onClick={() => setActiveDocTab(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeDocTab === idx
                      ? 'bg-theme-accent text-white shadow-xs'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface'
                  }`}
                >
                  Văn bản {idx + 1}: {doc.document_type}
                </button>
              ))}
            </div>
          )}

          {/* Render Documents: Render all stacked or active tab */}
          <div className="space-y-4">
            {passageSet.documents.map((doc, idx) => (
              <div
                key={doc.document_id}
                className={isMultiDoc && activeDocTab !== idx ? 'hidden xl:block' : 'block'}
              >
                {isMultiDoc && (
                  <div className="text-[11px] font-extrabold text-theme-secondary uppercase mb-1 tracking-wider">
                    Văn bản {idx + 1}: {doc.document_type}
                  </div>
                )}
                <DocumentRenderer document={doc} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className="xl:col-span-6 space-y-4">
          {passageSet.questions.map((questionItem) => (
            <Part7QuestionRenderer
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
