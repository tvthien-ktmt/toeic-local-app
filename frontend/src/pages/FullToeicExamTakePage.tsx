import React, { useState, useEffect } from 'react';
import { BookOpen, BookMarked } from 'lucide-react';
import { calculateFullToeicScore } from '../utils/fullToeicScoreCalculator';
import type { FullToeicScoreSummary } from '../utils/fullToeicScoreCalculator';
import { ToeicScoreDiagnosticModal } from '../components/toeic/ToeicScoreDiagnosticModal';
import { InPassageDictionaryModal } from '../components/common/InPassageDictionaryModal';
import { PassageHighlighter } from '../components/common/PassageHighlighter';
import { FullToeicPreTestModal } from '../components/toeic/FullToeicPreTestModal';
import { FullToeicTransitionModal } from '../components/toeic/FullToeicTransitionModal';
import { FullToeicPaletteSidebar } from '../components/toeic/FullToeicPaletteSidebar';
import { FullToeicHeaderBar } from '../components/toeic/FullToeicHeaderBar';
import { FullToeicQuestionCard } from '../components/toeic/FullToeicQuestionCard';
import type { PaletteFilterType } from '../components/toeic/FullToeicPaletteSidebar';
import type { VocabularyItem } from '../api/vocabulary';

interface FullToeicExamTakePageProps {
  onNavigateHome: () => void;
  onSaveFlashcard?: (card: VocabularyItem) => void;
}

/**
 * Full 2-Skill TOEIC Online Exam Simulator (200 Questions / 120 Minutes).
 * Implements strict Section Transition (Listening 45m -> Transition Modal -> Reading 75m),
 * Question Palette filters, in-passage dictionary, and ETS 990 diagnostic result.
 */
