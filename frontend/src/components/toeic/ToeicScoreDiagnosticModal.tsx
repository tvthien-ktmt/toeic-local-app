import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Headphones,
  BookOpen,
  Target,
  ArrowRight,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import type { FullToeicScoreSummary } from '../../utils/fullToeicScoreCalculator';
import { ToeicPartBreakdownSection } from './ToeicPartBreakdownSection';
import { ToeicCompetencyBreakdownSection } from './ToeicCompetencyBreakdownSection';

interface ToeicScoreDiagnosticModalProps {
  scoreSummary: FullToeicScoreSummary;
  targetScore?: number;
  testTitle?: string;
  onReviewAnswers: () => void;
  onRetestWeakQuestions?: () => void;
  onNavigateHome: () => void;
}

/**
 * Study4-grade Full 2-Skill TOEIC Diagnostic & Score Result Modal.
 * Scaled score 10-990, Part 1-7 analytics, competency breakdown, and AI actionable recommendations.
 */
export const ToeicScoreDiagnosticModal: React.FC<ToeicScoreDiagnosticModalProps> = ({
  scoreSummary,
  targetScore = 750,
  testTitle = 'TOEIC Full 2-Skill Mock Test',
  onReviewAnswers,
  onRetestWeakQuestions,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'competencies'>('overview');

  const scoreGap = Math.max(0, targetScore - scoreSummary.totalScore);
  const targetProgressPercent = Math.min(100, Math.round((scoreSummary.totalScore / targetScore) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-theme/50 flex items-center justify-between flex-wrap gap-3 bg-linear-to-r from-theme-surface to-theme-surface-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Báo Cáo Điểm Chuẩn ETS TOEIC 2 Kỹ Năng</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-theme-primary tracking-tight">
              {testTitle}
            </h2>
            <p className="text-xs text-theme-secondary">
              {scoreSummary.levelTitle} &bull; Độ chính xác {scoreSummary.accuracyPercentage}% ({scoreSummary.totalCorrectCount}/{scoreSummary.totalQuestions} câu)
            </p>
          </div>

          {/* Tab Filter Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-surface border border-theme">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Tổng Quan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'parts'
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              7 Parts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('competencies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'competencies'
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Dạng Kỹ Năng
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 3 Main Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Score */}
                <div className="p-5 rounded-3xl bg-linear-to-br from-indigo-600 to-purple-700 text-white shadow-lg space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
                      Điểm Tổng TOEIC
                    </span>
                    <Award className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-4xl font-black tracking-tight">
                      {scoreSummary.totalScore}
                      <span className="text-lg font-normal text-indigo-200">/990</span>
                    </div>
                    <p className="text-[11px] text-indigo-100 mt-0.5">
                      Quy đổi thang điểm chuẩn ETS
                    </p>
                  </div>
                </div>

                {/* Listening Score */}
                <div className="p-5 rounded-3xl bg-theme-surface-2 border border-theme space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
                      Listening (LC)
                    </span>
                    <Headphones className="w-5 h-5 text-theme-accent" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-theme-primary tracking-tight">
                      {scoreSummary.listeningScore}
                      <span className="text-sm font-normal text-theme-secondary">/495</span>
                    </div>
                    <p className="text-[11px] text-theme-secondary mt-0.5">
                      Đúng {scoreSummary.listeningCorrectCount} câu
                    </p>
                  </div>
                </div>

                {/* Reading Score */}
                <div className="p-5 rounded-3xl bg-theme-surface-2 border border-theme space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
                      Reading (RC)
                    </span>
                    <BookOpen className="w-5 h-5 text-theme-warning" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-theme-primary tracking-tight">
                      {scoreSummary.readingScore}
                      <span className="text-sm font-normal text-theme-secondary">/495</span>
                    </div>
                    <p className="text-[11px] text-theme-secondary mt-0.5">
                      Đúng {scoreSummary.readingCorrectCount} câu
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Progression Gap Bar */}
              <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-theme-primary flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-theme-warning" />
                    <span>Mục tiêu điểm đề ra: {targetScore} TOEIC</span>
                  </span>
                  <span className="font-bold text-theme-accent">
                    {scoreGap === 0 ? 'Đã đạt mục tiêu! 🎉' : `Còn thiếu ${scoreGap} điểm (${targetProgressPercent}%)`}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-theme-surface border border-theme overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-theme-accent via-indigo-500 to-theme-warning transition-all duration-700"
                    style={{ width: `${targetProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* 3 Actionable Recommendations */}
              <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3">
                <h4 className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>3 Hành Động Đề Xuất Cần Làm Ngay Hôm Nay:</span>
                </h4>

                <div className="space-y-2">
                  {scoreSummary.recommendedActions.map((actionText, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-theme-surface border border-theme flex items-start gap-2.5 text-xs text-theme-primary"
                    >
                      <span className="w-5 h-5 rounded-lg bg-theme-accent/15 text-theme-accent font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="leading-relaxed">{actionText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PART BREAKDOWN (Part 1 - 7) */}
          {activeTab === 'parts' && (
            <ToeicPartBreakdownSection partBreakdown={scoreSummary.partBreakdown} />
          )}

          {/* TAB 3: COMPETENCY BREAKDOWN */}
          {activeTab === 'competencies' && (
            <ToeicCompetencyBreakdownSection competencyList={scoreSummary.competencyList} />
          )}
        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-theme/50 bg-theme-surface flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-5 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 transition-colors cursor-pointer"
          >
            Về Trang Chủ
          </button>

          <div className="flex items-center gap-2.5">
            {onRetestWeakQuestions && (
              <button
                type="button"
                onClick={onRetestWeakQuestions}
                className="px-5 py-2.5 rounded-xl bg-theme-warning/15 text-theme-warning border border-theme-warning/30 text-xs font-bold hover:bg-theme-warning/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Luyện Lại Câu Sai (SRS)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReviewAnswers}
              className="px-6 py-2.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem Lời Giải Chi Tiết</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
