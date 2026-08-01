import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, BookOpen, Target, Award, Flame, RefreshCw, AlertCircle, Layers } from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  summary: {
    total_vocab: number;
    learned_vocab: number;
    mastery_percentage: number;
    total_attempts: number;
    overall_accuracy: number;
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
      const res = await axios.get('http://127.0.0.1:8000/api/dashboard/stats');
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
            Dashboard Tiến Độ Học Tập Đa Chiều
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tổng hợp dữ liệu thực tế từ SQLite (SRS Level $\ge$ 3, Practice Attempts)
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tải lại số liệu</span>
        </button>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              {summary.mastery_percentage}% Đã Thuộc
            </span>
          </div>
          <div className="text-3xl font-black text-white">{summary.learned_vocab} / {summary.total_vocab}</div>
          <p className="text-xs text-slate-400 font-medium">Từ vựng đã làm chủ (SRS Level $\ge$ 3)</p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${Math.min(summary.mastery_percentage, 100)}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <Target className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Độ Chính Xác
            </span>
          </div>
          <div className="text-3xl font-black text-white">{summary.overall_accuracy}%</div>
          <p className="text-xs text-slate-400 font-medium">Tỷ lệ trả lời đúng tổng thể</p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(summary.overall_accuracy, 100)}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Flame className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Lượt Luyện Tập
            </span>
          </div>
          <div className="text-3xl font-black text-white">{summary.total_attempts}</div>
          <p className="text-xs text-slate-400 font-medium">Tổng lượt câu hỏi & từ vựng đã làm</p>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              Topic Albums
            </span>
          </div>
          <div className="text-3xl font-black text-white">{topic_progress.length}</div>
          <p className="text-xs text-slate-400 font-medium">Chủ đề từ vựng đã được AI phân loại</p>
        </div>
      </div>

      {/* Part Breakdown & Grammar Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Progress by Part */}
        <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Tiến Độ Độ Chính Xác Theo Part
            </h2>
            <span className="text-xs text-slate-400">Tỷ lệ đúng %</span>
          </div>

          <div className="space-y-4">
            {part_stats.map((part) => (
              <div key={part.part_name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{part.part_name}</span>
                  <span className="text-indigo-400 font-mono">{part.accuracy_rate}% ({part.total_attempts} lượt)</span>
                </div>
                <div className="w-full bg-slate-700/70 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(part.accuracy_rate, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Topics Accuracy */}
        <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Chủ Điểm Ngữ Pháp Yếu / Mạnh (Part 5/6)
            </h2>
            <span className="text-xs text-slate-400">Theo SQLite Attempts</span>
          </div>

          {grammar_stats.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">Chưa có lượt làm bài Part 5/6 nào.</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {grammar_stats.map((item) => (
                <div key={item.grammar_topic} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/40 text-xs">
                  <span className="font-semibold text-slate-200 capitalize">{item.grammar_topic}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{item.total_attempts} câu</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                      item.accuracy_rate >= 80 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' :
                      item.accuracy_rate >= 50 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' :
                      'bg-red-500/10 text-red-300 border border-red-500/30'
                    }`}>
                      {item.accuracy_rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Progress by Topic Album */}
      <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Tiến Độ Làm Chủ Theo Album Chủ Đề
          </h2>
          <span className="text-xs text-slate-400">Từ vựng srs_level $\ge$ 3</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {topic_progress.map((t) => (
            <div key={t.topic_category} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                <span className="capitalize text-indigo-300">{t.topic_category}</span>
                <span className="font-mono text-emerald-400">{t.mastery_rate}%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Đã thuộc {t.learned_words} / {t.total_words} từ</p>
              <div className="w-full bg-slate-700/70 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${t.mastery_rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Activity History */}
      <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Lịch Sử Luyện Tập 14 Ngày Gần Nhất
          </h2>
          <span className="text-xs text-slate-400">Activity Log</span>
        </div>

        {daily_history.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">Chưa có lượt ghi nhận học tập nào trong 14 ngày qua.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {daily_history.map((day) => (
              <div key={day.date} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center space-y-1">
                <p className="text-[10px] text-slate-400 font-mono">{day.date}</p>
                <p className="text-lg font-bold text-indigo-300">{day.attempts} câu</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
