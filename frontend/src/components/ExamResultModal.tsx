import React, { useState } from 'react';
import { Trophy, CheckCircle2, XCircle, Clock, RotateCcw, Eye, Sparkles, BookOpen } from 'lucide-react';

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
}

interface ExamResultData {
  attempt_id: number;
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
  detailed_results: DetailedQuestionResult[];
}

interface ExamResultModalProps {
  result: ExamResultData;
  onClose: () => void;
  onRetake: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({ result, onClose, onRetake }) => {
  const [filterPart, setFilterPart] = useState<'ALL' | 'PART5' | 'PART6' | 'PART7' | 'INCORRECT'>('ALL');
  
  // AI Explanation Modal State
  const [selectedAiQuestion, setSelectedAiQuestion] = useState<DetailedQuestionResult | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExplanationData, setAiExplanationData] = useState<any | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  const handleFetchAiExplanation = async (q: DetailedQuestionResult) => {
    setSelectedAiQuestion(q);
    setAiLoading(true);
    setAiExplanationData(null);

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
          grammar_topic: q.grammar_topic
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAiExplanationData(data.explanation);
      }
    } catch (err) {
      console.error('Error fetching AI explanation:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Filter detailed questions
  const filteredQuestions = result.detailed_results.filter(q => {
    if (filterPart === 'PART5') return q.part === 5;
    if (filterPart === 'PART6') return q.part === 6;
    if (filterPart === 'PART7') return q.part === 7;
    if (filterPart === 'INCORRECT') return !q.is_correct;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border-b border-theme text-white flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md">
              KẾT QUẢ BÀI THI TOEIC RC
            </span>
            <h2 className="text-xl font-bold mt-1 text-white">
              {result.exam_title.replace(/^\[.*?\]\s*/, '')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            Xem Chi Tiết Bài Làm ➔
          </button>
        </div>

        {/* Score Breakdown Section */}
        <div className="p-6 bg-theme-surface-2 border-b border-theme grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main TOEIC Score Card */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center shadow-lg shadow-indigo-500/20 relative overflow-hidden">
            <Trophy className="w-10 h-10 text-amber-300 mb-2 animate-bounce" />
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-1">
              {result.toeic_score} <span className="text-lg font-normal text-indigo-200">/ 495</span>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-3">
              Điểm TOEIC Reading RC
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold">
              Đúng {result.raw_score} / {result.total_questions} câu ({Math.round((result.raw_score / result.total_questions) * 100)}%)
            </div>
          </div>

          {/* Part-by-Part Breakdown */}
          <div className="bg-theme-surface rounded-2xl p-5 border border-theme space-y-3 flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-theme-accent" /> Tỉ Lệ Đúng Theo Part
            </h3>

            <div className="space-y-2.5">
              {/* Part 5 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-theme-primary">Part 5 (30 câu)</span>
                  <span className="text-indigo-400 font-bold">{result.part5_correct} / 30</span>
                </div>
                <div className="w-full h-2 rounded-full bg-theme-surface-3 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(result.part5_correct / 30) * 100}%` }} />
                </div>
              </div>

              {/* Part 6 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-theme-primary">Part 6 (16 câu)</span>
                  <span className="text-purple-400 font-bold">{result.part6_correct} / 16</span>
                </div>
                <div className="w-full h-2 rounded-full bg-theme-surface-3 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(result.part6_correct / 16) * 100}%` }} />
                </div>
              </div>

              {/* Part 7 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-theme-primary">Part 7 (54 câu)</span>
                  <span className="text-emerald-400 font-bold">{result.part7_correct} / 54</span>
                </div>
                <div className="w-full h-2 rounded-full bg-theme-surface-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(result.part7_correct / 54) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Test Metadata & Actions */}
          <div className="bg-theme-surface rounded-2xl p-5 border border-theme flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-secondary flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Thông Tin Lượt Thi
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-theme/50">
                  <span className="text-theme-secondary">Chế độ:</span>
                  <span className="font-semibold text-theme-primary">{result.mode === 'full_exam' ? 'Thi Thật 75 Phút' : 'Luyện Tập Tự Do'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-theme/50">
                  <span className="text-theme-secondary">Thời gian làm:</span>
                  <span className="font-semibold text-amber-400">{formatTime(result.time_spent_seconds)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-theme-secondary">Số câu sai:</span>
                  <span className="font-semibold text-rose-400">{result.total_questions - result.raw_score} câu</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={onRetake}
                className="flex-1 py-2 px-3 rounded-xl bg-theme-surface-3 hover:bg-theme-surface-2 text-theme-primary font-semibold text-xs flex items-center justify-center gap-1.5 border border-theme transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm Lại
              </button>
            </div>
          </div>

        </div>

        {/* Detailed Question Review Filters */}
        <div className="px-6 py-3 bg-theme-surface border-b border-theme flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-theme-primary">
            <Eye className="w-4 h-4 text-theme-accent" /> Đáp Án & Khóa Giải Thích 100 Câu Hỏi
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['ALL', 'PART5', 'PART6', 'PART7', 'INCORRECT'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPart(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterPart === p
                    ? 'bg-theme-accent text-white'
                    : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
                }`}
              >
                {p === 'ALL' && 'Tất Cả (100 Câu)'}
                {p === 'PART5' && 'Part 5'}
                {p === 'PART6' && 'Part 6'}
                {p === 'PART7' && 'Part 7'}
                {p === 'INCORRECT' && '❌ Chỉ Câu Sai'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                q.is_correct
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                    q.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-theme-primary">
                    Part {q.part} &bull; {q.grammar_topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {q.is_correct ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5" /> Sai (Bạn chọn: {q.user_answer || 'Bỏ trống'})
                    </span>
                  )}

                  {/* AI Explanation & Grammar Recall Button (Available for BOTH Correct & Incorrect Questions!) */}
                  <button
                    onClick={() => handleFetchAiExplanation(q)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>AI Giải Thích & Nhắc Lại Kiến Thức</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-theme-primary mb-3 leading-relaxed">
                {q.question_text}
              </p>

              {/* Options List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {q.options.map(opt => {
                  const optChar = opt.charAt(0);
                  const isCorrectOpt = optChar === q.correct_answer;
                  const isUserOpt = optChar === q.user_answer;

                  let style = 'bg-theme-surface-2 border-theme text-theme-secondary';
                  if (isCorrectOpt) {
                    style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                  } else if (isUserOpt && !q.is_correct) {
                    style = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
                  }

                  return (
                    <div key={opt} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}>
                      <span>{opt}</span>
                      {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isUserOpt && !q.is_correct && <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Translation Box */}
              <div className="p-4 rounded-xl bg-theme-surface border border-theme text-xs space-y-2">
                <div className="font-semibold text-theme-primary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Giải thích chi tiết:
                </div>
                <p className="text-theme-secondary leading-relaxed">{q.explanation}</p>
                {q.translated_sentence && (
                  <div className="pt-2 border-t border-theme/50 text-emerald-400">
                    <strong>Bản dịch Tiếng Việt:</strong> {q.translated_sentence}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* AI Explanation Sub-Modal */}
        {selectedAiQuestion && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
            <div className="bg-theme-surface border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
                  <h3 className="font-bold text-base text-theme-primary">
                    AI Giải Thích & Nhắc Lại Kiến Thức (Câu #{selectedAiQuestion.id})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAiQuestion(null)}
                  className="px-2.5 py-1 rounded-lg bg-theme-surface-2 hover:bg-theme-surface-3 text-xs font-bold text-theme-secondary hover:text-theme-primary"
                >
                  ✕ Đóng
                </button>
              </div>

              {aiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-theme-secondary">AI đang phân tích câu hỏi & tổng hợp quy tắc ngữ pháp...</p>
                </div>
              ) : aiExplanationData ? (
                <div className="space-y-4 text-xs">
                  
                  {/* Detailed Explanation */}
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1.5">
                    <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                      🧠 Phân Tích Chi Tiết AI
                    </h4>
                    <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">
                      {aiExplanationData.detailed_explanation}
                    </p>
                  </div>

                  {/* Grammar Knowledge Recall */}
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
                    <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                      📚 Nhắc Lại Kiến Thức & Quy Tắc Ngữ Pháp
                    </h4>
                    <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">
                      {aiExplanationData.grammar_recall}
                    </p>
                  </div>

                  {/* Exam Tip */}
                  {aiExplanationData.exam_tip && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                      <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                        💡 Mẹo Làm Bài Nhanh
                      </h4>
                      <p className="text-theme-primary leading-relaxed">
                        {aiExplanationData.exam_tip}
                      </p>
                    </div>
                  )}

                  {/* Translation */}
                  {aiExplanationData.sentence_translation && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                      <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                        📝 Bản Dịch Tiếng Việt Chuẩn Nghĩa
                      </h4>
                      <p className="text-theme-primary leading-relaxed">
                        {aiExplanationData.sentence_translation}
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-8 text-center text-xs text-rose-400">
                  Không thể nạp phần giải thích AI. Vui lòng thử lại.
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
