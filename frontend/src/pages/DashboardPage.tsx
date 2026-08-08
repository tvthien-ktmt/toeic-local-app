import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary, type DashboardSummaryData } from '../api/documents';
import { RefreshCw, BookOpen, Layers, Target, CheckCircle2, TrendingUp, Sparkles, Clock, Zap, Activity, TrendingDown } from 'lucide-react';
import { AIStudyRecommendationCard } from '../components/AIStudyRecommendationCard';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then((res) => {
        setSummary(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard summary:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
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

  const { part_stats = [], topic_progress = [], grammar_stats = [], examHistory = [], weaknessData = [] } = summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <div className="flex items-center space-x-2 text-theme-accent text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>PHÂN TÍCH TIẾN ĐỘ HỌC TẬP THÔNG MINH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
          Dashboard Tổng Quan Luyện Thi TOEIC RC
        </h1>
      </div>

      {/* Module 18: Gemini AI Personalized Recommendation Engine */}
      <AIStudyRecommendationCard
        scoreCorrect={summary.total_learned_correct || summary.learned_vocab || 0}
        scoreTotal={summary.total_attempts || summary.total_vocab || 1}
        weakGrammarTopics={grammar_stats.filter(g => g.accuracy_rate < 60).map(g => g.grammar_topic)}
        weakParts={part_stats.filter(p => p.accuracy_rate < 60).map((_, i) => i + 5)}
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Vocab */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">Tổng số từ vựng</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">Đã thuộc (SRS $\ge$ 3)</span>
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
                  width: `${summary.total_vocab > 0 ? (summary.learned_vocab / summary.total_vocab) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Unlearned */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">Cần ôn tập tiếp</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">Độ chính xác luyện tập</span>
            <div className="p-2.5 rounded-2xl bg-theme-accent/15 text-theme-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-theme-primary">{summary.overall_accuracy}%</div>
            <p className="text-xs text-theme-secondary mt-1">Tổng số {summary.total_attempts} câu đã làm</p>
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
            {summary.total_study_min_7d || 0} <span className="text-sm font-normal text-theme-secondary">phút</span>
          </p>
          <span className="text-[11px] text-theme-secondary block">Tích lũy từ flashcard, quiz & luyện tập</span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-accent">
            <Activity className="w-4 h-4" />
            <span>MỨC ĐỘ ĐỀU ĐẶN</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.active_days_7d || 0} / 7 <span className="text-sm font-normal text-theme-secondary">ngày</span>
          </p>
          <span className="text-[11px] text-theme-secondary block">Số ngày có học trong tuần qua</span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-success">
            <CheckCircle2 className="w-4 h-4" />
            <span>TỪ VỰNG THUỘC (SRS $\ge$ 3)</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.learned_vocab} / {summary.total_vocab}
          </p>
          <span className="text-[11px] text-theme-success font-semibold block">
            Còn {summary.unlearned_vocab || 0} từ chưa thuộc
          </span>
        </div>

        <div className="bg-theme-surface rounded-2xl p-5 border border-theme shadow-lg space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-theme-warning">
            <Target className="w-4 h-4" />
            <span>CÂU HỎI ĐÃ LUYỆN</span>
          </div>
          <p className="text-2xl font-extrabold text-theme-primary">
            {summary.total_attempts} <span className="text-sm font-normal text-theme-secondary">lượt</span>
          </p>
          <span className="text-[11px] text-theme-warning font-semibold block">
            Chính xác {summary.overall_accuracy}%
          </span>
        </div>
      </div>

      {/* Module 19: Speed Analytics Cards by Part */}
      <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
          <Zap className="w-5 h-5 text-theme-warning" />
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
            <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden border border-theme">
              <div
                className={`h-full transition-all ${
                  (summary.part5_avg_speed_sec || 0) <= 20
                    ? 'bg-theme-success'
                    : 'bg-theme-warning'
                }`}
                style={{ width: `${Math.min(100, ((summary.part5_avg_speed_sec || 0) / 20) * 100)}%` }}
              />
            </div>
          </div>

          {/* Part 6 Speed Card */}
          <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-theme-accent">
              <span>PART 6 — Đoạn văn</span>
              <span>Mục tiêu: 37s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-theme-primary">
                {summary.part6_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-theme-secondary">/ câu</span>
            </div>
            <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden border border-theme">
              <div
                className={`h-full transition-all ${
                  (summary.part6_avg_speed_sec || 0) <= 37
                    ? 'bg-theme-success'
                    : 'bg-theme-warning'
                }`}
                style={{ width: `${Math.min(100, ((summary.part6_avg_speed_sec || 0) / 37) * 100)}%` }}
              />
            </div>
          </div>

          {/* Part 7 Speed Card */}
          <div className="p-4 bg-theme-surface-2 border border-theme rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-theme-accent">
              <span>PART 7 — Đọc hiểu</span>
              <span>Mục tiêu: 60s/câu</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-theme-primary">
                {summary.part7_avg_speed_sec || 0}s
              </span>
              <span className="text-xs text-theme-secondary">/ câu</span>
            </div>
            <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden border border-theme">
              <div
                className={`h-full transition-all ${
                  (summary.part7_avg_speed_sec || 0) <= 60
                    ? 'bg-theme-success'
                    : 'bg-theme-warning'
                }`}
                style={{ width: `${Math.min(100, ((summary.part7_avg_speed_sec || 0) / 60) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* WEAKNESS WIDGET: Chủ Điểm Hay Sai Nhất */}
      {weaknessData.length > 0 && (
        <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
              <TrendingDown className="w-5 h-5 text-theme-error" />
              <h2>Chủ Điểm Hay Sai Nhất — Tích Luỹ Qua Các Lần Thi</h2>
            </div>
            <span className="text-xs alert-error border border-theme-error/30 px-2.5 py-1 rounded-full font-semibold">
              {weaknessData.filter(w => w.error_rate >= 40).length} chủ điểm cần ôn ngay
            </span>
          </div>
          <p className="text-xs text-theme-secondary">Phân tích tổng hợp từ {examHistory.length} lần thi. Những chủ điểm có tỉ lệ sai cao nhất cần ôn lại trước kỳ thi.</p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {weaknessData.slice(0, 10).map((w, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex items-center gap-3 ${
                w.error_rate >= 60 ? 'alert-error border-theme-error/30' :
                w.error_rate >= 40 ? 'alert-warning border-theme-warning/30' :
                'bg-theme-surface-2 border-theme'
              }`}>
                <span className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 border ${
                  w.error_rate >= 60 ? 'alert-error border-theme-error' :
                  w.error_rate >= 40 ? 'alert-warning border-theme-warning' :
                  'alert-success border-theme-success'
                }`}>{Math.round(w.error_rate)}%</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-theme-primary truncate">{w.grammar_topic}</div>
                  <div className="text-[10px] text-theme-secondary">
                    ❌ {w.wrong} sai • ⬜ {w.skipped} bỏ trống • ✓ {w.correct} đúng (/{w.total_questions})
                  </div>
                </div>
                <div className="w-24 h-2 rounded-full bg-theme-surface-2 overflow-hidden shrink-0 border border-theme">
                  <div
                    className={`h-full rounded-full ${
                      w.error_rate >= 60 ? 'bg-theme-error' :
                      w.error_rate >= 40 ? 'bg-theme-warning' :
                      'bg-theme-success'
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
                <span className="text-2xl font-extrabold text-theme-success">{p.accuracy_rate}%</span>
                <span className="text-xs text-theme-secondary font-mono">{p.total_attempts} lượt</span>
              </div>
              <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden border border-theme">
                <div
                  className="bg-theme-success h-full transition-all duration-300"
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
            <BookOpen className="w-5 h-5 text-theme-accent" />
            <h2>Tiến Độ Album Từ Vựng Theo Chủ Đề</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {topic_progress.map((tp, idx) => (
              <div key={idx} className="p-3 bg-theme-surface-2 border border-theme rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-primary capitalize">{tp.topic_category}</span>
                  <span className="font-mono text-theme-accent font-bold">{tp.learned_words}/{tp.total_words} từ ({tp.mastery_rate}%)</span>
                </div>
                <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden border border-theme">
                  <div className="bg-theme-accent h-full transition-all" style={{ width: `${tp.mastery_rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Topics */}
        <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
            <Layers className="w-5 h-5 text-theme-warning" />
            <h2>Tỉ Lệ Chính Xác Ngữ Pháp Part 5/6</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {grammar_stats.map((g, idx) => (
              <div key={idx} className="p-3 bg-theme-surface-2 border border-theme rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-primary">{g.grammar_topic}</span>
                  <span className="font-mono text-theme-warning font-bold">{g.accuracy_rate}% ({g.total_attempts} lượt)</span>
                </div>
                <div className="w-full bg-theme-surface h-2 rounded-full overflow-hidden border border-theme">
                  <div className="bg-theme-warning h-full transition-all" style={{ width: `${g.accuracy_rate}%` }} />
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
            <Activity className="w-5 h-5 text-theme-accent" />
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
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-theme-accent text-white rounded">
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
                    <div className="text-lg font-black text-theme-success">
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
