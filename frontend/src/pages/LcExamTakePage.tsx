import React, { useState, useEffect, useMemo } from 'react';
import { Send, LayoutGrid } from 'lucide-react';
import { AudioPlayerEngine } from '../components/toeic/listening/AudioPlayerEngine';
import { LcExamStreamRenderer } from '../components/toeic/listening/LcExamStreamRenderer';
import { LcExamTakeHeader } from '../components/toeic/listening/LcExamTakeHeader';
import { LcExamMatrixSidebar } from '../components/toeic/listening/LcExamMatrixSidebar';
import { LcExamResultModal } from '../components/toeic/listening/LcExamResultModal';
import { LcAiTutorModal } from '../components/toeic/listening/LcAiTutorModal';
import { LcExamNotReadyState } from '../components/toeic/listening/LcExamNotReadyState';
import { useLcAudioEngine } from '../hooks/useLcAudioEngine';
import { evaluateLcExamSubmission, extractAllEvaluationQuestions } from '../utils/lcScoreCalculator';
import type { QuestionEvalInput } from '../utils/lcScoreCalculator';
import type { LCExamDocument, LCExamResult, NormalizedLCParts } from '../types/toeicListening';

interface LcExamTakePageProps {
  document: LCExamDocument;
  mode?: 'full_exam' | 'practice';
  onBack: () => void;
  onNavigateHome?: () => void;
}

/**
 * Interactive TOEIC Listening Exam Room.
 * If questions are not yet loaded for this test, displays a clear status screen guiding the user back.
 */
