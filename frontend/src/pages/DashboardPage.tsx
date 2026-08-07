import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, BookOpen, Target, RefreshCw, AlertCircle, Layers, Clock, Zap, Activity, TrendingDown, AlertTriangle } from 'lucide-react';
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
}

interface ExamHistoryItem {
  id: number;
  document_id: number;
  exam_title: string;
  mode: string;
  raw_score: number;
  total_questions: number;
  toeic_score: number;
  time_spent_seconds: number;
  part5_correct: number;
  part6_correct: number;
  part7_correct: number;
  completed_at: string;
}

interface WeaknessTopic {
  grammar_topic: string;
  total_questions: number;
  correct: number;
  wrong: number;
  skipped: number;
  error_rate: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([]);
  const [weaknessData, setWeaknessData] = useState<WeaknessTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [statsRes, historyRes, weaknessRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/textbooks/history'),
        axios.get('/api/textbooks/weakness-report')
      ]);
      setStats(statsRes.data);
      if (historyRes.data.status === 'success') {
        setExamHistory(historyRes.data.history);
      }
      if (weaknessRes.data.status === 'success') {
        setWeaknessData(weaknessRes.data.weakest_topics || []);
      }
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
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-theme-accent" />
        <p className="text-theme-secondary font-medium text-sm">Đang tổng hợp dữ liệu thống kê từ SQLite...</p>
      </div>
    );
  }

  if (errorMsg || !stats) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl alert-error text-center space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto alert-error-icon" />
        <p className="font-semibold text-sm">{errorMsg || 'Chưa có dữ liệu thống kê.'}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-theme-surface hover:bg-theme-surface-2 text-theme-primary text-xs font-bold border border-theme transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { summary, part_stats, topic_progress, grammar_stats } = stats;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-theme-primary tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-theme-accent" />
            Dashboard Tiến Độ Học Tập & Tốc Độ
          </h1>
          <p className="text-theme-secondary text-sm mt-1">
            Số liệu thời gian học thực tế, theo dõi độ đều đặn 7/30 ngày & tốc độ làm bài theo Part
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary text-xs font-semibold border border-theme transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* Module 20: Study Time & Consistency Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-accent">
            <Clock className="w-4 h-4" />
            <span>THỜI GIAN HỌC 7 NGÀY</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.total_study_min_7d || 0} <span className="text-sm font-normal text-theme-secondary">phút</span>
          </p>
          <span className="text-[11px] text-theme-secondary block">Tích lũy từ flashcard, quiz & luyện tập</span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400">
            <Activity className="w-4 h-4" />
            <span>MỨC ĐỘ ĐỀU ĐẶN</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.active_days_7d || 0} / 7 <span className="text-sm font-normal text-theme-secondary">ngày</span>
          </p>
          <span className="text-[11px] text-theme-secondary block">Số ngày có học trong tuần qua</span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>TỪ VỰNG THUỘC (SRS $\ge$ 3)</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.learned_vocab} / {summary.total_vocab}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            Còn {summary.unlearned_vocab || 0} từ chưa thuộc
          </span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
            <Target className="w-4 h-4" />
            <span>CÂU HỎI ĐÃ LUYỆN</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.total_attempts} <span className="text-sm font-normal text-theme-secondary">lượt</span>
          </p>
          <span className="text-[11px] text-amber-400 font-semibold block">
            Chính xác {summary.overall_accuracy}%
          </span>
        </div>
      </div>

      {/* Module 19: Speed Analytics Cards by Part */}
      <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2>Tốc Độ Làm Bài Trung Bình So Với Mục Tiêu (Time Budgeting)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Part 5 Speed Card */}
          <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-theme-accent">
              <span>PART 5 — Câu ngắn</span>
              <span>Mục tiêu: 20s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-theme-primary">
                {summary.part5_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-theme-secondary">/ câu</span>
            </div>
            <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden">
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
          <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-400">
              <span>PART 6 — Đoạn văn</span>
              <span>Mục tiêu: 37s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-theme-primary">
                {summary.part6_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-theme-secondary">/ câu</span>
            </div>
            <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden">
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
          <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>PART 7 — Đọc hiểu</span>
              <span>Mục tiêu: 60s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-theme-primary">
                {summary.part7_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-theme-secondary">/ câu</span>
            </div>
            <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden">
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


      {/* ── WEAKNESS WIDGET: Chủ Điểm Hay Sai Nhất (Cross-exam analytics) ── */}
      {weaknessData.length > 0 && (
        <div className="bg-theme-surface rounded-3xl p-6 border border-rose-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              <h2>Chủ Điểm Hay Sai Nhất — Tích Luỹ Qua Các Lần Thi</h2>
            </div>
            <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full font-semibold">
              {weaknessData.filter(w => w.error_rate >= 40).length} chủ điểm cần ôn ngay
            </span>
          </div>
          <p className="text-xs text-theme-secondary">Phân tích tổng hợp từ {examHistory.length} lần thi. Những chủ điểm có tỉ lệ sai cao nhất cần ôn lại trước kỳ thi.</p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {weaknessData.slice(0, 10).map((w, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex items-center gap-3 ${
                w.error_rate >= 60 ? 'bg-rose-500/10 border-rose-500/30' :
                w.error_rate >= 40 ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-theme-surface-2 border-theme'
              }`}>
                <span className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                  w.error_rate >= 60 ? 'bg-rose-500/20 text-rose-400' :
                  w.error_rate >= 40 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>{Math.round(w.error_rate)}%</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-theme-primary truncate">{w.grammar_topic}</div>
                  <div className="text-[10px] text-theme-secondary">
                    ❌ {w.wrong} sai • ⬜ {w.skipped} bỏ trống • ✓ {w.correct} đúng (/{w.total_questions})
                  </div>
                </div>
                <div className="w-24 h-2 rounded-full bg-theme-surface-3 overflow-hidden shrink-0">
                  <div
                    className={`h-full rounded-full ${
                      w.error_rate >= 60 ? 'bg-rose-500' :
                      w.error_rate >= 40 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, w.error_rate)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {weaknessData.length === 0 && examHistory.length === 0 && (
            <div className="text-center py-6 text-xs text-theme-secondary">
              Hãy hoàn thành ít nhất 1 lần thi để xem phân tích điểm yếu.
            </div>
          )}
        </div>
      )}

      {/* Accuracy Rate by Part */}
      <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
          <Target className="w-5 h-5 text-theme-accent" />
          <h2>Tỉ Lệ Chính Xác Theo Từng Phần Thi (Part Accuracy)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {part_stats.map((p, idx) => (
            <div key={idx} className="p-4 bg-theme-surface-2 border border-theme rounded-2xl space-y-2">
              <span className="text-xs font-bold text-theme-primary block">{p.part_name}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400">{p.accuracy_rate}%</span>
                <span className="text-xs text-theme-secondary font-mono">{p.total_attempts} lượt</span>
              </div>
              <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden">
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
        <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2>Tiến Độ Album Từ Vựng Theo Chủ Đề</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {topic_progress.map((tp, idx) => (
              <div key={idx} className="p-3 bg-theme-surface-2 border border-theme rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-primary capitalize">{tp.topic_category}</span>
                  <span className="font-mono text-purple-400 font-bold">{tp.learned_words}/{tp.total_words} từ ({tp.mastery_rate}%)</span>
                </div>
                <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full transition-all" style={{ width: `${tp.mastery_rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Topics */}
        <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2>Tỉ Lệ Chính Xác Ngữ Pháp Part 5/6</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {grammar_stats.map((g, idx) => (
              <div key={idx} className="p-3 bg-theme-surface-2 border border-theme rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-primary">{g.grammar_topic}</span>
                  <span className="font-mono text-amber-400 font-bold">{g.accuracy_rate}% ({g.total_attempts} lượt)</span>
                </div>
                <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${g.accuracy_rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Built-in Exam History Section */}
      <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2>Lịch Sử Thi & Điểm Đề Cố Định (TOEIC RC 75 Phút)</h2>
          </div>
          <span className="text-xs font-semibold text-theme-secondary">
            {examHistory.length} Lượt thi đã hoàn thành
          </span>
        </div>

        {examHistory.length === 0 ? (
          <div className="text-center py-8 bg-theme-surface-2 rounded-2xl border border-theme text-xs text-theme-secondary">
            Bạn chưa hoàn thành lượt thi đề cố định nào. Hãy chọn 1 đề trong <strong className="text-theme-primary">Kho Đề Cố Định</strong> để thử sức!
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {examHistory.map(att => (
              <div key={att.id} className="p-4 bg-theme-surface-2 border border-theme rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      {att.mode === 'full_exam' ? 'Thi Thật 75m' : 'Luyện Tập'}
                    </span>
                    <h4 className="text-sm font-bold text-theme-primary">
                      {att.exam_title.replace(/^\[.*?\]\s*/, '')}
                    </h4>
                  </div>
                  <p className="text-xs text-theme-secondary">
                    Hoàn thành lúc: {new Date(att.completed_at).toLocaleString('vi-VN')} &bull; Thời gian: {Math.floor(att.time_spent_seconds / 60)} phút {att.time_spent_seconds % 60}s
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400">
                      {att.toeic_score} <span className="text-xs text-theme-secondary font-normal">/ 495 RC</span>
                    </div>
                    <div className="text-[11px] text-theme-secondary">
                      Đúng {att.raw_score}/{att.total_questions} câu (P5: {att.part5_correct}/30, P6: {att.part6_correct}/16, P7: {att.part7_correct}/54)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
