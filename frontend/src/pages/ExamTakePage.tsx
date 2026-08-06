import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Send, Flag, CheckCircle2, Eye, RefreshCw, Layers } from 'lucide-react';
import { ExamResultModal } from '../components/ExamResultModal';

interface QuestionItem {
  id: number;
  q_num: number;
  part: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
}

interface ExamDocument {
  id: number;
  filename: string;
  category: string;
  series: string;
  test_number: number;
  markdown_content: string;
  is_builtin: boolean;
}

interface ExamTakePageProps {
  docId: number;
  mode: 'full_exam' | 'practice';
  onBack: () => void;
}

export const ExamTakePage: React.FC<ExamTakePageProps> = ({ docId, mode, onBack }) => {
  const [document, setDocument] = useState<ExamDocument | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // User responses state
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});

  // Timer state (75 minutes = 4500 seconds for RC)
  const [timeLeft, setTimeLeft] = useState<number>(mode === 'full_exam' ? 4500 : 0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  // Filter state for sidebar question matrix
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'PART5' | 'PART6' | 'PART7' | 'FLAGGED' | 'UNANSWERED'>('ALL');

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchExamData();
  }, [docId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (mode !== 'full_exam' || examResult || loading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, examResult, loading]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/textbooks/exam/${docId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setDocument(data.document);
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Error loading exam payload:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optionChar: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionChar
    }));
  };

  const handleToggleFlag = (qId: number) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleToggleExplanation = (qId: number) => {
    setRevealedExplanations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const scrollToQuestion = (qId: number) => {
    const el = questionRefs.current[qId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmitExam = async () => {
    if (submitting) return;

    const answeredCount = Object.keys(userAnswers).length;
    if (mode === 'full_exam' && answeredCount < questions.length) {
      const confirmSubmit = window.confirm(`Bạn mới trả lời ${answeredCount}/${questions.length} câu. Bạn có chắc chắn muốn nộp bài ngay?`);
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const payloadAnswers: Record<string, string> = {};
      Object.entries(userAnswers).forEach(([qId, ans]) => {
        payloadAnswers[qId] = ans;
      });

      const timeSpent = mode === 'full_exam' ? 4500 - timeLeft : 0;

      const res = await fetch('http://localhost:8000/api/textbooks/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: docId,
          mode: mode,
          time_spent_seconds: timeSpent,
          answers: payloadAnswers
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setExamResult(data);
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Lỗi nộp bài thi. Vui lòng kiểm tra lại server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert('⏰ Đã hết thời gian thi 75 phút! Hệ thống đang tự động nộp bài...');
    handleSubmitExam();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter matrix questions
  const filteredMatrixQs = questions.filter(q => {
    if (matrixFilter === 'PART5') return q.part === 5;
    if (matrixFilter === 'PART6') return q.part === 6;
    if (matrixFilter === 'PART7') return q.part === 7;
    if (matrixFilter === 'FLAGGED') return flaggedQuestions[q.id];
    if (matrixFilter === 'UNANSWERED') return !userAnswers[q.id];
    return true;
  });

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="w-10 h-10 text-theme-accent animate-spin" />
        <p className="text-sm font-semibold text-theme-secondary">Đang nạp toàn bộ 100 câu hỏi đề thi RC...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-base pb-24">
      
      {/* Sticky Top Header Bar */}
      <header className="sticky top-16 z-40 bg-theme-surface/95 backdrop-blur-md border-b border-theme shadow-md px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface-3 border border-theme text-theme-secondary hover:text-theme-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded-md">
                  {mode === 'full_exam' ? 'Thi Thật 75m' : 'Luyện Tập Tự Do'}
                </span>
                <h1 className="text-sm sm:text-base font-bold text-theme-primary truncate max-w-md">
                  {document?.filename.replace(/^\[.*?\]\s*/, '')}
                </h1>
              </div>
              <p className="text-[11px] text-theme-secondary">
                Đã làm: <strong className="text-theme-primary">{answeredCount} / {questions.length} câu</strong> ({progressPercent}%)
              </p>
            </div>
          </div>

          {/* Timer & Submit Button */}
          <div className="flex items-center gap-4">
            {mode === 'full_exam' && (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold border transition-all ${
                timeLeft < 300
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                  : timeLeft < 900
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={handleSubmitExam}
              disabled={submitting}
              className="px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all duration-200"
            >
              <Send className="w-4 h-4" />
              <span>Nộp Bài Thi</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Layout: Left Questions Stream + Right Sticky Question Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Questions List (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {questions.map((q) => {
            const isAnswered = !!userAnswers[q.id];
            const isFlagged = !!flaggedQuestions[q.id];
            const isRevealed = !!revealedExplanations[q.id];
            const selectedOpt = userAnswers[q.id];

            return (
              <div
                key={q.id}
                ref={el => { questionRefs.current[q.id] = el; }}
                className={`bg-theme-surface rounded-2xl border transition-all p-5 sm:p-6 space-y-4 shadow-sm ${
                  isFlagged
                    ? 'border-amber-500/50 shadow-amber-500/10'
                    : isAnswered
                    ? 'border-theme-accent/40'
                    : 'border-theme'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-theme/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-theme-accent text-white font-bold text-xs flex items-center justify-center shadow-md">
                      {q.q_num}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-theme-primary">
                        Part {q.part} &bull; {q.grammar_topic}
                      </span>
                    </div>
                  </div>

                  {/* Flag for Review Toggle */}
                  <button
                    onClick={() => handleToggleFlag(q.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      isFlagged
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border-theme'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-current' : ''}`} />
                    <span>{isFlagged ? 'Đã Đánh Dấu' : 'Đánh Dấu Xem Lại'}</span>
                  </button>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-semibold text-theme-primary leading-relaxed whitespace-pre-wrap">
                  {q.question_text}
                </div>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {q.options.map(opt => {
                    const optChar = opt.charAt(0);
                    const isSelected = selectedOpt === optChar;

                    return (
                      <div
                        key={opt}
                        onClick={() => handleSelectAnswer(q.id, optChar)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3 text-xs sm:text-sm font-medium ${
                          isSelected
                            ? 'bg-theme-accent/20 border-theme-accent text-theme-primary font-bold shadow-md shadow-indigo-500/10'
                            : 'bg-theme-surface-2 hover:bg-theme-surface-3 border-theme text-theme-secondary hover:text-theme-primary'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-theme-accent text-white border-theme-accent'
                            : 'border-theme-secondary/40 text-theme-secondary'
                        }`}>
                          {optChar}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Practice Mode Extra: Instant Explanation Toggle */}
                {mode === 'practice' && (
                  <div className="pt-3 border-t border-theme/50 space-y-3">
                    <button
                      onClick={() => handleToggleExplanation(q.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-theme-surface-3 hover:bg-theme-surface-2 text-theme-accent border border-theme-accent/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isRevealed ? 'Ẩn Giải Thích' : 'Xem Đáp Án & Giải Thích'}</span>
                    </button>

                    {isRevealed && (
                      <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme text-xs space-y-2 animate-fade-in">
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Đáp án đúng: ({q.correct_answer})
                        </div>
                        <p className="text-theme-secondary leading-relaxed">{q.explanation}</p>
                        {q.translated_sentence && (
                          <div className="pt-2 border-t border-theme/50 text-indigo-300">
                            <strong>Bản dịch:</strong> {q.translated_sentence}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}

        </div>

        {/* Right Column: Sticky Question Grid Navigation Matrix (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 bg-theme-surface rounded-2xl border border-theme p-5 space-y-5 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-theme-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-theme-accent" /> Ma Trận 100 Câu Hỏi
              </h3>
              <span className="text-xs font-semibold text-theme-accent">
                {answeredCount} / {questions.length}
              </span>
            </div>

            {/* Matrix Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['ALL', 'PART5', 'PART6', 'PART7', 'FLAGGED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setMatrixFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    matrixFilter === f
                      ? 'bg-theme-accent text-white'
                      : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
                  }`}
                >
                  {f === 'ALL' && 'Tất Cả'}
                  {f === 'PART5' && 'P5'}
                  {f === 'PART6' && 'P6'}
                  {f === 'PART7' && 'P7'}
                  {f === 'FLAGGED' && '🚩 Cần Xem'}
                </button>
              ))}
            </div>

            {/* Question Grid Buttons (101..200) */}
            <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredMatrixQs.map(q => {
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = !!flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => scrollToQuestion(q.id)}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all ${
                      isFlagged
                        ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20'
                        : isAnswered
                        ? 'bg-theme-accent text-white shadow-md shadow-indigo-500/20'
                        : 'bg-theme-surface-2 hover:bg-theme-surface-3 text-theme-secondary hover:text-theme-primary border border-theme'
                    }`}
                  >
                    {q.q_num}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend Footer */}
            <div className="pt-3 border-t border-theme flex items-center justify-between text-[11px] text-theme-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-theme-accent" /> Đã làm
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500" /> Cần xem lại
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-theme-surface-2 border border-theme" /> Chưa làm
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Score Modal on Submit */}
      {examResult && (
        <ExamResultModal
          result={examResult}
          onClose={() => {
            setExamResult(null);
            onBack();
          }}
          onRetake={() => {
            setExamResult(null);
            setUserAnswers({});
            setFlaggedQuestions({});
            setTimeLeft(mode === 'full_exam' ? 4500 : 0);
          }}
        />
      )}

    </div>
  );
};
