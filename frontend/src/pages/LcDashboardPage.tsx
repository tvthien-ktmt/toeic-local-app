import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  Clock,
  Target,
  Flame,
  AlertTriangle,
  Play,
  ShieldAlert,
} from 'lucide-react';
import { LcDashboardTodayPlanSection } from '../components/toeic/listening/LcDashboardTodayPlanSection';

interface LcDashboardPageProps {
  onNavigateTab?: (tab: string) => void;
  onStartExam?: () => void;
}

/**
 * Dedicated TOEIC Listening Dashboard Page.
 * Displays score analytics (scaled 5-495), weakness diagnostics, target score progression, and Today's LC Study Plan.
 */
export const LcDashboardPage: React.FC<LcDashboardPageProps> = ({ onNavigateTab, onStartExam }) => {
  const [targetScore, setTargetScore] = useState<number>(400);

  const currentScore = 365;
  const scoreGap = Math.max(0, targetScore - currentScore);

  const progressPercent = Math.min(100, Math.round((currentScore / targetScore) * 100));

  const stats = [
    { label: 'Điểm LC Hiện Tại', value: `${currentScore}/495`, sub: 'Ước tính chuẩn ETS', icon: <Award className="w-5 h-5 text-theme-accent" /> },
    { label: 'Điểm Mục Tiêu', value: `${targetScore} LC`, sub: `Còn cách ${scoreGap} điểm`, icon: <Target className="w-5 h-5 text-theme-warning" /> },
    { label: 'Chuỗi Ngày Học', value: '14 Ngày', sub: 'Đang giữ phong độ tốt', icon: <Flame className="w-5 h-5 text-theme-error" /> },
    { label: 'Thời Gian Luyện', value: '18.5 Giờ', sub: 'Đã hoàn thành 6 đề', icon: <Clock className="w-5 h-5 text-theme-success" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-theme/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Phân Tích Năng Lực TOEIC Listening</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
            Dashboard Tiến Trình &amp; Chẩn Đoán Điểm Yếu LC
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Theo dõi sự tăng trưởng điểm số, xác định cạm bẫy hay mắc phải và hoàn thành kế hoạch học cá nhân hóa hôm nay.
          </p>
        </div>

        {/* Quick Test Starter */}
        <button
          onClick={() => onStartExam && onStartExam()}
          className="px-5 py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Vào Phòng Thi Thử LC 45m</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl bg-theme-surface border border-theme shadow-sm space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-theme-secondary">
                {stat.label}
              </span>
              <div className="p-2 rounded-xl bg-theme-surface-2 border border-theme">
                {stat.icon}
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
                {stat.value}
              </div>
              <p className="text-[11px] text-theme-secondary mt-0.5">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Target Progress Bar Card */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-blue-100 font-semibold">
              Kế hoạch tăng điểm LC cá nhân hóa
            </span>
            <h3 className="text-lg sm:text-2xl font-black">
              Mục tiêu: {targetScore} LC &bull; Đã đạt {progressPercent}% chặng đường
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-100">Đổi mục tiêu:</span>
            <select
              value={targetScore}
              onChange={(event) => setTargetScore(parseInt(event.target.value, 10))}
              className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs border border-white/30 focus:outline-none cursor-pointer"
            >
              <option value={350} className="text-black">350 LC</option>
              <option value={400} className="text-black">400 LC</option>
              <option value={450} className="text-black">450 LC</option>
              <option value={490} className="text-black">490 LC</option>
            </select>
          </div>
        </div>

        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500 rounded-full shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-blue-100 font-medium">
          <span>Điểm khởi đầu: 250 LC</span>
          <span>Hiện tại: {currentScore} LC</span>
          <span>Đích đến: {targetScore} LC</span>
        </div>
      </div>

      {/* 2 Column Layout: Today's Plan & Weakness Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Today's Plan */}
        <LcDashboardTodayPlanSection onNavigateTab={onNavigateTab} />

        {/* Right 5 cols: Weakness Diagnosis */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-theme-warning" />
              <span>Bản Đồ Điểm Yếu Cần Khắc Phục</span>
            </h3>
          </div>

          <div className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-4">
            {/* Accuracy by Part */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-theme-primary">
                <span>Part 1: Photographs</span>
                <span className="text-theme-success">92% (Tốt)</span>
              </div>
              <div className="w-full h-1.5 bg-theme-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-theme-success" style={{ width: '92%' }} />
              </div>

              <div className="flex items-center justify-between font-semibold text-theme-primary pt-1">
                <span>Part 2: Question &amp; Response</span>
                <span className="text-theme-accent">80% (Khá)</span>
              </div>
              <div className="w-full h-1.5 bg-theme-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-theme-accent" style={{ width: '80%' }} />
              </div>

              <div className="flex items-center justify-between font-semibold text-theme-primary pt-1">
                <span>Part 3: Conversations</span>
                <span className="text-theme-warning">64% (Cần Cải Thiện)</span>
              </div>
              <div className="w-full h-1.5 bg-theme-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-theme-warning" style={{ width: '64%' }} />
              </div>

              <div className="flex items-center justify-between font-semibold text-theme-primary pt-1">
                <span>Part 4: Short Talks</span>
                <span className="text-theme-warning">71% (Trung Bình)</span>
              </div>
              <div className="w-full h-1.5 bg-theme-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-theme-warning" style={{ width: '71%' }} />
              </div>
            </div>

            {/* Diagnostic Alert */}
            <div className="p-3 rounded-xl alert-warning border border-theme-warning/30 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1 text-theme-warning">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Chẩn đoán mất điểm lớn nhất:</span>
              </div>
              <p className="text-theme-primary/90 text-[11px] leading-relaxed">
                Bạn đang mất tới 60% tổng số câu sai ở <strong>Part 3 dạng câu hỏi suy luận (Inference)</strong> và <strong>bị bẫy lặp lại từ trong Part 2</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LcDashboardPage;
