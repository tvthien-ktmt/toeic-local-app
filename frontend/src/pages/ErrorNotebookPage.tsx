import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw, Target } from 'lucide-react';
import {
  fetchErrorNotebook,
  fetchRetestSession,
  submitRetestAttempt,
  type ErrorNotebookItem,
  type ErrorNotebookResponse,
  type RetestAttemptResponse
} from '../api/errorNotebook';
import { ErrorNotebookHeader } from '../components/ErrorNotebookHeader';
import { ErrorNotebookItemCard } from '../components/ErrorNotebookItemCard';
import { ErrorNotebookRetestModal } from '../components/ErrorNotebookRetestModal';

/**
 * Centralized Error Notebook page for tracking, analyzing, and retesting missed questions from Exam and Practice sessions.
 */
export const ErrorNotebookPage: React.FC = () => {
  const [data, setData] = useState<ErrorNotebookResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [partFilter, setPartFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_review' | 'mastered'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  // Retest Modal state
  const [isRetestActive, setIsRetestActive] = useState<boolean>(false);
  const [retestQuestions, setRetestQuestions] = useState<ErrorNotebookItem[]>([]);
  const [currentRetestIndex, setCurrentRetestIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [retestResult, setRetestResult] = useState<RetestAttemptResponse | null>(null);
  const [isSubmittingRetest, setIsSubmittingRetest] = useState<boolean>(false);
  const [retestScore, setRetestScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchErrorNotebook({
        part: partFilter,
        grammar_topic: selectedTopic || undefined,
        status_filter: statusFilter,
        limit: 100
      });
      setData(response);
    } catch {
      // Graceful error state handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [partFilter, statusFilter, selectedTopic]);

  const handleStartRetestSession = async () => {
    try {
      setIsLoading(true);
      const sessionData = await fetchRetestSession({
        part: partFilter,
        grammar_topic: selectedTopic || undefined,
        limit: 10
      });
      if (sessionData.questions.length === 0) {
        alert('Hiện tại bạn không có câu hỏi nào trong danh sách lỗi sai để ôn tập!');
        setIsLoading(false);

        return;
      }
      setRetestQuestions(sessionData.questions);
      setCurrentRetestIndex(0);
      setSelectedOption('');
      setRetestResult(null);
      setRetestScore({ correct: 0, total: 0 });
      setIsRetestActive(true);
    } catch {
      alert('Không thể tạo phiên ôn tập câu sai. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerRetest = async (optionLetter: string) => {
    if (retestResult) {
      return;
    }
    const currentQuestion = retestQuestions[currentRetestIndex];
    if (!currentQuestion) {
      return;
    }

    setSelectedOption(optionLetter);
    setIsSubmittingRetest(true);
    try {
      const feedback = await submitRetestAttempt({
        question_id: currentQuestion.id,
        selected_option: optionLetter,
        time_spent_seconds: 15
      });
      setRetestResult(feedback);
      setRetestScore((prevScore) => ({
        correct: feedback.is_correct ? prevScore.correct + 1 : prevScore.correct,
        total: prevScore.total + 1
      }));
    } catch {
      // Retest submission failure handling
    } finally {
      setIsSubmittingRetest(false);
    }
  };

  const handleNextRetestQuestion = () => {
    if (currentRetestIndex + 1 < retestQuestions.length) {
      setCurrentRetestIndex((prevIndex) => prevIndex + 1);
      setSelectedOption('');
      setRetestResult(null);
    } else {
      setIsRetestActive(false);
      loadData();
    }
  };

  const currentRetestQ = retestQuestions[currentRetestIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <ErrorNotebookHeader
        data={data}
        isLoading={isLoading}
        onStartRetestSession={handleStartRetestSession}
      />

      {/* Top Mistake Categories Quick Bar */}
      {data && data.topics_breakdown && data.topics_breakdown.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-theme-primary">
            <Target className="w-4 h-4 text-theme-accent" />
            <span>Chủ điểm sai nhiều nhất:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTopic('')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                !selectedTopic
                  ? 'bg-theme-accent text-white'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
              }`}
            >
              Tất Cả Chủ Điểm
            </button>
            {data.topics_breakdown.map((topicItem) => (
              <button
                key={topicItem.topic}
                onClick={() => setSelectedTopic(topicItem.topic)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedTopic === topicItem.topic
                    ? 'bg-theme-accent text-white'
                    : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
                }`}
              >
                <span>{topicItem.topic}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-theme-error/20 text-theme-error font-extrabold">
                  {topicItem.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-theme-surface border border-theme">
        {/* Part Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: undefined, label: 'Tất Cả Part' },
            { id: 5, label: 'Part 5' },
            { id: 6, label: 'Part 6' },
            { id: 7, label: 'Part 7' },
          ].map((partTab) => (
            <button
              key={partTab.label}
              onClick={() => setPartFilter(partTab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                partFilter === partTab.id
                  ? 'bg-theme-accent text-white shadow-sm'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
              }`}
            >
              {partTab.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-theme-secondary">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-theme-surface-2 border border-theme text-xs font-semibold text-theme-primary focus:outline-none focus:border-theme-accent"
          >
            <option value="all">Tất Cả</option>
            <option value="needs_review">Cần Ôn Lại</option>
            <option value="mastered">Đã Thuần Thục</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-theme-secondary">
          <RefreshCw className="w-8 h-8 animate-spin text-theme-accent" />
          <p className="text-sm font-semibold">Đang tổng hợp dữ liệu sổ tay lỗi sai...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data && data.items.length === 0 && (
        <div className="text-center py-16 bg-theme-surface rounded-2xl border border-theme space-y-3">
          <CheckCircle2 className="w-12 h-12 text-theme-success mx-auto" />
          <h3 className="text-lg font-bold text-theme-primary">Không có câu sai nào trong danh mục này!</h3>
          <p className="text-xs text-theme-secondary max-w-md mx-auto">
            Tuyệt vời! Bạn chưa làm sai câu nào hoặc đã hoàn thành ôn tập toàn bộ câu hỏi. Hãy tiếp tục làm đề thi thử để đo năng lực.
          </p>
        </div>
      )}

      {/* Questions list */}
      {!isLoading && data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((item) => (
            <ErrorNotebookItemCard
              key={item.id}
              item={item}
              isExpanded={expandedCardId === item.id}
              onToggleExpand={() => setExpandedCardId(expandedCardId === item.id ? null : item.id)}
            />
          ))}
        </div>
      )}

      {/* Retest Interactive Modal */}
      {isRetestActive && currentRetestQ && (
        <ErrorNotebookRetestModal
          currentRetestQ={currentRetestQ}
          currentRetestIndex={currentRetestIndex}
          totalRetestQuestions={retestQuestions.length}
          retestScore={retestScore}
          selectedOption={selectedOption}
          isSubmittingRetest={isSubmittingRetest}
          retestResult={retestResult}
          onAnswerRetest={handleAnswerRetest}
          onNextRetestQuestion={handleNextRetestQuestion}
          onClose={() => setIsRetestActive(false)}
        />
      )}
    </div>
  );
};

export default ErrorNotebookPage;
