import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { fetchQuestions, type QuestionItem } from '../api/questions';
import { useStudySessionTracker } from '../hooks/useStudySessionTracker';
import { SpeedTrainingSummaryCard } from '../components/SpeedTrainingSummaryCard';
import {
  SpeedTrainingLobbyView,
  SPRINT_CONFIGS,
  type SprintType
} from '../components/SpeedTrainingLobbyView';
import axios from 'axios';

/**
 * Speed Training (Sprint) module designed to transform knowledge into fast exam automaticity and timing stamina.
 */
export const SpeedTrainingPage: React.FC = () => {
  useStudySessionTracker('practice');

  const [selectedSprint, setSelectedSprint] = useState<SprintType>('PART5');
  const [isSprintActive, setIsSprintActive] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sprintStartRef = useRef<number>(0);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const config = SPRINT_CONFIGS[selectedSprint];

  const handleStartSprint = async (sprintType: SprintType) => {
    setSelectedSprint(sprintType);
    const chosenConfig = SPRINT_CONFIGS[sprintType];
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const response = await fetchQuestions({
        part: chosenConfig.part,
        limit: chosenConfig.questionCount
      });
      if (!response.items || response.items.length === 0) {
        setStatusMessage('Không tìm thấy câu hỏi nào cho phần này. Hãy upload thêm đề thi để luyện tập!');
        setIsLoading(false);

        return;
      }
      setQuestions(response.items);
      setCurrentIndex(0);
      setUserAnswers({});
      setTimeLeft(chosenConfig.timeLimitSeconds);
      setIsCompleted(false);
      setIsSprintActive(true);
      sprintStartRef.current = Date.now();

      // Start countdown timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            handleFinishSprint();

            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } catch {
      setStatusMessage('Lỗi nạp câu hỏi Sprint. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSprint = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsSprintActive(false);
    setIsCompleted(true);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSelectAnswer = (questionId: number, selectedLetter: string) => {
    if (userAnswers[questionId]) {
      return;
    }
    setUserAnswers((prev) => ({ ...prev, [questionId]: selectedLetter }));

    const currentQuestion = questions.find((item) => item.id === questionId);
    const isCorrect =
      currentQuestion &&
      selectedLetter.toUpperCase() === (currentQuestion.correct_answer || '').trim().toUpperCase();

    axios.post('/api/questions/attempt', {
      question_id: questionId,
      attempt_type: 'speed_sprint',
      is_correct: isCorrect,
      time_spent_seconds: 10,
      part: currentQuestion?.part || 5
    }).catch(() => {});

    // Auto advance if not last question
    if (currentIndex + 1 < questions.length) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 180);
    } else {
      setTimeout(() => {
        handleFinishSprint();
      }, 300);
    }
  };

  // Result Metrics
  const answeredCount = Object.keys(userAnswers).length;
  let correctCount = 0;
  questions.forEach((questionItem) => {
    if (userAnswers[questionItem.id] && userAnswers[questionItem.id].toUpperCase() === (questionItem.correct_answer || '').trim().toUpperCase()) {
      correctCount += 1;
    }
  });

  const totalTimeSpent = config.timeLimitSeconds - timeLeft;
  const avgSecPerQ = questions.length > 0 ? Math.round((totalTimeSpent / questions.length) * 10) / 10 : 0;
  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {statusMessage && (
        <div className="p-4 rounded-xl bg-theme-warning/15 border border-theme-warning/30 text-theme-warning text-xs font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Sprint Lobby View */}
      {!isSprintActive && !isCompleted && (
        <SpeedTrainingLobbyView
          isLoading={isLoading}
          onStartSprint={handleStartSprint}
        />
      )}

      {/* Active Sprint Live Runner */}
      {isSprintActive && !isCompleted && currentQ && (
        <div className="space-y-6">
          {/* Top Live HUD Header */}
          <div className="bg-theme-surface border border-theme rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-theme-accent/20 text-theme-accent font-bold text-xs">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs font-semibold text-theme-secondary hidden sm:inline">
                {currentQ.grammar_topic &&
                !currentQ.grammar_topic.toLowerCase().startsWith(`part ${currentQ.part}`)
                  ? `Part ${currentQ.part} • ${currentQ.grammar_topic}`
                  : `Part ${currentQ.part}`}
              </span>
            </div>

            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black border transition ${
                timeLeft <= 30
                  ? 'bg-theme-error/20 border-theme-error text-theme-error animate-pulse'
                  : timeLeft <= 60
                  ? 'bg-theme-warning/20 border-theme-warning text-theme-warning'
                  : 'bg-theme-surface-2 border-theme text-theme-primary'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
              </span>
            </div>

            <button
              onClick={handleFinishSprint}
              className="text-xs font-bold text-theme-secondary hover:text-theme-error transition cursor-pointer"
            >
              Nộp Bài Sớm
            </button>
          </div>

          {/* Question Card */}
          <div className="bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="text-base sm:text-lg font-medium text-theme-primary leading-relaxed whitespace-pre-wrap">
              {currentQ.question_text}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3">
              {(() => {
                let opts: string[] = [];
                if (Array.isArray(currentQ.options)) {
                  opts = currentQ.options;
                } else if (typeof currentQ.options === 'string') {
                  try {
                    opts = JSON.parse(currentQ.options) || [];
                  } catch {
                    opts = [];
                  }
                }

                return opts.map((optText, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = userAnswers[currentQ.id] === letter;

                  return (
                    <button
                      key={letter}
                      onClick={() => handleSelectAnswer(currentQ.id, letter)}
                      className={`w-full p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm flex items-center gap-3.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-theme-accent text-white border-theme-accent shadow-md'
                          : 'bg-theme-surface-2 hover:bg-theme-surface border-theme text-theme-primary hover:border-theme-accent'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-theme-surface border border-theme text-theme-primary'
                        }`}
                      >
                        {letter}
                      </span>
                      <span>{optText}</span>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Progress bottom dots */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-theme">
              {questions.map((qItem, idx) => (
                <div
                  key={qItem.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full cursor-pointer transition ${
                    idx === currentIndex
                      ? 'bg-theme-accent ring-2 ring-theme-accent/40'
                      : userAnswers[qItem.id]
                      ? 'bg-theme-success'
                      : 'bg-theme-surface-2 border border-theme'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completed Sprint Summary View */}
      {isCompleted && (
        <SpeedTrainingSummaryCard
          config={config}
          correctCount={correctCount}
          answeredCount={answeredCount}
          totalQuestions={questions.length}
          totalTimeSpent={totalTimeSpent}
          avgSecPerQ={avgSecPerQ}
          onRestartSprint={() => handleStartSprint(selectedSprint)}
          onSelectOtherMode={() => {
            setIsSprintActive(false);
            setIsCompleted(false);
          }}
        />
      )}
    </div>
  );
};

export default SpeedTrainingPage;
