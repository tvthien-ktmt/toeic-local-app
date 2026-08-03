import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RefreshCw, Filter, Award, Sparkles, BookOpen, Languages, Clock, Check } from 'lucide-react';
import { fetchQuestions, fetchTopicsSummary, generateSimilarQuestion } from '../api/questions';
import type { QuestionItem } from '../api/questions';
import { GrammarQuickRefModal } from '../components/GrammarQuickRefModal';
import { TextHighlightPopup } from '../components/TextHighlightPopup';
import { PracticeTimer } from '../components/PracticeTimer';
import { AIStudyRecommendationCard } from '../components/AIStudyRecommendationCard';
import { useStudySessionTracker } from '../hooks/useStudySessionTracker';
import axios from 'axios';

export const PracticePage: React.FC = () => {
  // Track study session duration for all practice modes
  useStudySessionTracker('practice');

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [grammarTopics, setGrammarTopics] = useState<{ topic: string; count: number }[]>([]);
  const [topicTags, setTopicTags] = useState<{ tag: string; count: number }[]>([]);

  const [selectedPart, setSelectedPart] = useState<number | undefined>(undefined);
  const [selectedGrammar, setSelectedGrammar] = useState<string>('');
  const [selectedTopicTag, setSelectedTopicTag] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // Module 19: Mode Switcher ('part_practice' vs 'full_mock')
  const [practiceMode, setPracticeMode] = useState<'part_practice' | 'full_mock'>('part_practice');
  const [isMockSubmitted, setIsMockSubmitted] = useState<boolean>(false);
  const [mockStartTime, setMockStartTime] = useState<number>(0);

  // Question Start Time Tracker
  const questionStartTimeRef = useRef<Record<number, number>>({});

  // Module 17: Selected Grammar Topic for Quick Ref Modal
  const [activeGrammarTopic, setActiveGrammarTopic] = useState<string | null>(null);

  const handleGenerateSimilar = async (origQuestionId: number) => {
    setGeneratingId(origQuestionId);
    try {
      const newQ = await generateSimilarQuestion(origQuestionId);
      setQuestions(prev => [newQ, ...prev]);
    } catch (err) {
      alert("Lỗi khi sinh câu hỏi tương tự.");
    } finally {
      setGeneratingId(null);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const qRes = await fetchQuestions({
        part: practiceMode === 'full_mock' ? undefined : selectedPart,
        grammar_topic: selectedGrammar || undefined,
        topic_tag: selectedTopicTag || undefined,
        limit: practiceMode === 'full_mock' ? 100 : 50
      });
      setQuestions(qRes.items);

      // Initialize question start times
      const now = Date.now();
      const initTimes: Record<number, number> = {};
      qRes.items.forEach(q => { initTimes[q.id] = now; });
      questionStartTimeRef.current = initTimes;

      const summaryRes = await fetchTopicsSummary();
      setGrammarTopics(summaryRes.grammar_topics);
      setTopicTags(summaryRes.topic_tags);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setUserAnswers({});
    setScore({ correct: 0, total: 0 });
    setIsMockSubmitted(false);
    if (practiceMode === 'full_mock') {
      setMockStartTime(Date.now());
    }
  }, [selectedPart, selectedGrammar, selectedTopicTag, practiceMode]);

  const handleSelectOption = (q: QuestionItem, optionLetter: string) => {
    if (userAnswers[q.id] && practiceMode === 'part_practice') return;

    const now = Date.now();
    const startTime = questionStartTimeRef.current[q.id] || now;
    const timeSpentSec = Math.round((now - startTime) / 1000);

    setUserAnswers(prev => ({ ...prev, [q.id]: optionLetter }));

    const isCorrect = q.correct_answer && optionLetter.toUpperCase() === q.correct_answer.toUpperCase();

    if (practiceMode === 'part_practice') {
      if (isCorrect) {
        setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      } else {
        setScore(prev => ({ ...prev, total: prev.total + 1 }));
      }
    }

    // Record attempt timing to backend for Module 19.3 & Module 20
    axios.post('/api/questions/attempt', {
      question_id: q.id,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSec,
      part: q.part
    }).catch(err => console.error("Failed to record attempt:", err));
  };

  const handleFinishMockTest = () => {
    const end = Date.now();
    setIsMockSubmitted(true);

    // Calculate final scores
    let correctCount = 0;
    questions.forEach(q => {
      const uChoice = userAnswers[q.id];
      if (uChoice && q.correct_answer && uChoice.toUpperCase() === q.correct_answer.toUpperCase()) {
        correctCount += 1;
      }
    });

    setScore({ correct: correctCount, total: questions.length });

    // Record study session duration to backend
    const totalDurationSec = Math.round((end - mockStartTime) / 1000);
    axios.post('/api/dashboard/study-session', {
      session_type: 'practice',
      duration_seconds: totalDurationSec
    }).catch(err => console.error("Failed to record study session:", err));
  };

  const getOptionLetter = (optStr: string): string => {
    const clean = optStr.trim();
    if (clean.startsWith('A') || clean.startsWith('(A)')) return 'A';
    if (clean.startsWith('B') || clean.startsWith('(B)')) return 'B';
    if (clean.startsWith('C') || clean.startsWith('(C)')) return 'C';
    if (clean.startsWith('D') || clean.startsWith('(D)')) return 'D';
    return clean.charAt(0);
  };

  const parseOptionExplanations = (jsonStr?: string | null): Record<string, string> => {
    if (!jsonStr) return {};
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return {};
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 relative">
      {/* Module 16: Highlight Text Instant Context Lookup Popup */}
      <TextHighlightPopup />

      {/* Module 17: Grammar Quick Ref Modal */}
      <GrammarQuickRefModal
        topicName={activeGrammarTopic}
        onClose={() => setActiveGrammarTopic(null)}
      />
      
      {/* Header Banner & Mode Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 p-8 border border-indigo-500/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                Module 19 — Time Budgeting & Full Mock Test 75 Phút
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Luyện Tập & Thi Thử TOEIC</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Tự luyện tập theo Part hoặc chọn chế độ Thi Thử Đầy Đủ 75 Phút với đồng hồ đếm ngược áp lực thi thật!
            </p>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800 space-x-1 pt-1">
              <button
                onClick={() => setPracticeMode('part_practice')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  practiceMode === 'part_practice'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Luyện Theo Part</span>
              </button>

              <button
                onClick={() => setPracticeMode('full_mock')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  practiceMode === 'full_mock'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Thi Thử Đầy Đủ 75 Phút (Full Mock)</span>
              </button>
            </div>
          </div>

          {/* Right Timer or Score Display */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-center shrink-0 min-w-[180px] shadow-lg space-y-2">
            {practiceMode === 'full_mock' ? (
              <>
                <span className="text-xs text-amber-400 font-bold block uppercase tracking-wider">Đồng hồ Thi Thử</span>
                <PracticeTimer targetMinutes={75} onTimeUp={handleFinishMockTest} isPaused={isMockSubmitted} />
                {!isMockSubmitted ? (
                  <button
                    onClick={handleFinishMockTest}
                    className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    Nộp Bài Thi Thử
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-bold block">Đã hoàn thành!</span>
                )}
              </>
            ) : (
              <>
                <Award className="w-6 h-6 mx-auto text-amber-400 mb-1" />
                <span className="text-xs text-slate-400 block font-medium">Điểm số luyện tập</span>
                <span className="text-2xl font-extrabold text-white">
                  {score.correct} / {score.total}
                </span>
                {score.total > 0 && (
                  <span className="text-xs font-bold text-emerald-400 block mt-1">
                    ({Math.round((score.correct / score.total) * 100)}% Chính xác)
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Part Practice Filters */}
      {practiceMode === 'part_practice' && (
        <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Filter className="w-4 h-4 text-indigo-400" />
              <span>Bộ Lọc Bài Luyện</span>
            </div>
            {/* Target Speed Recommendation Disclaimer */}
            <div className="text-xs text-slate-400 hidden sm:block">
              ⏱️ Mục tiêu tốc độ: Part 5 (20s/câu) • Part 6 (37s/câu) • Part 7 (60s/câu)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Phần thi (Part)</label>
              <select
                value={selectedPart || ''}
                onChange={(e) => setSelectedPart(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả các Part (5, 6, 7)</option>
                <option value="5">Part 5 — Điền câu ngắn (Mục tiêu 10-11 phút)</option>
                <option value="6">Part 6 — Điền đoạn văn (Mục tiêu 10 phút)</option>
                <option value="7">Part 7 — Đọc hiểu văn bản (Mục tiêu 54 phút)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Chủ điểm ngữ pháp (Part 5)</label>
              <select
                value={selectedGrammar}
                onChange={(e) => setSelectedGrammar(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả chủ điểm ngữ pháp</option>
                {grammarTopics.map((g, idx) => (
                  <option key={idx} value={g.topic}>{g.topic} ({g.count} câu)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Chủ đề văn bản (Part 6/7)</label>
              <select
                value={selectedTopicTag}
                onChange={(e) => setSelectedTopicTag(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả chủ đề văn bản</option>
                {topicTags.map((t, idx) => (
                  <option key={idx} value={t.tag}>{t.tag} ({t.count} bài)</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Full Mock Test Report Banner after submission */}
      {practiceMode === 'full_mock' && isMockSubmitted && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-lg">
            <Award className="w-6 h-6" />
            <h2>BÁO CÁO KẾT QUẢ THI THỬ THỜI GIAN THẬT (FULL MOCK TEST)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Tổng điểm thi thử</span>
              <span className="text-3xl font-extrabold text-amber-400">{score.correct} / {score.total}</span>
              <span className="text-xs font-bold text-emerald-400 block mt-1">
                ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}% Đúng)
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Part 5 (Mục tiêu 10m)</span>
              <span className="text-lg font-bold text-slate-200">
                {questions.filter(q => q.part === 5 && userAnswers[q.id] && q.correct_answer && userAnswers[q.id].toUpperCase() === q.correct_answer.toUpperCase()).length} / {questions.filter(q => q.part === 5).length} câu
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Part 6 (Mục tiêu 10m)</span>
              <span className="text-lg font-bold text-slate-200">
                {questions.filter(q => q.part === 6 && userAnswers[q.id] && q.correct_answer && userAnswers[q.id].toUpperCase() === q.correct_answer.toUpperCase()).length} / {questions.filter(q => q.part === 6).length} câu
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <span className="text-xs text-slate-400 block font-medium">Part 7 (Mục tiêu 54m)</span>
              <span className="text-lg font-bold text-slate-200">
                {questions.filter(q => q.part === 7 && userAnswers[q.id] && q.correct_answer && userAnswers[q.id].toUpperCase() === q.correct_answer.toUpperCase()).length} / {questions.filter(q => q.part === 7).length} câu
              </span>
            </div>
          </div>

          {/* AI Personalized Recommendation Card */}
          <AIStudyRecommendationCard
            scoreCorrect={score.correct}
            scoreTotal={score.total}
            weakGrammarTopics={Array.from(new Set(questions.filter(q => userAnswers[q.id] && q.correct_answer && userAnswers[q.id].toUpperCase() !== q.correct_answer.toUpperCase()).map(q => q.grammar_topic || 'general grammar')))}
            weakParts={Array.from(new Set(questions.filter(q => userAnswers[q.id] && q.correct_answer && userAnswers[q.id].toUpperCase() !== q.correct_answer.toUpperCase()).map(q => q.part || 5)))}
          />
        </div>
      )}

      {/* Question List / Quiz Engine */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
          <p className="text-sm font-medium">Đang tải câu hỏi luyện tập...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-800/30 border border-dashed border-slate-700/60 space-y-3">
          <HelpCircle className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-slate-300 font-medium text-base">Chưa có câu hỏi nào khớp bộ lọc này</p>
          <p className="text-xs text-slate-500">Hãy upload tài liệu đề thi PDF ở trang "Tài liệu & Upload" và nhấn "Trích xuất AI"!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userChoice = userAnswers[q.id];
            const isAnswered = !!userChoice;
            const optionExplanations = parseOptionExplanations(q.option_explanations_json);

            // In Mock test mode: hide feedback until submitted
            const showFeedback = practiceMode === 'part_practice' ? isAnswered : (practiceMode === 'full_mock' && isMockSubmitted);

            return (
              <div key={q.id} className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-5 shadow-xl">
                
                {/* Meta header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                      Câu {idx + 1} (Part {q.part})
                    </span>

                    {/* Module 17: Interactive Clickable Grammar Topic Badge */}
                    <button
                      onClick={() => setActiveGrammarTopic(q.grammar_topic)}
                      className="px-2.5 py-1 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center space-x-1 transition-colors"
                      title="Bấm để xem thẻ Ôn Nhanh Ngữ Pháp"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{q.grammar_topic}</span>
                    </button>

                    {q.topic_tag && (
                      <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                        {q.topic_tag}
                      </span>
                    )}
                  </div>

                  {practiceMode === 'part_practice' && (
                    <button
                      onClick={() => handleGenerateSimilar(q.id)}
                      disabled={generatingId === q.id}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      {generatingId === q.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Sinh câu tương tự</span>
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed select-text">
                  {q.question_text}
                </h3>

                {/* Interactive Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => {
                    const letter = getOptionLetter(opt);
                    const isSelected = userChoice === letter;
                    const isCorrect = q.correct_answer && letter.toUpperCase() === q.correct_answer.toUpperCase();

                    let optionStyle = "bg-slate-900/60 hover:bg-slate-900 border-slate-700/80 text-slate-200";

                    if (showFeedback) {
                      if (isCorrect) {
                        optionStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-bold shadow-lg shadow-emerald-500/10";
                      } else if (isSelected) {
                        optionStyle = "bg-red-500/20 border-red-500/60 text-red-200 font-bold";
                      } else {
                        optionStyle = "bg-slate-900/30 border-slate-800 text-slate-500 opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold";
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={practiceMode === 'full_mock' ? isMockSubmitted : isAnswered}
                        onClick={() => handleSelectOption(q, letter)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                        {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                        {!showFeedback && isSelected && <Check className="w-5 h-5 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Translation Card after answer */}
                {showFeedback && (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3 text-xs sm:text-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">Đáp án chính xác:</span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {q.correct_answer || 'Chưa xác định trong đề gốc'}
                      </span>
                    </div>

                    {/* Option-Specific Explanation for User's Choice */}
                    {userChoice && optionExplanations[userChoice] && (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
                        <span className="font-bold text-indigo-300 block">
                          Giải thích cho lựa chọn ({userChoice}) của bạn:
                        </span>
                        <p className="text-slate-200 leading-relaxed">
                          {optionExplanations[userChoice]}
                        </p>
                      </div>
                    )}

                    {/* Overall Explanation */}
                    {q.explanation && (
                      <p className="text-slate-300 leading-relaxed">
                        <span className="font-bold text-amber-300">Giải thích chung:</span> {q.explanation}
                      </p>
                    )}

                    {/* Natural Sentence Translation */}
                    {q.translated_sentence && (
                      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                          <Languages className="w-4 h-4" />
                          <span>Bản dịch tiếng Việt hoàn chỉnh:</span>
                        </div>
                        <p className="text-slate-200 italic leading-relaxed">
                          "{q.translated_sentence}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
