import React, { useState, useEffect } from 'react';
import { MarkdownPassage } from '../components/MarkdownPassage';

// ====================================================
// Types
// ====================================================
interface MasteryInfo {
  status: 'unknown' | 'weak' | 'ok';
  correct_count: number;
  total_count: number;
  mastery_pct: number;
}

interface CurriculumTopic {
  id: number;
  canonical_name: string;
  category: 'grammar_topic' | 'question_type' | 'vocab_topic';
  level: 'basic' | 'intermediate' | 'advanced';
  parts: number[];
  source_count: number;
  prerequisite_topic_id: number | null;
  question_count: number;
  has_specific_db_topic: boolean;
  has_lesson: boolean;
  mastery?: MasteryInfo;
  status?: 'unknown' | 'weak' | 'ok';
  mastery_pct?: number;
}

interface RoadmapSummary {
  total: number;
  unknown: number;
  weak: number;
  ok: number;
  next_recommended: number | null;
}

interface LessonData {
  topic_id: number;
  canonical_name: string;
  category: string;
  level: string;
  parts: number[];
  lesson_id: number;
  content_markdown: string;
  has_real_examples: boolean;
  worked_examples: WorkedExample[];
  quick_check: QuickCheckQ[];
  mastery: MasteryInfo;
}

interface WorkedExample {
  id: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  common_trap: string | null;
  grammar_topic: string | null;
}

interface QuickCheckQ {
  id: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  part: number;
}

interface PlacementQuestion {
  question_id: number;
  topic_id: number;
  topic_name: string;
  topic_level: string;
  part: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
}

// ====================================================
// Color helpers using Theme Tokens
// ====================================================
const STATUS_LABELS: Record<string, string> = {
  unknown: 'Chưa học',
  weak: 'Cần ôn',
  ok: 'Đã vững',
};

const CAT_LABELS: Record<string, string> = {
  grammar_topic: 'Ngữ pháp',
  question_type: 'Dạng câu hỏi',
  vocab_topic: 'Từ vựng',
};

const API_BASE = 'http://localhost:8000';

// ====================================================
// Simple Markdown renderer
// ====================================================
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [Md, setMd] = useState<any>(null);
  const [Gfm, setGfm] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('react-markdown'),
      import('remark-gfm'),
    ]).then(([mdModule, gfmModule]) => {
      setMd(() => mdModule.default);
      setGfm(() => gfmModule.default);
    }).catch(() => {});
  }, []);

  if (!Md || !Gfm) {
    return (
      <div className="whitespace-pre-wrap font-mono text-sm text-theme-primary">
        {content}
      </div>
    );
  }

  return <Md remarkPlugins={[Gfm]}>{content}</Md>;
};

