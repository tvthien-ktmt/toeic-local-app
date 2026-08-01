import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RefreshCw, Filter, Award, Sparkles } from 'lucide-react';
import { fetchQuestions, fetchTopicsSummary, generateSimilarQuestion } from '../api/questions';
import type { QuestionItem } from '../api/questions';

export const PracticePage: React.FC = () => {
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
        part: selectedPart,
        grammar_topic: selectedGrammar || undefined,
        topic_tag: selectedTopicTag || undefined,
        limit: 50
      });
      setQuestions(qRes.items);

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
  }, [selectedPart, selectedGrammar, selectedTopicTag]);

  const handleSelectOption = (qId: number, optionLetter: string, correctAnswer: string | null) => {
    if (userAnswers[qId]) return; // already answered

    setUserAnswers(prev => ({ ...prev, [qId]: optionLetter }));

    if (correctAnswer && optionLetter.toUpperCase() === correctAnswer.toUpperCase()) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const getOptionLetter = (optStr: string): string => {
    const clean = optStr.trim();
    if (clean.startsWith('A') || clean.startsWith('(A)')) return 'A';
    if (clean.startsWith('B') || clean.startsWith('(B)')) return 'B';
    if (clean.startsWith('C') || clean.startsWith('(C)')) return 'C';
    if (clean.startsWith('D') || clean.startsWith('(D)')) return 'D';
    return clean.charAt(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 p-8 border border-indigo-500/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              Module 2 & Module 5 — Luyện Tập Trắc Nghiệm
            </span>
            <h1 className="text-3xl font-extrabold text-white">Luyện Tập Theo Chủ Đề TOEIC</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Lọc bài tập theo chủ điểm ngữ pháp Part 5 hoặc chủ đề văn bản Part 6/7. Nhận phản hồi và giải thích chi tiết ngay khi chọn đáp án!
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-center shrink-0 min-w-[160px] shadow-lg">
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
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Bộ Lọc Bài Luyện</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Part Filter */}
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Phần thi (Part)</label>
            <select
              value={selectedPart || ''}
              onChange={(e) => setSelectedPart(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Tất cả các Part (5, 6, 7)</option>
              <option value="5">Part 5 — Điền câu ngắn</option>
              <option value="6">Part 6 — Điền đoạn văn</option>
              <option value="7">Part 7 — Đọc hiểu văn bản</option>
            </select>
          </div>

          {/* Grammar Topic Filter */}
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

          {/* Topic Tag Filter */}
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

            return (
              <div key={q.id} className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-5 shadow-xl">
                
                {/* Meta header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                      Câu {idx + 1} (Part {q.part})
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-700 text-slate-300 text-xs font-medium">
                      {q.grammar_topic}
                    </span>
                    {q.topic_tag && (
                      <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                        {q.topic_tag}
                      </span>
                    )}
                    {q.is_generated && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        ⚡ AI Generated
                      </span>
                    )}
                  </div>

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
                </div>


                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {q.question_text}
                </h3>

                {/* Interactive Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => {
                    const letter = getOptionLetter(opt);
                    const isSelected = userChoice === letter;
                    const isCorrect = q.correct_answer && letter.toUpperCase() === q.correct_answer.toUpperCase();

                    let optionStyle = "bg-slate-900/60 hover:bg-slate-900 border-slate-700/80 text-slate-200";

                    if (isAnswered) {
                      if (isCorrect) {
                        optionStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-bold shadow-lg shadow-emerald-500/10";
                      } else if (isSelected) {
                        optionStyle = "bg-red-500/20 border-red-500/60 text-red-200 font-bold";
                      } else {
                        optionStyle = "bg-slate-900/30 border-slate-800 text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(q.id, letter, q.correct_answer)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card after answer */}
                {isAnswered && (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2 text-xs sm:text-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">Đáp án chính xác:</span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {q.correct_answer || 'Chưa xác định trong đề gốc'}
                      </span>
                    </div>

                    {q.explanation && (
                      <p className="text-slate-300 leading-relaxed pt-1">
                        <span className="font-bold text-indigo-300">Giải thích chi tiết:</span> {q.explanation}
                      </p>
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
