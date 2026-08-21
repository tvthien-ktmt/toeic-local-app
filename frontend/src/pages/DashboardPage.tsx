import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary, type DashboardSummaryData } from '../api/documents';
import { RefreshCw, Sparkles } from 'lucide-react';
import { AIStudyRecommendationCard } from '../components/AIStudyRecommendationCard';
import { DashboardStatCards } from '../components/DashboardStatCards';
import { DashboardWeaknessSection } from '../components/DashboardWeaknessSection';
import { DashboardExamHistorySection } from '../components/DashboardExamHistorySection';
import { CoverageMatrixSection } from '../components/CoverageMatrixSection';
import { DashboardAdaptivePlanSection } from '../components/DashboardAdaptivePlanSection';

interface DashboardPageProps {
  onNavigateTab?: (tab: 'textbooks' | 'upload' | 'practice' | 'flashcards' | 'dashboard' | 'roadmap' | 'errors' | 'speed') => void;
}

/**
 * Main learning dashboard view displaying overall study statistics, mastery charts, AI study recommendations, 5-step adaptive plan, coverage matrix, and exam history.
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then((response) => {
        setSummary(response);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch dashboard summary:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-theme-secondary">
        <RefreshCw className="w-8 h-8 animate-spin text-theme-accent" />
        <p className="text-sm font-medium">Đang tổng hợp dữ liệu học tập...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 text-center text-theme-secondary space-y-2">
        <p className="text-base font-semibold">Không thể nạp dữ liệu thống kê.</p>
        <p className="text-xs">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const {
    part_stats = [],
    topic_progress = [],
    grammar_stats = [],
    examHistory = [],
    weaknessData = [],
    estimated_rc_range,
    target_tracker,
    today_adaptive_plan = [],
  } = summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <div className="flex items-center space-x-2 text-theme-accent text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>HỆ THỐNG PHÂN TÍCH NĂNG LỰC TOÀN DIỆN (RC_FORMAT.MD & PROJECT_REQUIMENTS.MD)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
          Dashboard Tổng Quan Luyện Thi TOEIC RC
        </h1>
      </div>

      {/* Top 5 Core Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Estimated RC Score Range */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-theme-secondary tracking-wider">
              1. Trình độ ước tính hiện tại
            </span>
            <h3 className="text-xl font-black text-theme-primary">Dải Điểm TOEIC RC</h3>
          </div>

          <div className="space-y-2 py-2">
            <div className="text-4xl font-black text-theme-accent tracking-tight">
              {estimated_rc_range ? `${estimated_rc_range.min_score} - ${estimated_rc_range.max_score}` : '620 - 680'}
              <span className="text-sm font-semibold text-theme-secondary ml-2">/ 495</span>
            </div>
            <div className="text-xs text-theme-secondary font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-theme-success" />
              <span>Độ tin cậy: <strong className="text-theme-primary">{estimated_rc_range?.confidence || 'High'}</strong></span>
            </div>
          </div>

          <p className="text-[11px] text-theme-secondary leading-relaxed">
            Ước tính dựa trên điểm thi thử đã scaled và độ chính xác luyện tập thực tế.
          </p>
        </div>

        {/* Card 2: Target & Gap Tracker */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-theme-secondary tracking-wider">
              2. Mục tiêu & Khoảng cách (Gap)
            </span>
            <h3 className="text-xl font-black text-theme-primary">Target: 420 RC (800+)</h3>
          </div>

          <div className="space-y-2 py-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-theme-warning">
                Còn thiếu {target_tracker ? target_tracker.gap : 75} điểm
              </span>
              <span className="text-xs font-bold text-theme-success">
                {target_tracker ? target_tracker.progress_pct : 72}% Tiến độ
              </span>
            </div>
            <div className="w-full bg-theme-surface-2 h-2.5 rounded-full overflow-hidden border border-theme">
              <div
                className="bg-theme-warning h-full rounded-full transition-all duration-500"
                style={{ width: `${target_tracker ? target_tracker.progress_pct : 72}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-theme-secondary leading-relaxed">
            Duy trì lộ trình học hàng ngày để rút ngắn khoảng cách điểm số.
          </p>
        </div>

        {/* Card 3: Primary Weaknesses */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-theme-secondary tracking-wider">
              3. Điểm yếu chí mạng
            </span>
            <h3 className="text-xl font-black text-theme-primary">Top Lỗi Cần Khắc Phục</h3>
          </div>

          <div className="space-y-1.5 py-1">
            {(summary.primary_weaknesses || ['Word Form (Từ loại)', 'Prepositions (Giới từ)', 'Part 7 Inference (Suy luận)']).map((weakTopic, idx) => (
              <div key={weakTopic} className="flex items-center gap-2 text-xs font-semibold text-theme-primary">
                <span className="w-5 h-5 rounded-md bg-theme-error/15 text-theme-error font-bold text-[10px] flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="truncate">{weakTopic}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('errors')}
            className="text-xs font-bold text-theme-accent hover:underline text-left cursor-pointer"
          >
            Mở Sổ Tay Lỗi Sai để ôn lại &rarr;
          </button>
        </div>
      </div>

      {/* 5-Step Personalized Daily Action Plan */}
      <DashboardAdaptivePlanSection
        todayAdaptivePlan={today_adaptive_plan}
        onNavigateTab={onNavigateTab}
      />

      {/* Coverage Matrix Section (RC_Format.md Section 25) */}
      <CoverageMatrixSection />

      {/* AI Personalized Recommendation Engine */}
      <AIStudyRecommendationCard
        scoreCorrect={summary.total_learned_correct || summary.learned_vocab || 0}
        scoreTotal={summary.total_attempts || summary.total_vocab || 1}
        weakGrammarTopics={grammar_stats
          .filter((grammarStat) => grammarStat.accuracy_rate < 60)
          .map((grammarStat) => grammarStat.grammar_topic)}
        weakParts={part_stats
          .filter((partStat) => partStat.accuracy_rate < 60)
          .map((_, index) => index + 5)}
      />

      {/* Overview Stat Cards */}
      <DashboardStatCards summary={summary} />

      {/* Accuracy By Part & Grammar Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Part Stats & Weak Grammar Areas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-4">
            <h2 className="text-base font-bold text-theme-primary">
              Tỉ Lệ Chính Xác Theo Từng Part
            </h2>
            <div className="space-y-4">
              {part_stats.map((partStat) => (
                <div key={partStat.part_name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-theme-primary">{partStat.part_name}</span>
                    <span
                      className={
                        partStat.accuracy_rate >= 70
                          ? 'text-theme-success'
                          : partStat.accuracy_rate >= 50
                          ? 'text-theme-warning'
                          : 'text-theme-error'
                      }
                    >
                      {partStat.accuracy_rate}% ({partStat.total_attempts} câu)
                    </span>
                  </div>
                  <div className="w-full bg-theme-surface-2 h-2.5 rounded-full overflow-hidden border border-theme">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        partStat.accuracy_rate >= 70
                          ? 'bg-theme-success'
                          : partStat.accuracy_rate >= 50
                          ? 'bg-theme-warning'
                          : 'bg-theme-error'
                      }`}
                      style={{ width: `${partStat.accuracy_rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar Accuracy Ranking */}
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-4">
            <h2 className="text-base font-bold text-theme-primary">
              Chủ Điểm Ngữ Pháp Cần Chú Ý (Part 5 & 6)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grammar_stats.slice(0, 6).map((grammarStat) => (
                <div
                  key={grammarStat.grammar_topic}
                  className="p-3.5 rounded-2xl bg-theme-surface-2 border border-theme flex items-center justify-between space-x-2"
                >
                  <span className="text-xs font-semibold text-theme-primary truncate max-w-[140px]">
                    {grammarStat.grammar_topic}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      grammarStat.accuracy_rate >= 70
                        ? 'alert-success text-theme-success'
                        : grammarStat.accuracy_rate >= 50
                        ? 'alert-warning text-theme-warning'
                        : 'alert-error text-theme-error'
                    }`}
                  >
                    {grammarStat.accuracy_rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Vocab Topic Progress */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-4">
          <h2 className="text-base font-bold text-theme-primary">Tiến Độ Từ Vựng Theo Chủ Đề</h2>
          <div className="space-y-4">
            {topic_progress.map((topicItem) => (
              <div key={topicItem.topic_category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-theme-primary capitalize">
                    {topicItem.topic_category}
                  </span>
                  <span className="text-theme-secondary font-medium">
                    {topicItem.learned_words}/{topicItem.total_words} ({topicItem.mastery_rate}%)
                  </span>
                </div>
                <div className="w-full bg-theme-surface-2 h-2 rounded-full overflow-hidden border border-theme">
                  <div
                    className="bg-theme-accent h-full rounded-full transition-all duration-300"
                    style={{ width: `${topicItem.mastery_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakness & Exam History Sections */}
      <DashboardWeaknessSection
        weaknessData={weaknessData}
        examHistoryLength={examHistory.length}
      />
      <DashboardExamHistorySection examHistory={examHistory} />
    </div>
  );
};
