import React from 'react';
import { BookOpen, CheckCircle2, Layers, TrendingUp, Clock, Activity, Zap, Target } from 'lucide-react';
import type { DashboardSummaryData } from '../api/documents';

interface DashboardStatCardsProps {
  summary: DashboardSummaryData;
}

/**
 * Metric cards grid displaying total vocabulary, mastered flashcards, practice accuracy, and estimated study time.
 */
export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ summary }) => {
  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Vocab */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
              Tổng số từ vựng
            </span>
            <div className="p-2.5 rounded-2xl bg-theme-accent/15 text-theme-accent">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-theme-primary">{summary.total_vocab}</div>
            <p className="text-xs text-theme-secondary mt-1">Từ đã trích xuất từ đề thi</p>
          </div>
        </div>

        {/* Card 2: Learned Vocab */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
              Đã thuộc (SRS &ge; 3)
            </span>
            <div className="p-2.5 rounded-2xl alert-success text-theme-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-theme-success">{summary.learned_vocab}</div>
            <div className="w-full bg-theme-surface-2 h-1.5 rounded-full mt-2 overflow-hidden border border-theme">
              <div
                className="bg-theme-success h-full transition-all duration-300"
                style={{
                  width: `${
                    summary.total_vocab > 0
                      ? (summary.learned_vocab / summary.total_vocab) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Unlearned */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
              Cần ôn tập tiếp
            </span>
            <div className="p-2.5 rounded-2xl alert-warning text-theme-warning">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-theme-warning">{summary.unlearned_vocab}</div>
            <p className="text-xs text-theme-secondary mt-1">Từ chưa đạt mức nhớ sâu</p>
          </div>
        </div>

        {/* Card 4: Overall Practice Accuracy */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
              Độ chính xác luyện tập
            </span>
            <div className="p-2.5 rounded-2xl bg-theme-accent/15 text-theme-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-theme-primary">
              {summary.overall_accuracy}%
            </div>
            <p className="text-xs text-theme-secondary mt-1">
              Tổng số {summary.total_attempts} câu đã làm
            </p>
          </div>
        </div>
      </div>

      {/* Module 20: Study Time & Consistency Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-accent">
            <Clock className="w-4 h-4" />
            <span>THỜI GIAN HỌC 7 NGÀY</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.total_study_min_7d || 0}{' '}
            <span className="text-sm font-normal text-theme-secondary">phút</span>
          </p>
          <span className="text-[11px] text-theme-secondary block">
            Tích lũy từ flashcard, quiz & luyện tập
          </span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-accent">
            <Activity className="w-4 h-4" />
            <span>MỨC ĐỘ ĐỀU ĐẶN</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.active_days_7d || 0} / 7{' '}
            <span className="text-sm font-normal text-theme-secondary">ngày</span>
          </p>
          <span className="text-[11px] text-theme-secondary block">
            {(summary.active_days_7d || 0) >= 4 ? 'Duy trì phong độ rất tốt!' : 'Cần học đều đặn hơn'}
          </span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-accent">
            <Zap className="w-4 h-4" />
            <span>TỔNG CÂU ĐÃ LUYỆN</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.total_attempts || 0}{' '}
            <span className="text-sm font-normal text-theme-secondary">câu</span>
          </p>
          <span className="text-[11px] text-theme-secondary block">
            Đúng {summary.total_learned_correct || 0} câu ({summary.overall_accuracy}%)
          </span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-accent">
            <Target className="w-4 h-4" />
            <span>TỪ VỰNG NHỚ SÂU</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.learned_vocab || 0} / {summary.total_vocab || 0}
          </p>
          <span className="text-[11px] text-theme-secondary block">
            Đạt mốc SRS Level &ge; 3
          </span>
        </div>
      </div>
    </div>
  );
};
