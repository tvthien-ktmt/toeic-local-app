import React from 'react';
import { Award } from 'lucide-react';
import type { QuestionItem } from '../api/questions';
import { AIStudyRecommendationCard } from './AIStudyRecommendationCard';

interface PracticeMockSummaryBannerProps {
  score: { correct: number; total: number };
  questions: QuestionItem[];
  userAnswers: Record<number, string>;
}

/**
 * Summary banner displayed after submitting timed practice session showing total score and Part performance.
 */
export const PracticeMockSummaryBanner: React.FC<PracticeMockSummaryBannerProps> = ({
  score,
  questions,
  userAnswers,
}) => {
  const getPartScore = (partNum: number) => {
    const partQuestions = questions.filter((questionItem) => questionItem.part === partNum);
    const correctPartQuestions = partQuestions.filter((questionItem) => {
      const userChoice = userAnswers[questionItem.id];

      return (
        userChoice &&
        questionItem.correct_answer &&
        userChoice.toUpperCase() === questionItem.correct_answer.toUpperCase()
      );
    });

    return { correct: correctPartQuestions.length, total: partQuestions.length };
  };

  const part5Score = getPartScore(5);
  const part6Score = getPartScore(6);
  const part7Score = getPartScore(7);

  const weakGrammarTopics = Array.from(
    new Set(
      questions
        .filter(
          (questionItem) =>
            userAnswers[questionItem.id] &&
            questionItem.correct_answer &&
            userAnswers[questionItem.id].toUpperCase() !== questionItem.correct_answer.toUpperCase()
        )
        .map((questionItem) => questionItem.grammar_topic || 'general grammar')
    )
  );

  const weakParts = Array.from(
    new Set(
      questions
        .filter(
          (questionItem) =>
            userAnswers[questionItem.id] &&
            questionItem.correct_answer &&
            userAnswers[questionItem.id].toUpperCase() !== questionItem.correct_answer.toUpperCase()
        )
        .map((questionItem) => questionItem.part || 5)
    )
  );

  return (
    <div className="bg-theme-surface border border-theme-warning/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in">
      <div className="flex items-center space-x-2 text-theme-warning font-bold text-lg">
        <Award className="w-6 h-6" />
        <h2>BÁO CÁO KẾT QUẢ THI THỬ THỜI GIAN THẬT (FULL MOCK TEST)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
        <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl text-center">
          <span className="text-xs text-theme-secondary block font-medium">Tổng điểm thi thử</span>
          <span className="text-3xl font-extrabold text-theme-accent">
            {score.correct} / {score.total}
          </span>
          <span className="text-xs font-bold text-theme-success block mt-1">
            ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}% Đúng)
          </span>
        </div>

        <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl text-center">
          <span className="text-xs text-theme-secondary block font-medium">Part 5 (Mục tiêu 10m)</span>
          <span className="text-lg font-bold text-theme-primary">
            {part5Score.correct} / {part5Score.total} câu
          </span>
        </div>

        <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl text-center">
          <span className="text-xs text-theme-secondary block font-medium">Part 6 (Mục tiêu 10m)</span>
          <span className="text-lg font-bold text-theme-primary">
            {part6Score.correct} / {part6Score.total} câu
          </span>
        </div>

        <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl text-center">
          <span className="text-xs text-theme-secondary block font-medium">Part 7 (Mục tiêu 54m)</span>
          <span className="text-lg font-bold text-theme-primary">
            {part7Score.correct} / {part7Score.total} câu
          </span>
        </div>
      </div>

      <AIStudyRecommendationCard
        scoreCorrect={score.correct}
        scoreTotal={score.total}
        weakGrammarTopics={weakGrammarTopics}
        weakParts={weakParts}
      />
    </div>
  );
};
