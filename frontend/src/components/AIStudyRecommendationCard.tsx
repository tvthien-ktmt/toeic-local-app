import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, BookOpen, Layers, Target, CheckCircle2, Loader2, Award } from 'lucide-react';
import { GrammarQuickRefModal } from './GrammarQuickRefModal';

export interface AIRecommendationData {
  overall_evaluation: string;
  target_action_plan: string[];
  grammar_to_review: string[];
  recommended_vocab_focus: string[];
}

interface AIStudyRecommendationCardProps {
  scoreCorrect: number;
  scoreTotal: number;
  weakGrammarTopics: string[];
  weakParts: number[];
}

/**
 * AI recommendation card analyzing practice scores to provide a personalized action plan and grammar review suggestions.
 */
export const AIStudyRecommendationCard: React.FC<AIStudyRecommendationCardProps> = ({
  scoreCorrect,
  scoreTotal,
  weakGrammarTopics,
  weakParts
}) => {
  const [data, setData] = useState<AIRecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedGrammarTopic, setSelectedGrammarTopic] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    axios
      .post<AIRecommendationData>('/api/generate/study-recommendations', {
        score_correct: scoreCorrect,
        score_total: scoreTotal,
        weak_grammar_topics: weakGrammarTopics,
        weak_parts: weakParts
      })
      .then((response) => {
        setData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch AI study recommendations:', error);
        setIsLoading(false);
      });
  }, [scoreCorrect, scoreTotal, weakGrammarTopics, weakParts]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme space-y-3 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-theme-accent" />
        <p className="text-theme-secondary font-medium text-sm">
          Gemini AI đang phân tích điểm yếu và tổng hợp lời khuyên ôn luyện dành riêng cho bạn...
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-theme-surface border border-theme shadow-2xl space-y-6 animate-in fade-in duration-300">
      {/* Module 17 Modal */}
      <GrammarQuickRefModal
        topicName={selectedGrammarTopic}
        onClose={() => setSelectedGrammarTopic(null)}
      />

      {/* Header */}
      <div className="flex items-center space-x-2 text-theme-accent font-extrabold text-lg sm:text-xl">
        <Sparkles className="w-6 h-6" />
        <h2>LỜI KHUYÊN CHIẾN LƯỢC TỪ CỐ VẤN AI (PERSONALIZED STUDY PLAN)</h2>
      </div>

      {/* Overall Evaluation */}
      <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl space-y-1">
        <div className="flex items-center space-x-2 text-xs font-bold text-theme-accent uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Đánh giá phong độ & Khoảng điểm ước tính</span>
        </div>
        <p className="text-theme-primary text-sm font-medium leading-relaxed">
          {data.overall_evaluation}
        </p>
      </div>

      {/* Target Action Plan */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-theme-accent uppercase tracking-wider">
          <Target className="w-4 h-4" />
          <span>Kế hoạch hành động cụ thể</span>
        </div>
        <ul className="space-y-2">
          {data.target_action_plan.map((action, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-sm text-theme-primary bg-theme-surface-2 p-3 rounded-xl border border-theme">
              <CheckCircle2 className="w-4 h-4 text-theme-success shrink-0 mt-0.5" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Grammar Topics to Review (Clickable Module 17 Badges) */}
      {data.grammar_to_review && data.grammar_to_review.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-theme-accent uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Chủ điểm ngữ pháp cần ôn lại khẩn cấp (Bấm để mở Thẻ Ôn Nhanh)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.grammar_to_review.map((grammarTopic, index) => (
              <button
                key={index}
                onClick={() => setSelectedGrammarTopic(grammarTopic)}
                className="px-3 py-1.5 rounded-xl bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent border border-theme-accent/30 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{grammarTopic}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Vocab Albums */}
      {data.recommended_vocab_focus && data.recommended_vocab_focus.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-theme-secondary uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Album từ vựng thương mại khuyến nghị làm Flashcard</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.recommended_vocab_focus.map((vocabCategory, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-xl bg-theme-surface-2 text-theme-primary border border-theme text-xs font-semibold capitalize"
              >
                {vocabCategory}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
