import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { ExamResultModal } from '../components/ExamResultModal';
import { ConfirmSubmitDialog } from '../components/ConfirmSubmitDialog';
import { ResumeDraftDialog } from '../components/ResumeDraftDialog';
import { ExamTakeHeader } from '../components/ExamTakeHeader';
import { ExamMatrixSidebar } from '../components/ExamMatrixSidebar';
import { ExamTakeAiModal } from '../components/ExamTakeAiModal';
import { ExamQuestionStream } from '../components/ExamQuestionStream';
import { groupQuestionsForDisplay } from '../utils/examGrouping';
import { useExamTakingSession } from '../hooks/useExamTakingSession';

interface ExamTakePageProps {
  docId: number;
  mode: 'full_exam' | 'practice';
  onBack: () => void;
}

/**
 * Interactive full exam taking page featuring 75-minute timer, 100-question matrix navigation, passage view, and score calculation.
 */
export const ExamTakePage: React.FC<ExamTakePageProps> = ({ docId, mode, onBack }) => {
  const {
    document,
    questions,
    isLoading,
    userAnswers,
    flaggedQuestions,
    revealedExplanations,
    timeLeft,
    isSubmitting,
    examResult,
    isShowConfirmDialog,
    isShowResumeDialog,
    pendingDraft,
    selectedAiQuestion,
    isAiLoading,
    aiExplanationData,
    aiErrorMsg,
    isShowResultModal,
    setIsShowConfirmDialog,
    setIsShowResultModal,
    setSelectedAiQuestion,
    handleConfirmSubmit,
    handleResumeDraft,
    handleStartFresh,
    handleSelectAnswer,
    handleToggleFlag,
    handleToggleExplanation,
    handleFetchAiExplanation,
    handleRetake,
  } = useExamTakingSession(docId, mode);

  const [matrixFilter, setMatrixFilter] = useState<
    'ALL' | 'PART5' | 'PART6' | 'PART7' | 'FLAGGED' | 'UNANSWERED'
  >('ALL');

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const scrollToQuestion = (questionId: number) => {
    const targetElement = questionRefs.current[questionId];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const filteredMatrixQs = questions.filter((questionItem) => {
    if (matrixFilter === 'PART5') {
      return questionItem.part === 5;
    }
    if (matrixFilter === 'PART6') {
      return questionItem.part === 6;
    }
    if (matrixFilter === 'PART7') {
      return questionItem.part === 7;
    }
    if (matrixFilter === 'FLAGGED') {
      return flaggedQuestions[questionItem.id];
    }
    if (matrixFilter === 'UNANSWERED') {
      return !userAnswers[questionItem.id];
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="w-10 h-10 text-theme-accent animate-spin" />
        <p className="text-sm font-semibold text-theme-secondary">Đang nạp đề thi RC...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-base pb-24">
      {isShowResumeDialog && pendingDraft && (
        <ResumeDraftDialog
          savedAnswerCount={Object.keys(pendingDraft.answers || {}).length}
          onResume={handleResumeDraft}
          onStartFresh={handleStartFresh}
        />
      )}

      {isShowConfirmDialog && (
        <ConfirmSubmitDialog
          unansweredCount={unansweredCount}
          flaggedCount={flaggedCount}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setIsShowConfirmDialog(false)}
        />
      )}

      <ExamTakeHeader
        document={document}
        mode={mode}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        progressPercent={progressPercent}
        flaggedCount={flaggedCount}
        timeLeft={timeLeft}
        isSubmitting={isSubmitting}
        examResult={examResult}
        onBack={onBack}
        onSubmitExam={() => setIsShowConfirmDialog(true)}
        onShowResultModal={() => setIsShowResultModal(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <ExamQuestionStream
            groups={groupQuestionsForDisplay(questions)}
            userAnswers={userAnswers}
            flaggedQuestions={flaggedQuestions}
            revealedExplanations={revealedExplanations}
            mode={mode}
            isSubmitted={!!examResult}
            questionRefs={questionRefs}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={handleToggleFlag}
            onToggleExplanation={handleToggleExplanation}
            onFetchAiExplanation={handleFetchAiExplanation}
          />
        </div>

        <div className="lg:col-span-4">
          <ExamMatrixSidebar
            questions={questions}
            filteredMatrixQs={filteredMatrixQs}
            answeredCount={answeredCount}
            flaggedCount={flaggedCount}
            unansweredCount={unansweredCount}
            matrixFilter={matrixFilter}
            userAnswers={userAnswers}
            flaggedQuestions={flaggedQuestions}
            examResult={examResult}
            onSetMatrixFilter={setMatrixFilter}
            onScrollToQuestion={scrollToQuestion}
          />
        </div>
      </div>

      <ExamTakeAiModal
        selectedAiQuestion={selectedAiQuestion}
        isAiLoading={isAiLoading}
        aiExplanationData={aiExplanationData}
        aiErrorMsg={aiErrorMsg}
        onClose={() => setSelectedAiQuestion(null)}
        onRetry={handleFetchAiExplanation}
      />

      {examResult && isShowResultModal && (
        <ExamResultModal
          result={examResult}
          onClose={() => setIsShowResultModal(false)}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
};

export default ExamTakePage;
