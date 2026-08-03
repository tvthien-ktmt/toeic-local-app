import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, BookOpen, Target, Award, Flame, RefreshCw, AlertCircle, Layers, Clock, Zap, Activity } from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  summary: {
    total_vocab: number;
    learned_vocab: number;
    unlearned_vocab?: number;
    total_questions?: number;
    unpracticed_questions?: number;
    mastery_percentage: number;
    total_attempts: number;
    overall_accuracy: number;
    total_study_min_7d?: number;
    total_study_min_30d?: number;
    active_days_7d?: number;
    active_days_30d?: number;
    part5_avg_speed_sec?: number;
    part6_avg_speed_sec?: number;
    part7_avg_speed_sec?: number;
  };
  part_stats: Array<{
    part_name: string;
    total_attempts: number;
    accuracy_rate: number;
  }>;
  topic_progress: Array<{
    topic_category: string;
    total_words: number;
    learned_words: number;
    mastery_rate: number;
  }>;
  grammar_stats: Array<{
    grammar_topic: string;
    total_attempts: number;
    accuracy_rate: number;
  }>;
  daily_history: Array<{
    date: string;
    attempts: number;
  }>;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Không thể kết nối đến server để lấy số liệu thống kê.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
        <p className="text-slate-400 font-medium text-sm">Đang tổng hợp dữ liệu thống kê từ SQLite...</p>
      </div>
    );
  }

  if (errorMsg || !stats) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-center space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
        <p className="font-semibold text-sm">{errorMsg || 'Chưa có dữ liệu thống kê.'}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { summary, part_stats, topic_progress, grammar_stats, daily_history } = stats;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
            Dashboard Tiến Độ Học Tập & Tốc Độ
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Số liệu thời gian học thực tế, theo dõi độ đều đặn 7/30 ngày & tốc độ làm bài theo Part
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* Module 20: Study Time & Consistency Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400">
            <Clock className="w-4 h-4" />
            <span>THỜI GIAN HỌC 7 NGÀY</span>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {summary.total_study_min_7d || 0} <span className="text-sm font-normal text-slate-400">phút</span>
          </p>
          <span className="text-[11px] text-slate-400 block">Tích lũy từ flashcard, quiz & luyện tập</span>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400">
            <Activity className="w-4 h-4" />
            <span>MỨC ĐỘ ĐỀU ĐẶN</span>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {summary.active_days_7d || 0} / 7 <span className="text-sm font-normal text-slate-400">ngày</span>
          </p>
          <span className="text-[11px] text-slate-400 block">Số ngày có học trong tuần qua</span>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>TỪ VỰNG THUỘC (SRS $\ge$ 3)</span>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {summary.learned_vocab} / {summary.total_vocab}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            Còn {summary.unlearned_vocab || 0} từ chưa thuộc
          </span>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
            <Target className="w-4 h-4" />
            <span>CÂU HỎI ĐÃ LUYỆN</span>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {summary.total_attempts} <span className="text-sm font-normal text-slate-400">lượt</span>
          </p>
          <span className="text-[11px] text-amber-400 font-semibold block">
            Chính xác {summary.overall_accuracy}%
          </span>
        </div>
      </div>

      {/* Module 19: Speed Analytics Cards by Part */}
      <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2>Tốc Độ Làm Bài Trung Bình So Với Mục Tiêu (Time Budgeting)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Part 5 Speed Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>PART 5 — Câu ngắn</span>
              <span>Mục tiêu: 20s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white">
                {summary.part5_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-slate-400">/ câu</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (summary.part5_avg_speed_sec || 0) <= 20
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, ((summary.part5_avg_speed_sec || 0) / 20) * 100)}%` }}
              />
            </div>
          </div>

          {/* Part 6 Speed Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300">
              <span>PART 6 — Đoạn văn</span>
              <span>Mục tiêu: 37s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white">
                {summary.part6_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-slate-400">/ câu</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (summary.part6_avg_speed_sec || 0) <= 37
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, ((summary.part6_avg_speed_sec || 0) / 37) * 100)}%` }}
              />
            </div>
          </div>

          {/* Part 7 Speed Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>PART 7 — Đọc hiểu</span>
              <span>Mục tiêu: 60s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white">
                {summary.part7_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-slate-400">/ câu</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (summary.part7_avg_speed_sec || 0) <= 60
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, ((summary.part7_avg_speed_sec || 0) / 60) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Rate by Part */}
      <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <Target className="w-5 h-5 text-indigo-400" />
          <h2>Tỉ Lệ Chính Xác Theo Từng Phần Thi (Part Accuracy)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {part_stats.map((p, idx) => (
            <div key={idx} className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-300 block">{p.part_name}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400">{p.accuracy_rate}%</span>
                <span className="text-xs text-slate-400 font-mono">{p.total_attempts} lượt</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${p.accuracy_rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Albums & Grammar Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Albums */}
        <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2>Tiến Độ Album Từ Vựng Theo Chủ Đề</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {topic_progress.map((tp, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 capitalize">{tp.topic_category}</span>
                  <span className="font-mono text-purple-300 font-bold">{tp.learned_words}/{tp.total_words} từ ({tp.mastery_rate}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full transition-all" style={{ width: `${tp.mastery_rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Topics */}
        <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2>Tỉ Lệ Chính Xác Ngữ Pháp Part 5/6</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {grammar_stats.map((g, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{g.grammar_topic}</span>
                  <span className="font-mono text-amber-300 font-bold">{g.accuracy_rate}% ({g.total_attempts} lượt)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${g.accuracy_rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
