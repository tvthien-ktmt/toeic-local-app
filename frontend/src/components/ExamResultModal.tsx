import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Trophy, CheckCircle2, XCircle, Clock, RotateCcw, Eye, Sparkles,
  BookOpen, AlertTriangle, Target, TrendingDown, History, Zap, ChevronDown, ChevronUp
} from 'lucide-react';

interface DetailedQuestionResult {
  id: number;
  question_text: string;
  part: number;
  options: string[];
  correct_answer: string;
  user_answer: string | null;
  is_correct: boolean;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
  common_trap?: string;
}

interface ExamResultData {
  attempt_id: number;
  exam_title: string;
  mode: string;
  raw_score: number;
  total_questions: number;
  gradeable_questions?: number;
  no_answer_key_count?: number;
  toeic_score: number;
  time_spent_seconds: number;
  part5_correct: number;
  part6_correct: number;
  part7_correct: number;
  completed_at: string;
  detailed_results: DetailedQuestionResult[];
  document_id?: number;
}

interface HistoryAttempt {
  id: number;
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

interface ExamResultModalProps {
  result: ExamResultData;
  onClose: () => void;
  onRetake: () => void;
}

// ─── Markdown Passage (shared) ──────────────────────────────────────────────
const MarkdownPassage: React.FC<{ text: string }> = ({ text }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      table: ({ children }) => (
        <div className="overflow-x-auto my-2">
          <table className="w-full border-collapse text-xs">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border border-theme-accent/40 bg-theme-accent/10 px-2 py-1 text-left font-bold text-theme-primary text-xs">{children}</th>
      ),
      td: ({ children }) => (
        <td className="border border-theme/40 px-2 py-1 text-theme-secondary text-xs">{children}</td>
      ),
      input: ({ type, checked }) =>
        type === 'checkbox' ? (
          <span className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded mr-1 align-middle ${checked ? 'border-theme-accent bg-theme-accent' : 'border-theme-secondary/50'}`}>
            {checked && <span className="text-white text-[9px] font-black">✓</span>}
          </span>
        ) : null,
      p: ({ children }) => <p className="text-theme-secondary leading-relaxed mb-1">{children}</p>,
      strong: ({ children }) => <strong className="font-bold text-theme-primary">{children}</strong>,
    }}
  >
    {text}
  </ReactMarkdown>
);

export const ExamResultModal: React.FC<ExamResultModalProps> = ({ result, onClose, onRetake }) => {
  const [activeTab, setActiveTab] = useState<'score' | 'review' | 'weakness' | 'history'>('score');
  const [filterPart, setFilterPart] = useState<'ALL' | 'PART5' | 'PART6' | 'PART7' | 'INCORRECT' | 'SKIPPED'>('ALL');

  // AI Explanation Modal State
  const [selectedAiQuestion, setSelectedAiQuestion] = useState<DetailedQuestionResult | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExplanationData, setAiExplanationData] = useState<any | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  // History
  const [historyAttempts, setHistoryAttempts] = useState<HistoryAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Weakness — expanded topic state
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  // Fetch doc-specific history when tab is opened
  useEffect(() => {
    if (activeTab === 'history' && result.document_id && historyAttempts.length === 0) {
      setHistoryLoading(true);
      fetch(`http://localhost:8000/api/textbooks/history/${result.document_id}`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'success') setHistoryAttempts(data.history || []);
        })
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab, result.document_id]);

  const handleFetchAiExplanation = async (q: DetailedQuestionResult) => {
    setSelectedAiQuestion(q);
    setAiLoading(true);
    setAiExplanationData(null);
    setAiErrorMsg(null);

    // Use DB cached data immediately ONLY if real Gemini data (common_trap or real option_explanations) exists
    if (q.common_trap && q.option_explanations && Object.keys(q.option_explanations).length > 0) {
      setAiExplanationData({
        detailed_explanation: q.explanation,
        grammar_recall: `Chủ điểm: **${q.grammar_topic}**.`,
        grammar_topic: q.grammar_topic,
        option_explanations: q.option_explanations,
        common_trap: q.common_trap,
        sentence_translation: q.translated_sentence || '',
        exam_tip: null,
        source: 'db_cache',
      });
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/generate/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          user_answer: q.user_answer,
          grammar_topic: q.grammar_topic,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAiExplanationData(data.explanation);
      } else {
        const errorDetail = data.detail || data.message || '⚡ Hạn ngạch API Gemini hiện tại đang hết (Rate Limit / Quota 429).';
        setAiErrorMsg(`⚡ Câu này chưa có sẵn dữ liệu pre-gen trong CSDL. ${errorDetail}`);
      }
    } catch (err) {
      console.error('AI explanation error:', err);
      setAiErrorMsg('⚡ Không thể kết nối với server phân tích AI. Vui lòng kiểm tra lại kết nối mạng hoặc server backend.');
    } finally {
      setAiLoading(false);
    }
  };



  // ─── Derived: Tổng Ôn Lỗi Sai grouped by grammar_topic ──────────────────
  const weaknessGroups = useMemo(() => {
    const groups: Record<string, { topic: string; wrong: DetailedQuestionResult[]; skipped: DetailedQuestionResult[] }> = {};
    result.detailed_results.forEach(q => {
      if (q.is_correct) return; // skip correct ones
      const topic = q.grammar_topic || `Part ${q.part}`;
      if (!groups[topic]) groups[topic] = { topic, wrong: [], skipped: [] };
      if (!q.user_answer) groups[topic].skipped.push(q);
      else groups[topic].wrong.push(q);
    });
    // Sort by total errors descending
    return Object.values(groups).sort((a, b) => (b.wrong.length + b.skipped.length) - (a.wrong.length + a.skipped.length));
  }, [result.detailed_results]);

  // Filter for review tab
  const filteredQuestions = result.detailed_results.filter(q => {
    if (filterPart === 'PART5') return q.part === 5;
    if (filterPart === 'PART6') return q.part === 6;
    if (filterPart === 'PART7') return q.part === 7;
    if (filterPart === 'INCORRECT') return !q.is_correct && !!q.user_answer;
    if (filterPart === 'SKIPPED') return !q.user_answer;
    return true;
  });

  const skippedCount = result.detailed_results.filter(q => !q.user_answer).length;
  const wrongCount = result.detailed_results.filter(q => !q.is_correct && !!q.user_answer).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">

        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border-b border-theme flex items-center justify-between shrink-0">
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md">
              KẾT QUẢ BÀI THI TOEIC RC
            </span>
            <h2 className="text-lg font-bold mt-1 text-white">
              {result.exam_title.replace(/^\[.*?\]\s*/, '')}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{result.toeic_score} <span className="text-sm font-normal text-indigo-200">/ 495</span></div>
            <div className="text-xs text-indigo-300">Đúng {result.raw_score}/{result.total_questions} câu</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 py-2 bg-theme-surface-2 border-b border-theme shrink-0 overflow-x-auto">
          {[
            { id: 'score', label: '📊 Điểm Số' },
            { id: 'weakness', label: `📚 Tổng Ôn Lỗi Sai ${weaknessGroups.length > 0 ? `(${weaknessGroups.length} chủ điểm)` : ''}` },
            { id: 'review', label: '🔍 Xem Lại 100 Câu' },
            { id: 'history', label: '📅 Lịch Sử Thi' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-theme-accent text-white shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-3'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto shrink-0 flex gap-2">
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-3 hover:bg-theme-surface-2 text-xs font-semibold text-theme-primary border border-theme transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Làm Lại
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-theme-surface-3 hover:bg-theme-surface-2 text-xs font-semibold text-theme-secondary hover:text-theme-primary border border-theme transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">

          {/* ── TAB: SCORE ── */}
          {activeTab === 'score' && (
            <div className="p-6 space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Score */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-6 text-white text-center shadow-lg shadow-indigo-500/20">
                  <Trophy className="w-10 h-10 text-amber-300 mx-auto mb-2 animate-bounce" />
                  <div className="text-5xl font-black">{result.toeic_score}</div>
                  <div className="text-sm text-indigo-200 mb-2">/ 495 điểm RC</div>
                  <div className="text-xs bg-white/20 rounded-full px-3 py-1">
                    {result.raw_score}/{result.total_questions} câu ({Math.round((result.raw_score / Math.max(result.gradeable_questions || result.total_questions, 1)) * 100)}%)
                  </div>
                </div>

                {/* Part Breakdown */}
                <div className="bg-theme-surface rounded-2xl p-5 border border-theme space-y-3">
                  <h3 className="text-xs font-bold uppercase text-theme-secondary flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-theme-accent" /> Tỉ Lệ Đúng Theo Part
                  </h3>
                  {[
                    { label: 'Part 5', correct: result.part5_correct, total: 30, color: 'bg-indigo-500' },
                    { label: 'Part 6', correct: result.part6_correct, total: 16, color: 'bg-purple-500' },
                    { label: 'Part 7', correct: result.part7_correct, total: 54, color: 'bg-emerald-500' },
                  ].map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-theme-primary">{p.label} ({p.total} câu)</span>
                        <span className="text-theme-accent font-bold">{p.correct}/{p.total}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-theme-surface-3 overflow-hidden">
                        <div className={`h-full ${p.color} rounded-full`} style={{ width: `${(p.correct / p.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info + Skipped/Wrong */}
                <div className="bg-theme-surface rounded-2xl p-5 border border-theme space-y-3">
                  <h3 className="text-xs font-bold uppercase text-theme-secondary flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> Chi Tiết Lượt Thi
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-theme/50">
                      <span className="text-theme-secondary">Chế độ:</span>
                      <span className="font-semibold text-theme-primary">{result.mode === 'full_exam' ? '⏱ Thi Thật 75 Phút' : '📖 Luyện Tập'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-theme/50">
                      <span className="text-theme-secondary">Thời gian làm:</span>
                      <span className="font-semibold text-amber-400">{formatTime(result.time_spent_seconds)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-theme/50">
                      <span className="text-theme-secondary">❌ Sai (đã chọn):</span>
                      <span className="font-semibold text-rose-400">{wrongCount} câu</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-theme-secondary">⬜ Bỏ trống:</span>
                      <span className="font-semibold text-amber-400">{skippedCount} câu</span>
                    </div>
                  </div>

                  {weaknessGroups.length > 0 && (
                    <div className="pt-2 border-t border-theme/50">
                      <button
                        onClick={() => setActiveTab('weakness')}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-xs font-bold text-rose-300 hover:from-rose-500/30 hover:to-amber-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Target className="w-3.5 h-3.5" />
                        Xem Tổng Ôn Lỗi Sai →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: WEAKNESS / TỔNG ÔN LỖI SAI ── */}
          {activeTab === 'weakness' && (
            <div className="p-6 space-y-4">
              {weaknessGroups.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-theme-primary">Xuất Sắc! Không Có Câu Sai Nào 🎉</h3>
                  <p className="text-xs text-theme-secondary">Bạn đã trả lời đúng tất cả các câu hỏi!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 pb-2 border-b border-theme">
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    <h3 className="font-bold text-theme-primary">Chủ Điểm Cần Ôn Lại ({weaknessGroups.length} nhóm)</h3>
                    <span className="ml-auto text-xs text-theme-secondary">{wrongCount + skippedCount} câu sai/bỏ trống</span>
                  </div>

                  {weaknessGroups.map(group => {
                    const total = group.wrong.length + group.skipped.length;
                    const isExpanded = expandedTopic === group.topic;
                    return (
                      <div key={group.topic} className="bg-theme-surface-2 rounded-2xl border border-theme overflow-hidden">
                        {/* Topic Header */}
                        <button
                          onClick={() => setExpandedTopic(isExpanded ? null : group.topic)}
                          className="w-full p-4 flex items-center justify-between hover:bg-theme-surface-3 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center ${
                              total >= 3 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {total}
                            </span>
                            <div className="text-left">
                              <div className="text-sm font-bold text-theme-primary">{group.topic}</div>
                              <div className="text-xs text-theme-secondary">
                                {group.wrong.length > 0 && <span className="text-rose-400">❌ {group.wrong.length} sai</span>}
                                {group.wrong.length > 0 && group.skipped.length > 0 && <span className="mx-1">•</span>}
                                {group.skipped.length > 0 && <span className="text-amber-400">⬜ {group.skipped.length} bỏ trống</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-theme-secondary hidden sm:block">
                              Bấm để xem chi tiết
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-theme-secondary" /> : <ChevronDown className="w-4 h-4 text-theme-secondary" />}
                          </div>
                        </button>

                        {/* Expanded: Show wrong questions in this topic */}
                        {isExpanded && (
                          <div className="border-t border-theme p-4 space-y-3">
                            <p className="text-xs text-theme-secondary italic">Bấm "AI Giải Thích" để hiểu rõ từng câu sai và tránh lặp lại lỗi.</p>
                            {[...group.wrong, ...group.skipped].map(q => (
                              <div key={q.id} className={`p-3 rounded-xl border text-xs ${
                                !q.user_answer ? 'bg-amber-500/5 border-amber-500/20' : 'bg-rose-500/5 border-rose-500/20'
                              }`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-theme-primary font-medium leading-relaxed flex-1 line-clamp-3">
                                    {q.question_text.substring(0, 200)}{q.question_text.length > 200 ? '...' : ''}
                                  </p>
                                  <button
                                    onClick={() => handleFetchAiExplanation(q)}
                                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
                                  >
                                    <Sparkles className="w-3 h-3" /> AI
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-theme-secondary">Đáp án đúng:</span>
                                  <span className="font-bold text-emerald-400">({q.correct_answer})</span>
                                  {q.user_answer ? (
                                    <>
                                      <span className="text-theme-secondary ml-1">Bạn chọn:</span>
                                      <span className="font-bold text-rose-400">({q.user_answer})</span>
                                    </>
                                  ) : (
                                    <span className="text-amber-400 font-bold ml-1">⬜ Bỏ trống</span>
                                  )}
                                  {q.common_trap && (
                                    <span className="ml-auto text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                      ⚠️ Có bẫy
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── TAB: REVIEW ALL QUESTIONS ── */}
          {activeTab === 'review' && (
            <>
              {/* Filter Bar */}
              <div className="px-5 py-3 bg-theme-surface-2 border-b border-theme flex items-center gap-2 flex-wrap shrink-0 sticky top-0 z-10">
                {(['ALL', 'PART5', 'PART6', 'PART7', 'INCORRECT', 'SKIPPED'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPart(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      filterPart === p
                        ? 'bg-theme-accent text-white'
                        : 'bg-theme-surface text-theme-secondary hover:text-theme-primary border border-theme'
                    }`}
                  >
                    {p === 'ALL' && 'Tất Cả'}
                    {p === 'PART5' && 'Part 5'}
                    {p === 'PART6' && 'Part 6'}
                    {p === 'PART7' && 'Part 7'}
                    {p === 'INCORRECT' && `❌ Sai (${wrongCount})`}
                    {p === 'SKIPPED' && `⬜ Bỏ Trống (${skippedCount})`}
                  </button>
                ))}
                <span className="ml-auto text-xs text-theme-secondary">{filteredQuestions.length} câu</span>
              </div>

              {/* Questions List */}
              <div className="p-5 space-y-4">
                {filteredQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border ${
                      q.is_correct
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : !q.user_answer
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                          q.is_correct ? 'bg-emerald-500/20 text-emerald-400' : !q.user_answer ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>{idx + 1}</span>
                        <span className="text-xs font-bold text-theme-primary">Part {q.part} • {q.grammar_topic}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {q.is_correct ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                          </span>
                        ) : !q.user_answer ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                            ⬜ Bỏ Trống
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Sai ({q.user_answer})
                          </span>
                        )}
                        <button
                          onClick={() => handleFetchAiExplanation(q)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> AI Giải Thích
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    {q.part === 5 ? (
                      <p className="text-sm font-semibold text-theme-primary mb-3 leading-relaxed whitespace-pre-wrap">{q.question_text}</p>
                    ) : (
                      <div className="text-sm text-theme-primary mb-3">
                        <MarkdownPassage text={q.question_text} />
                      </div>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {q.options.map(opt => {
                        const optChar = opt.charAt(0);
                        const isCorrectOpt = optChar === q.correct_answer;
                        const isUserOpt = optChar === q.user_answer;
                        let style = 'bg-theme-surface-2 border-theme text-theme-secondary';
                        if (isCorrectOpt) style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                        else if (isUserOpt && !q.is_correct) style = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
                        return (
                          <div key={opt} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}>
                            <span>{opt}</span>
                            {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            {isUserOpt && !q.is_correct && <XCircle className="w-4 h-4 text-rose-400" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation + Common Trap */}
                    {(q.explanation || q.translated_sentence) && (
                      <div className="p-3 rounded-xl bg-theme-surface border border-theme text-xs space-y-2">
                        {q.explanation && (
                          <p className="text-theme-secondary leading-relaxed">{q.explanation}</p>
                        )}
                        {q.translated_sentence && (
                          <div className="pt-2 border-t border-theme/50 text-emerald-400">
                            <strong>Bản dịch:</strong> {q.translated_sentence}
                          </div>
                        )}
                        {q.common_trap && (
                          <div className="pt-2 border-t border-theme/50 flex gap-2 text-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><strong>Bẫy phổ biến:</strong> {q.common_trap}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── TAB: HISTORY ── */}
          {activeTab === 'history' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-theme pb-3">
                <History className="w-5 h-5 text-theme-accent" />
                <h3 className="font-bold text-theme-primary">Lịch Sử Thi Đề Này</h3>
              </div>

              {historyLoading ? (
                <div className="py-8 text-center text-xs text-theme-secondary">Đang tải lịch sử...</div>
              ) : historyAttempts.length === 0 ? (
                <div className="py-8 text-center text-xs text-theme-secondary">Chưa có lịch sử thi nào cho đề này.</div>
              ) : (
                <div className="space-y-3">
                  {historyAttempts.map((att, idx) => (
                    <div key={att.id} className={`p-4 rounded-xl border text-xs space-y-2 ${idx === 0 ? 'border-theme-accent/50 bg-theme-accent/5' : 'border-theme bg-theme-surface-2'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {idx === 0 && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-theme-accent text-white rounded">MỚI NHẤT</span>}
                          <span className="text-theme-secondary">{new Date(att.completed_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-theme-secondary">•</span>
                          <span className="text-theme-secondary">{att.mode === 'full_exam' ? '⏱ Thi Thật' : '📖 Luyện Tập'}</span>
                        </div>
                        <span className="font-black text-theme-accent text-base">{att.toeic_score} <span className="text-xs font-normal text-theme-secondary">/ 495</span></span>
                      </div>
                      <div className="flex items-center gap-4 text-theme-secondary">
                        <span>✓ {att.raw_score}/{att.total_questions} câu</span>
                        <span>P5: {att.part5_correct}/30</span>
                        <span>P6: {att.part6_correct}/16</span>
                        <span>P7: {att.part7_correct}/54</span>
                        <span className="ml-auto">{Math.floor(att.time_spent_seconds / 60)}p{att.time_spent_seconds % 60}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Explanation Sub-Modal */}
        {selectedAiQuestion && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
            <div className="bg-theme-surface border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">

              <div className="flex items-center justify-between border-b border-theme pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-theme-primary">AI Giải Thích & Nhắc Lại Kiến Thức</h3>
                </div>
                <button
                  onClick={() => { setSelectedAiQuestion(null); setAiExplanationData(null); }}
                  className="px-2.5 py-1 rounded-lg bg-theme-surface-2 hover:bg-theme-surface-3 text-xs font-bold text-theme-secondary"
                >
                  ✕ Đóng
                </button>
              </div>

              {aiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-sm text-theme-secondary">AI đang phân tích câu hỏi...</p>
                </div>
              ) : aiErrorMsg ? (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Chưa Thể Phân Tích AI Chi Tiết</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{aiErrorMsg}</p>
                  <div className="pt-2 flex items-center justify-between border-t border-rose-500/20">
                    <span className="text-[11px] text-theme-secondary">Hạn ngạch API Gemini Free Tier tự động reset sau vài phút / 24h.</span>
                    <button
                      onClick={() => selectedAiQuestion && handleFetchAiExplanation(selectedAiQuestion)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Thử Lại Phân Tích Live
                    </button>
                  </div>
                </div>
              ) : aiExplanationData ? (
                <div className="space-y-4 text-xs">
                  {/* Topic Tag */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                      📚 {aiExplanationData.grammar_topic || selectedAiQuestion.grammar_topic}
                    </span>
                    {aiExplanationData.source === 'db_cache' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                        ⚡ Tức thì
                      </span>
                    )}
                  </div>

                  {/* Grammar Recall */}
                  {aiExplanationData.grammar_recall && (
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                      <h4 className="font-bold text-purple-300 mb-2">📚 Nhắc Lại Quy Tắc Ngữ Pháp</h4>
                      <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">{aiExplanationData.grammar_recall}</p>
                    </div>
                  )}

                  {/* Option Explanations */}
                  {aiExplanationData.option_explanations && Object.keys(aiExplanationData.option_explanations).length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/30 space-y-2">
                      <h4 className="font-bold text-slate-300">📋 Phân Tích Từng Đáp Án</h4>
                      {Object.entries(aiExplanationData.option_explanations).map(([opt, exp]) => (
                        <div key={opt} className={`flex gap-2 p-2 rounded-lg ${opt === selectedAiQuestion.correct_answer ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-theme-surface-2'}`}>
                          <span className={`font-bold shrink-0 ${opt === selectedAiQuestion.correct_answer ? 'text-emerald-400' : 'text-rose-400'}`}>({opt})</span>
                          <span className="text-theme-secondary leading-relaxed">{exp as string}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Common Trap */}
                  {aiExplanationData.common_trap && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <h4 className="font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" /> ⚠️ Bẫy Phổ Biến — Vì Sao Hay Nhầm?
                      </h4>
                      <p className="text-theme-primary leading-relaxed">{aiExplanationData.common_trap}</p>
                    </div>
                  )}

                  {/* Exam Tip */}
                  {aiExplanationData.exam_tip && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <h4 className="font-bold text-amber-300 mb-2">💡 Mẹo Làm Bài Nhanh</h4>
                      <p className="text-theme-primary leading-relaxed">{aiExplanationData.exam_tip}</p>
                    </div>
                  )}

                  {/* Translation */}
                  {aiExplanationData.sentence_translation && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <h4 className="font-bold text-emerald-300 mb-2">📝 Bản Dịch Tiếng Việt</h4>
                      <p className="text-theme-primary leading-relaxed">{aiExplanationData.sentence_translation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-rose-400">Không thể nạp giải thích. Vui lòng thử lại.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