// ====================================================
// PlacementTest component
// ====================================================
const PlacementTest: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/curriculum/placement-test/start`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (qid: number, opt: string) => {
    if (!submitted) setAnswers(prev => ({ ...prev, [qid]: opt }));
  };

  const handleSubmit = async () => {
    const questionTopicMap: Record<number, number> = {};
    questions.forEach(q => { questionTopicMap[q.question_id] = q.topic_id; });

    const res = await fetch(`${API_BASE}/api/curriculum/placement-test/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, question_topic_map: questionTopicMap }),
    });
    const data = await res.json();
    setResult(data);
    setSubmitted(true);
  };

  if (loading) return (
    <div className="text-center py-16 text-theme-secondary">
      ⏳ Đang tải bài chẩn đoán...
    </div>
  );

  if (submitted && result) return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-extrabold text-theme-success mb-2">✅ Chẩn đoán hoàn thành!</h2>
      <div className="bg-theme-surface rounded-2xl p-6 mb-6 border border-theme shadow-xl">
        <p className="text-lg text-theme-primary mb-3">
          Điểm tổng: <strong className="text-theme-success">
            {result.overall.total_correct}/{result.overall.total_questions} ({result.overall.overall_pct}%)
          </strong>
        </p>
        <div className="flex gap-4 flex-wrap">
          <div className="bg-theme-surface-2 rounded-lg px-4 py-2 text-theme-success font-semibold border border-theme-success/30">
            ✅ Đã vững: {result.summary.topics_ok} chủ điểm
          </div>
          <div className="bg-theme-surface-2 rounded-lg px-4 py-2 text-theme-warning font-semibold border border-theme-warning/30">
            ⚠️ Cần ôn: {result.summary.topics_weak} chủ điểm
          </div>
          <div className="bg-theme-surface-2 rounded-lg px-4 py-2 text-theme-secondary font-semibold border border-theme">
            ❓ Chưa học: {result.summary.topics_unknown} chủ điểm
          </div>
        </div>
        {result.summary.priority_topics.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-theme-secondary mb-2">🔥 Chủ điểm cần ưu tiên ôn ngay:</p>
            <div className="flex flex-wrap gap-1.5">
              {result.summary.priority_topics.slice(0, 6).map((t: string, i: number) => (
                <span key={i} className="bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded-md px-2.5 py-1 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onComplete}
        className="w-full sm:w-auto bg-theme-accent hover:bg-theme-accent-hover text-white border-none rounded-xl px-7 py-3 text-base cursor-pointer font-bold transition shadow-lg"
      >
        📚 Xem Lộ Trình Học Cá Nhân →
      </button>
    </div>
  );

  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-theme-primary mb-1">📋 Bài Chẩn Đoán Đầu Vào</h2>
      <p className="text-sm text-theme-secondary mb-6">
        {answered}/{questions.length} câu đã trả lời. Không giới hạn thời gian.
      </p>
      {/* Progress bar */}
      <div className="h-2 bg-theme-surface-2 rounded-full mb-7 overflow-hidden border border-theme">
        <div className="h-full bg-theme-accent transition-all duration-300"
             style={{ width: `${(answered / Math.max(1, questions.length)) * 100}%` }} />
      </div>

      {questions.map((q, i) => (
        <div key={q.question_id} className={`bg-theme-surface rounded-2xl p-5 mb-4 border ${answers[q.question_id] ? 'border-theme-accent' : 'border-theme'} shadow-md`}>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-theme-secondary font-medium">
              Q{i + 1} · Part {q.part} · {q.topic_name.substring(0, 30)}
            </span>
          </div>
          <p className="text-base text-theme-primary mb-4 leading-relaxed font-medium">
            {q.question_text}
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(q.options).map(([opt, text]) => {
              const isSelected = answers[q.question_id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(q.question_id, opt)}
                  className={`text-left p-3 rounded-xl text-sm transition-all border ${
                    isSelected
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-semibold shadow'
                      : 'border-theme bg-theme-surface-2 text-theme-primary hover:border-theme-accent/50'
                  }`}
                >
                  <strong>({opt})</strong> {text as string}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={answered < Math.ceil(questions.length * 0.7)}
        className={`mt-4 w-full py-3.5 rounded-xl text-base font-bold transition shadow-lg ${
          answered >= Math.ceil(questions.length * 0.7)
            ? 'bg-theme-accent hover:bg-theme-accent-hover text-white cursor-pointer'
            : 'bg-theme-surface-2 text-theme-secondary border border-theme cursor-not-allowed'
        }`}
      >
        {answered < Math.ceil(questions.length * 0.7)
          ? `Cần trả lời thêm ${Math.ceil(questions.length * 0.7) - answered} câu`
          : '✅ Nộp Bài Chẩn Đoán'}
      </button>
    </div>
  );
};

// ====================================================
// LessonModal component
// ====================================================
const LessonModal: React.FC<{
  topicId: number;
  onClose: () => void;
}> = ({ topicId, onClose }) => {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/curriculum/lessons/${topicId}`)
      .then(r => r.json())
      .then(data => { setLesson(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [topicId]);

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  if (loading || !lesson) return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-theme-primary text-lg font-semibold bg-theme-surface px-6 py-4 rounded-xl border border-theme shadow-2xl">
        ⏳ Đang tải bài giảng...
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-theme-surface rounded-2xl p-6 sm:p-8 max-w-3xl w-full border border-theme shadow-2xl mt-6 mb-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-2">
              📚 {lesson.canonical_name}
            </h2>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded-md px-2.5 py-0.5 text-xs font-semibold">
                {CAT_LABELS[lesson.category] || lesson.category}
              </span>
              <span className="bg-theme-surface-2 text-theme-secondary border border-theme rounded-md px-2.5 py-0.5 text-xs font-medium">
                {lesson.level}
              </span>
              <span className="text-theme-secondary text-xs">
                Part {lesson.parts.join(', ')}
              </span>
              {!lesson.has_real_examples && (
                <span className="alert-warning px-2 py-0.5 rounded-md text-[11px] font-semibold">
                  ⚠️ Chưa có ví dụ thật
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-theme-secondary hover:text-theme-primary text-2xl cursor-pointer p-1">
            ✕
          </button>
        </div>

        {/* Mastery status */}
        <div className="bg-theme-surface-2 rounded-xl p-3 sm:p-4 mb-5 flex justify-between items-center border border-theme">
          <span className="text-theme-secondary text-xs sm:text-sm">Trạng thái của bạn:</span>
          <span className="font-bold text-sm text-theme-accent">
            {STATUS_LABELS[lesson.mastery.status]}
            {lesson.mastery.total_count > 0 && ` (${lesson.mastery.mastery_pct}%)`}
          </span>
        </div>

        {/* Lesson content */}
        <div className="bg-theme-base rounded-xl p-5 sm:p-6 text-theme-primary leading-relaxed text-sm sm:text-base mb-6 border border-theme max-h-[60vh] overflow-y-auto">
          <MarkdownRenderer content={lesson.content_markdown} />
        </div>

        {/* Quick check */}
        {lesson.quick_check.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-theme-primary mb-3">
              ⚡ Kiểm tra nhanh ({lesson.quick_check.length} câu)
            </h3>
            {lesson.quick_check.map((q, i) => (
              <div key={q.id} className="bg-theme-surface-2 rounded-xl p-4 mb-3 border border-theme">
                <div className="text-theme-primary text-sm mb-2.5">
                  <strong>{i + 1}.</strong> <MarkdownPassage text={q.question_text} />
                </div>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(q.options).map(([opt, text]) => {
                    const isSelected = quizAnswers[q.id] === opt;
                    const isCorrect = quizSubmitted && opt === q.correct_answer;
                    const isWrong = quizSubmitted && isSelected && opt !== q.correct_answer;
                    return (
                      <button
                        key={opt}
                        onClick={() => { if (!quizSubmitted) setQuizAnswers(p => ({ ...p, [q.id]: opt })); }}
                        className={`text-left p-2.5 rounded-lg text-xs sm:text-sm transition-all border ${
                          isCorrect
                            ? 'alert-success border-theme-success font-bold'
                            : isWrong
                            ? 'alert-error border-theme-error font-bold'
                            : isSelected
                            ? 'bg-theme-accent/20 border-theme-accent text-theme-accent font-semibold'
                            : 'bg-theme-surface border-theme text-theme-primary hover:border-theme-accent/40'
                        }`}
                      >
                        <strong>({opt})</strong> {text as string}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < lesson.quick_check.length}
                className={`w-full py-3 rounded-xl text-sm font-bold transition shadow ${
                  Object.keys(quizAnswers).length >= lesson.quick_check.length
                    ? 'bg-theme-accent hover:bg-theme-accent-hover text-white cursor-pointer'
                    : 'bg-theme-surface-2 text-theme-secondary border border-theme cursor-not-allowed'
                }`}
              >
                ✅ Xem Đáp Án
              </button>
            ) : (
              <div className="alert-success rounded-xl p-3 text-center font-bold text-sm">
                Kết quả: {lesson.quick_check.filter(q => quizAnswers[q.id] === q.correct_answer).length}
                /{lesson.quick_check.length} câu đúng
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ====================================================
// Main RoadmapPage
// ====================================================
const RoadmapPage: React.FC = () => {
  const [view, setView] = useState<'roadmap' | 'placement' | 'daily'>('roadmap');
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [summary, setSummary] = useState<RoadmapSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [dailyMinutes, setDailyMinutes] = useState(40);

  const fetchRoadmap = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/curriculum/roadmap`)
      .then(r => r.json())
      .then(data => {
        setTopics(data.roadmap || []);
        setSummary(data.summary || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchDailyPlan = (minutes: number) => {
    fetch(`${API_BASE}/api/curriculum/daily-plan?minutes_per_day=${minutes}`)
      .then(r => r.json())
      .then(data => setDailyPlan(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  useEffect(() => {
    if (view === 'daily') fetchDailyPlan(dailyMinutes);
  }, [view, dailyMinutes]);

  const filteredTopics = topics.filter(t => {
    const status = t.status ?? t.mastery?.status ?? 'unknown';
    if (filterLevel !== 'all' && t.level !== filterLevel) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    return true;
  });

  const progressPct = summary
    ? Math.round((summary.ok / Math.max(1, summary.total)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary font-sans">
      {/* Lesson Modal */}
      {selectedTopicId && (
        <LessonModal
          topicId={selectedTopicId}
          onClose={() => { setSelectedTopicId(null); fetchRoadmap(); }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-theme-primary tracking-tight mb-2">
            🗺️ Lộ Trình Mất Gốc → 495
          </h1>
          <p className="text-theme-secondary text-sm sm:text-base">
            Lộ trình cá nhân hoá dựa trên điểm mạnh/yếu thật của bạn
          </p>
        </div>

        {/* Overall Progress Card */}
        {summary && (
          <div className="bg-theme-surface rounded-2xl p-6 mb-6 border border-theme shadow-lg grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-theme-secondary text-sm font-medium">Tiến độ tổng thể</span>
                <span className="text-theme-accent font-extrabold text-base">{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-theme-surface-2 rounded-full overflow-hidden border border-theme">
                <div
                  className="h-full bg-theme-accent transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex gap-4 mt-3 flex-wrap text-xs sm:text-sm">
                <span className="text-theme-success font-semibold">✅ Đã vững: {summary.ok}</span>
                <span className="text-theme-warning font-semibold">⚠️ Cần ôn: {summary.weak}</span>
                <span className="text-theme-secondary font-semibold">❓ Chưa học: {summary.unknown}</span>
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-theme pt-3 md:pt-0 md:pl-5">
              <div className="text-theme-secondary text-xs">Tổng chủ điểm</div>
              <div className="text-3xl font-black text-theme-primary">{summary.total}</div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 border-b border-theme pb-3">
          {(['roadmap', 'placement', 'daily'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition border cursor-pointer ${
                view === tab
                  ? 'bg-theme-accent text-white border-theme-accent shadow'
                  : 'bg-theme-surface text-theme-secondary border-theme hover:text-theme-primary hover:bg-theme-surface-2'
              }`}
            >
              {tab === 'roadmap' ? '🗺️ Lộ Trình' :
                tab === 'placement' ? '📋 Chẩn Đoán' : '📅 Kế Hoạch Hôm Nay'}
            </button>
          ))}
        </div>

        {/* PLACEMENT TEST TAB */}
        {view === 'placement' && (
          <PlacementTest onComplete={() => { setView('roadmap'); fetchRoadmap(); }} />
        )}

        {/* DAILY PLAN TAB */}
        {view === 'daily' && (
          <div>
            {/* Time selector */}
            <div className="bg-theme-surface rounded-xl p-4 mb-5 border border-theme flex gap-3 items-center flex-wrap">
              <span className="text-theme-secondary text-xs sm:text-sm font-medium">Thời gian học/ngày:</span>
              {[20, 40, 60].map(m => (
                <button
                  key={m}
                  onClick={() => setDailyMinutes(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition ${
                    dailyMinutes === m
                      ? 'bg-theme-accent text-white border-theme-accent shadow'
                      : 'bg-theme-surface-2 text-theme-secondary border-theme hover:text-theme-primary'
                  }`}
                >
                  {m} phút
                </button>
              ))}
            </div>

            {dailyPlan && (
              <div>
                <h3 className="text-lg font-bold text-theme-primary mb-3">
                  📚 Bài học hôm nay ({dailyPlan.today_lessons.length} chủ điểm)
                </h3>
                {dailyPlan.today_lessons.map((lesson: any, i: number) => (
                  <div
                    key={lesson.topic_id}
                    className="bg-theme-surface rounded-xl p-4 mb-3 border border-theme hover:border-theme-accent transition cursor-pointer flex justify-between items-center"
                    onClick={() => setSelectedTopicId(lesson.topic_id)}
                  >
                    <div>
                      <div className="text-theme-primary font-semibold text-sm sm:text-base mb-1">
                        {i + 1}. {lesson.canonical_name}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-theme-accent font-medium">
                          {STATUS_LABELS[lesson.status]}
                        </span>
                        <span className="text-theme-secondary">
                          {CAT_LABELS[lesson.category] || lesson.category}
                        </span>
                        {!lesson.has_lesson_generated && (
                          <span className="text-theme-warning font-semibold">🤖 Sẽ sinh AI</span>
                        )}
                      </div>
                    </div>
                    <span className="text-theme-accent font-bold text-lg">→</span>
                  </div>
                ))}

                {dailyPlan.today_lessons.length === 0 && (
                  <div className="alert-success rounded-2xl p-6 text-center text-sm font-bold">
                    🎉 Tuyệt vời! Bạn đã hoàn thành tất cả các chủ điểm. Hãy làm bài luyện tập đề thi thật!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ROADMAP TAB */}
        {view === 'roadmap' && (
          <div>
            {/* Filters */}
            <div className="flex gap-3 mb-5 flex-wrap bg-theme-surface p-4 rounded-xl border border-theme text-xs sm:text-sm">
              <select
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                className="bg-theme-surface-2 text-theme-primary border border-theme rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">Mọi cấp độ</option>
                <option value="basic">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-theme-surface-2 text-theme-primary border border-theme rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">Mọi loại</option>
                <option value="grammar_topic">Ngữ pháp</option>
                <option value="question_type">Dạng câu hỏi</option>
                <option value="vocab_topic">Từ vựng</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-theme-surface-2 text-theme-primary border border-theme rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="unknown">Chưa học</option>
                <option value="weak">Cần ôn</option>
                <option value="ok">Đã vững</option>
              </select>
              <span className="text-theme-secondary text-xs self-center ml-auto">
                Hiển thị {filteredTopics.length}/{topics.length} chủ điểm
              </span>
            </div>

            {loading ? (
              <div className="text-center py-16 text-theme-secondary">
                ⏳ Đang tải lộ trình...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((t) => {
                  const masteryStatus: string = t.status ?? t.mastery?.status ?? 'unknown';
                  const masteryPct: number = t.mastery_pct ?? t.mastery?.mastery_pct ?? 0;
                  const isNext = summary?.next_recommended === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTopicId(t.id)}
                      className={`bg-theme-surface rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between hover:shadow-lg ${
                        isNext ? 'border-theme-accent ring-2 ring-theme-accent/30' : 'border-theme hover:border-theme-accent/60'
                      }`}
                    >
                      {/* "Học tiếp" badge */}
                      {isNext && (
                        <div className="absolute top-3 right-3 bg-theme-accent text-white rounded-md px-2 py-0.5 text-[11px] font-bold shadow">
                          👉 Học tiếp
                        </div>
                      )}

                      <div>
                        {/* Status badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            masteryStatus === 'ok' ? 'bg-theme-success' :
                            masteryStatus === 'weak' ? 'bg-theme-warning' : 'bg-theme-secondary'
                          }`} />
                          <span className="text-xs font-semibold text-theme-secondary">
                            {STATUS_LABELS[masteryStatus]}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold text-theme-primary mb-2 leading-snug pr-12">
                          {t.canonical_name}
                        </h3>

                        {/* Tags */}
                        <div className="flex gap-1.5 flex-wrap mb-3 text-xs">
                          <span className="bg-theme-surface-2 text-theme-secondary border border-theme rounded px-2 py-0.5 text-[11px]">
                            {t.level}
                          </span>
                          <span className="bg-theme-accent/15 text-theme-accent border border-theme-accent/25 rounded px-2 py-0.5 text-[11px] font-medium">
                            {CAT_LABELS[t.category]}
                          </span>
                          <span className="text-theme-secondary text-[11px] self-center">
                            Part {t.parts.join('/')}
                          </span>
                        </div>
                      </div>

                      <div>
                        {/* Mastery progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-theme-secondary font-medium">Độ vững:</span>
                            <span className="text-theme-primary font-bold">{masteryPct}%</span>
                          </div>
                          <div className="h-1.5 bg-theme-surface-2 rounded-full overflow-hidden border border-theme">
                            <div
                              className={`h-full transition-all duration-300 ${
                                masteryStatus === 'ok' ? 'bg-theme-success' :
                                masteryStatus === 'weak' ? 'bg-theme-warning' : 'bg-theme-secondary'
                              }`}
                              style={{ width: `${masteryPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer meta */}
                        <div className="flex justify-between items-center text-[11px] border-t border-theme pt-2 mt-1 text-theme-secondary">
                          <span>{t.source_count}/4 nguồn · {t.question_count.toLocaleString()} câu DB</span>
                          {t.has_lesson ? (
                            <span className="text-theme-success font-medium">✅ Bài giảng</span>
                          ) : (
                            <span className="text-theme-secondary">🤖 Sinh AI</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;