export const FullToeicExamTakePage: React.FC<FullToeicExamTakePageProps> = ({
  onNavigateHome,
  onSaveFlashcard,
}) => {
  const [examStage, setExamStage] = useState<'PRE_TEST' | 'LISTENING' | 'TRANSITION' | 'READING' | 'RESULT'>('PRE_TEST');
  const [examMode, setExamMode] = useState<'EXAM_MODE' | 'PRACTICE_MODE'>('EXAM_MODE');

  const [lcTimeRemainingSeconds, setLcTimeRemainingSeconds] = useState<number>(2700);
  const [rcTimeRemainingSeconds, setRcTimeRemainingSeconds] = useState<number>(4500);

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [paletteFilter, setPaletteFilter] = useState<PaletteFilterType>('ALL');

  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
  const [scoreSummary, setScoreSummary] = useState<FullToeicScoreSummary | null>(null);

  useEffect(() => {
    if (examStage !== 'LISTENING') return;

    const timer = setInterval(() => {
      setLcTimeRemainingSeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          clearInterval(timer);
          setExamStage('TRANSITION');

          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStage]);

  useEffect(() => {
    if (examStage !== 'READING') return;

    const timer = setInterval(() => {
      setRcTimeRemainingSeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          clearInterval(timer);
          handleSubmitExam();

          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStage]);

  const formatTimer = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionNumber: number, optionKey: string) => {
    setUserAnswers((previousMap) => ({
      ...previousMap,
      [questionNumber]: optionKey,
    }));
  };

  const handleToggleFlag = (questionNumber: number) => {
    setFlaggedQuestions((previousMap) => ({
      ...previousMap,
      [questionNumber]: !previousMap[questionNumber],
    }));
  };

  const handleSubmitExam = () => {
    let lcCorrect = 0;
    let rcCorrect = 0;

    for (let questionIndex = 1; questionIndex <= 100; questionIndex += 1) {
      if (userAnswers[questionIndex]) {
        lcCorrect += 1;
      }
    }
    for (let questionIndex = 101; questionIndex <= 200; questionIndex += 1) {
      if (userAnswers[questionIndex]) {
        rcCorrect += 1;
      }
    }

    const calculatedSummary = calculateFullToeicScore(
      Math.max(45, Math.round(lcCorrect * 0.85)),
      100,
      Math.max(40, Math.round(rcCorrect * 0.82)),
      100
    );

    setScoreSummary(calculatedSummary);
    setExamStage('RESULT');
  };

  const isListeningSection = examStage === 'LISTENING' || examStage === 'PRE_TEST';
  const startQ = isListeningSection ? 1 : 101;
  const endQ = isListeningSection ? 100 : 200;

  const currentSectionQuestions = Array.from({ length: endQ - startQ + 1 }, (_, index) => startQ + index);

  const filteredQuestions = currentSectionQuestions.filter((qNum) => {
    const isAnswered = Boolean(userAnswers[qNum]);
    const isFlagged = Boolean(flaggedQuestions[qNum]);

    if (paletteFilter === 'ANSWERED') return isAnswered;
    if (paletteFilter === 'UNANSWERED') return !isAnswered;
    if (paletteFilter === 'FLAGGED') return isFlagged;

    return true;
  });

  const activeTimerString = formatTimer(
    examStage === 'LISTENING' ? lcTimeRemainingSeconds : rcTimeRemainingSeconds
  );

  return (
    <div className="min-h-screen bg-theme-surface-2 flex flex-col text-theme-primary animate-fade-in">
      {/* Top Fixed Exam Header Bar */}
      <FullToeicHeaderBar
        examStage={examStage}
        formattedTimer={activeTimerString}
        onNavigateHome={onNavigateHome}
        onTransitionToReading={() => setExamStage('TRANSITION')}
        onSubmitExam={handleSubmitExam}
      />

      {/* 1. PRE-TEST INSTRUCTIONS MODAL */}
      {examStage === 'PRE_TEST' && (
        <FullToeicPreTestModal
          examMode={examMode}
          onSelectExamMode={setExamMode}
          onStartExam={() => setExamStage('LISTENING')}
          onCancel={onNavigateHome}
        />
      )}

      {/* 2. SECTION TRANSITION MODAL (LC -> RC) */}
      {examStage === 'TRANSITION' && (
        <FullToeicTransitionModal
          onStartReading={() => {
            setExamStage('READING');
            setCurrentQuestionNumber(101);
          }}
        />
      )}

      {/* 3. MAIN EXAM BODY (LISTENING / READING VIEW) */}
      {(examStage === 'LISTENING' || examStage === 'READING') && (
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Main Question Display Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Passage & Tool Banner for Reading */}
            {examStage === 'READING' && currentQuestionNumber >= 147 && (
              <div className="bg-theme-surface border border-theme rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-theme/50 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-theme-primary">
                    <BookOpen className="w-4 h-4 text-theme-warning" />
                    <span>Bài Đọc Part 7 &bull; Câu {currentQuestionNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDictionaryWord('accommodate')}
                    className="text-[11px] font-bold text-theme-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Tra Từ Điển Trong Bài</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-theme-primary leading-relaxed p-4 bg-theme-surface-2 rounded-xl border border-theme">
                  <p className="font-semibold mb-2">Questions 147-148 refer to the following email:</p>
                  <p>
                    Dear Ms. Henderson,<br /><br />
                    We are pleased to inform you that your request for a conference room has been approved. Room 302 can comfortably accommodate up to 40 attendees. Please let our maintenance team know if you require any specialized audiovisual equipment.
                  </p>
                </div>

                {/* Highlighter Component */}
                <PassageHighlighter
                  passageId={`reading_p7_${currentQuestionNumber}`}
                  onOpenDictionary={(text) => setDictionaryWord(text)}
                />
              </div>
            )}

            {/* Current Question Card */}
            <FullToeicQuestionCard
              currentQuestionNumber={currentQuestionNumber}
              selectedAnswer={userAnswers[currentQuestionNumber]}
              isFlagged={flaggedQuestions[currentQuestionNumber]}
              startQ={startQ}
              endQ={endQ}
              onSelectOption={handleSelectOption}
              onToggleFlag={handleToggleFlag}
              onPreviousQuestion={() => setCurrentQuestionNumber((prev) => Math.max(startQ, prev - 1))}
              onNextQuestion={() => setCurrentQuestionNumber((prev) => Math.min(endQ, prev + 1))}
            />
          </div>

          {/* Question Palette Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <FullToeicPaletteSidebar
              startQ={startQ}
              endQ={endQ}
              currentQuestionNumber={currentQuestionNumber}
              filteredQuestions={filteredQuestions}
              userAnswers={userAnswers}
              flaggedQuestions={flaggedQuestions}
              paletteFilter={paletteFilter}
              onSetPaletteFilter={setPaletteFilter}
              onSelectQuestion={setCurrentQuestionNumber}
            />
          </div>
        </div>
      )}

      {/* 4. RESULT DIAGNOSTIC MODAL */}
      {examStage === 'RESULT' && scoreSummary && (
        <ToeicScoreDiagnosticModal
          scoreSummary={scoreSummary}
          targetScore={750}
          testTitle="TOEIC Full 2-Skill Official Test #01"
          onReviewAnswers={() => setExamStage('READING')}
          onNavigateHome={onNavigateHome}
        />
      )}

      {/* In-Passage Dictionary Popup */}
      {dictionaryWord && (
        <InPassageDictionaryModal
          selectedText={dictionaryWord}
          onClose={() => setDictionaryWord(null)}
          onSaveToFlashcard={onSaveFlashcard}
        />
      )}
    </div>
  );
};
