import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import type { QuestionItem } from '../api/questions';
import { PracticeTimer } from './PracticeTimer';
import { AIStudyRecommendationCard } from './AIStudyRecommendationCard';
import { DocumentQuestionItemCard } from './DocumentQuestionItemCard';

interface DocumentQuestionsViewProps {
  filteredQuestions: QuestionItem[];
  selectedPartFilter: number | null;
  examMode: 'free' | 'timed_75';
  userAnswers: Record<number, string>;
  isExamSubmitted: boolean;
  score: { correct: number; total: number };
  weakTopics: string[];
  weakParts: number[];
  showAnswers: Record<number, boolean>;
  onSetExamMode: (mode: 'free' | 'timed_75') => void;
  onSetSelectedPartFilter: (part: number | null) => void;
  onSelectOption: (questionId: number, optionLetter: string) => void;
  onSubmitExam: () => void;
  onToggleShowAnswer: (questionId: number) => void;
  onOpenGrammarModal: (topic: string) => void;
}

/**
 * Question list view within document detail page supporting Part filtering, free/timed exam modes, and submission scoring.
 */
export const DocumentQuestionsView: React.FC<DocumentQuestionsViewProps> = ({
  filteredQuestions,
  selectedPartFilter,
  examMode,
  userAnswers,
  isExamSubmitted,
  score,
  weakTopics,
  weakParts,
  showAnswers,
  onSetExamMode,
  onSetSelectedPartFilter,
  onSelectOption,
  onSubmitExam,
  onToggleShowAnswer,
  onOpenGrammarModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Exam Mode Selector Banner */}
      <div className="p-6 rounded-2xl bg-theme-surface-2 border border-theme space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
              <Award className="w-5 h-5 text-theme-warning" />
              Chọn Chế Độ Thi Đề Thi Này
            </h3>
            <p className="text-xs text-theme-secondary">
              Chọn làm tự do không giới hạn thời gian hoặc thi 75 phút áp lực thi thật
            </p>
          </div>

          {/* Exam Mode Toggle */}
          <div className="inline-flex p-1 bg-theme-surface rounded-xl border border-theme space-x-1 shrink-0">
            <button
              onClick={() => onSetExamMode('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                examMode === 'free'
                  ? 'bg-theme-accent text-white shadow-lg'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Thi Tự Do (Tự tính giờ)
            </button>

            <button
              onClick={() => onSetExamMode('timed_75')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                examMode === 'timed_75'
                  ? 'bg-theme-warning text-white font-extrabold shadow-lg'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Thi 75 Phút (Có đếm ngược)
            </button>
          </div>
        </div>

        {/* Timer or Score Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-theme">
          {examMode === 'timed_75' ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-theme-warning">Thời Gian Đếm Ngược:</span>
              <PracticeTimer
                targetMinutes={75}
                onTimeUp={onSubmitExam}
                isPaused={isExamSubmitted}
              />
            </div>
          ) : (
            <span className="text-xs text-theme-secondary font-medium">
              Chế độ thi tự do — Chọn đáp án và bấm Nộp bài thi bất kỳ lúc nào
            </span>
          )}

          {!isExamSubmitted ? (
            <button
              onClick={onSubmitExam}
              className="px-4 py-2 bg-theme-success hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Nộp Bài Thi
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-bold text-theme-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Đã nộp bài! Điểm số: {score.correct} / {score.total} câu (
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Personalized Recommendation Card after submission */}
      {isExamSubmitted && (
        <AIStudyRecommendationCard
          scoreCorrect={score.correct}
          scoreTotal={score.total}
          weakGrammarTopics={weakTopics}
          weakParts={weakParts}
        />
      )}

      {/* Question Filter Header */}
      <div className="flex items-center justify-between pb-2 border-b border-theme">
        <span className="text-xs text-theme-secondary font-semibold">
          Danh sách {filteredQuestions.length} câu hỏi
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onSetSelectedPartFilter(null)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedPartFilter === null
                ? 'bg-theme-accent text-white'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onSetSelectedPartFilter(5)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedPartFilter === 5
                ? 'bg-theme-accent text-white'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            Part 5
          </button>
          <button
            onClick={() => onSetSelectedPartFilter(6)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedPartFilter === 6
                ? 'bg-theme-accent text-white'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            Part 6
          </button>
          <button
            onClick={() => onSetSelectedPartFilter(7)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedPartFilter === 7
                ? 'bg-theme-accent text-white'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            Part 7
          </button>
        </div>
      </div>

      {/* Question items */}
      {filteredQuestions.map((questionItem, index) => (
        <DocumentQuestionItemCard
          key={questionItem.id}
          questionItem={questionItem}
          index={index}
          userChoice={userAnswers[questionItem.id]}
          isExamSubmitted={isExamSubmitted}
          showDetail={isExamSubmitted || !!showAnswers[questionItem.id]}
          onSelectOption={onSelectOption}
          onToggleShowAnswer={onToggleShowAnswer}
          onOpenGrammarModal={onOpenGrammarModal}
        />
      ))}
    </div>
  );
};