export const LcExamTakePage: React.FC<LcExamTakePageProps> = ({
  document,
  mode = 'full_exam',
  onBack,
  onNavigateHome,
}) => {
  const [examData] = useState<LCExamDocument>(document);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<LCExamResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeAiQuestionNum, setActiveAiQuestionNum] = useState<number | null>(null);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(45 * 60);

  const hasQuestionsLoaded = Boolean(
    examData.parts &&
      (examData.parts.part1?.questions?.length > 0 ||
        examData.parts.part2?.questions?.length > 0 ||
        examData.parts.part3?.conversations?.length > 0 ||
        examData.parts.part4?.talks?.length > 0)
  );

  const {
    audioState,
    handlePlay,
    handlePause,
    handleSeek,
    handleReplayFiveSeconds,
    handleSetPlaybackRate,
  } = useLcAudioEngine({
    audioUrl: examData.audioUrl || '',
    isExamMode: mode === 'full_exam',
  });

  useEffect(() => {
    if (isSubmitted || !hasQuestionsLoaded) {
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeRemainingSeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          clearInterval(timerInterval);
          handleSubmitExam();

          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isSubmitted, hasQuestionsLoaded]);

  const allEvaluationQuestions: QuestionEvalInput[] = useMemo(() => {
    if (!hasQuestionsLoaded || !examData.parts) {
      return [];
    }

    return extractAllEvaluationQuestions({ parts: examData.parts });
  }, [examData, hasQuestionsLoaded]);

  const handleSubmitExam = () => {
    const timeSpent = 45 * 60 - timeRemainingSeconds;
    const evaluated = evaluateLcExamSubmission(
      examData.id,
      examData.title,
      mode,
      allEvaluationQuestions,
      userAnswers,
      timeSpent > 0 ? timeSpent : 45 * 60
    );

    setResult(evaluated);
    setIsSubmitted(true);
    handlePause();
  };

  const handleRetakeExam = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionNumber(1);
    setIsSubmitted(false);
    setResult(null);
    setTimeRemainingSeconds(45 * 60);
    handleSeek(0);
  };

  const handleSelectAnswer = (qNum: number, optionKey: string) => {
    if (!isSubmitted) {
      setUserAnswers((previous) => ({ ...previous, [qNum]: optionKey }));
    }
  };

  const handleToggleFlag = (qNum: number) => {
    setFlaggedQuestions((previous) => ({ ...previous, [qNum]: !previous[qNum] }));
  };

  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  const getQuestionPart = (qNum: number): 1 | 2 | 3 | 4 => {
    if (qNum <= 6) return 1;
    if (qNum <= 31) return 2;
    if (qNum <= 70) return 3;

    return 4;
  };

  if (!hasQuestionsLoaded || !examData.parts) {
    return (
      <LcExamNotReadyState
        examDocument={examData}
        onBack={onBack}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  const fullExamPayload = {
    status: 'READY',
    document: examData,
    totalQuestions: examData.totalQuestions,
    parts: examData.parts as NormalizedLCParts,
  };

  return (
    <div className="min-h-screen bg-theme-base flex flex-col font-sans transition-colors duration-200">
      <LcExamTakeHeader
        document={examData}
        mode={mode}
        timeRemainingSeconds={timeRemainingSeconds}
        totalQuestions={examData.totalQuestions}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        isSubmitted={isSubmitted}
        result={result}
        onBack={onBack}
        onSubmit={handleSubmitExam}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        <div className="flex-1 min-w-0 space-y-6">
          <AudioPlayerEngine
            audioState={audioState}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onReplayFiveSeconds={handleReplayFiveSeconds}
            onSetPlaybackRate={handleSetPlaybackRate}
            isExamMode={mode === 'full_exam'}
            label={examData.title}
            subLabel={mode === 'full_exam' ? 'Chế độ thi thật (Khóa tua audio)' : 'Chế độ luyện tập'}
          />

          <LcExamStreamRenderer
            examData={fullExamPayload}
            userAnswers={userAnswers}
            flaggedQuestions={flaggedQuestions}
            isExamMode={mode === 'full_exam'}
            isSubmitted={isSubmitted}
            activeTranscriptLineId={audioState.activeTranscriptLineId}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={handleToggleFlag}
            onAskAi={(qNum) => setActiveAiQuestionNum(qNum)}
            onSeek={handleSeek}
          />

          {!isSubmitted && (
            <div className="p-6 rounded-2xl bg-theme-surface border border-theme shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-bold text-theme-primary">
                  Đã trả lời {answeredCount}/{examData.totalQuestions} câu
                </p>
                <p className="text-xs text-theme-secondary">
                  Kiểm tra lại đáp án trong bảng ma trận trước khi nộp bài.
                </p>
              </div>

              <button
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-sm shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Nộp Bài Thi Ngay</span>
              </button>
            </div>
          )}
        </div>

        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20">
            <LcExamMatrixSidebar
              totalQuestions={examData.totalQuestions}
              userAnswers={userAnswers}
              flaggedQuestions={flaggedQuestions}
              currentQuestionNumber={currentQuestionNumber}
              isSubmitted={isSubmitted}
              result={result}
              isOpen={true}
              onClose={() => {}}
              onSelectQuestion={(qNum) => setCurrentQuestionNumber(qNum)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-theme-accent text-white shadow-xl flex items-center gap-2 text-xs font-bold hover:scale-105 cursor-pointer transition-all"
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Bảng Câu ({answeredCount}/100)</span>
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-xs h-full bg-theme-surface p-4 overflow-y-auto">
            <LcExamMatrixSidebar
              totalQuestions={examData.totalQuestions}
              userAnswers={userAnswers}
              flaggedQuestions={flaggedQuestions}
              currentQuestionNumber={currentQuestionNumber}
              isSubmitted={isSubmitted}
              result={result}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onSelectQuestion={(qNum) => {
                setCurrentQuestionNumber(qNum);
                setIsSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {result && (
        <LcExamResultModal
          result={result}
          onReviewAnswers={() => setResult(null)}
          onRetest={handleRetakeExam}
          onBackToCatalog={onBack}
        />
      )}

      {activeAiQuestionNum && (
        <LcAiTutorModal
          questionNumber={activeAiQuestionNum}
          part={getQuestionPart(activeAiQuestionNum)}
          questionStem={`Câu hỏi số ${activeAiQuestionNum}`}
          isOpen={activeAiQuestionNum !== null}
          onClose={() => setActiveAiQuestionNum(null)}
        />
      )}
    </div>
  );
};

export default LcExamTakePage;
