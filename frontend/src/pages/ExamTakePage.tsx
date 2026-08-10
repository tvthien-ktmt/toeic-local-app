import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Send, Flag, CheckCircle2, Eye, RefreshCw, Layers, Trophy, XCircle, Sparkles, AlertTriangle, BookOpen } from 'lucide-react';
import { ExamResultModal } from '../components/ExamResultModal';
import { MarkdownPassage } from '../components/MarkdownPassage';

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
  common_trap?: string;
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



// ─── Confirm Submit Dialog ──────────────────────────────────────────────────
interface ConfirmSubmitDialogProps {
  unansweredCount: number;
  flaggedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmSubmitDialog: React.FC<ConfirmSubmitDialogProps> = ({ unansweredCount, flaggedCount, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-theme-surface border border-theme-warning/40 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl alert-warning border border-theme-warning/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-theme-warning" />
        </div>
        <div>
          <h3 className="font-bold text-base text-theme-primary">Xác Nhận Nộp Bài</h3>
          <p className="text-xs text-theme-secondary mt-0.5">Hành động này không thể hoàn tác</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {unansweredCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl alert-error border border-theme-error/20">
            <XCircle className="w-4 h-4 shrink-0" />
            <span><strong>{unansweredCount} câu chưa trả lời</strong> — sẽ tính là bỏ trống (0 điểm)</span>
          </div>
        )}
        {flaggedCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl alert-warning border border-theme-warning/20">
            <Flag className="w-4 h-4 shrink-0" />
            <span><strong>{flaggedCount} câu đã đánh dấu</strong> cần xem lại — bạn có muốn xem lại trước không?</span>
          </div>
        )}
        {unansweredCount === 0 && flaggedCount === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl alert-success border border-theme-success/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Bạn đã trả lời đầy đủ tất cả câu hỏi. Sẵn sàng nộp bài!</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          Quay Lại Làm Tiếp
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-theme-success text-white font-bold text-xs shadow-lg transition-all hover:opacity-90"
        >
          Nộp Bài Ngay
        </button>
      </div>
    </div>
  </div>
);

// ─── Resume Draft Dialog ────────────────────────────────────────────────────
interface ResumeDraftDialogProps {
  savedAnswerCount: number;
  onResume: () => void;
  onStartFresh: () => void;
}
const ResumeDraftDialog: React.FC<ResumeDraftDialogProps> = ({ savedAnswerCount, onResume, onStartFresh }) => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-theme-surface border border-theme-accent/40 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-theme-accent/20 border border-theme-accent/30 flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-theme-accent" />
        </div>
        <div>
          <h3 className="font-bold text-base text-theme-primary">Tiếp Tục Làm Dở?</h3>
          <p className="text-xs text-theme-secondary mt-0.5">Phát hiện lần làm chưa hoàn thành</p>
        </div>
      </div>
      <p className="text-xs text-theme-secondary leading-relaxed">
        Bạn đã làm được <strong className="text-theme-primary">{savedAnswerCount} câu</strong> trong lần trước nhưng chưa nộp.
        Muốn tiếp tục từ đó hay bắt đầu lại từ đầu?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onStartFresh}
          className="flex-1 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          Bắt Đầu Mới
        </button>
        <button
          onClick={onResume}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-purple-700"
        >
          Tiếp Tục Làm
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
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

  // UI dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showResumeDialog, setShowResumeDialog] = useState<boolean>(false);
  const [pendingDraft, setPendingDraft] = useState<{ answers: Record<number, string>; flags: Record<number, boolean>; timeLeft: number } | null>(null);

  // Filter state for sidebar question matrix
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'PART5' | 'PART6' | 'PART7' | 'FLAGGED' | 'UNANSWERED'>('ALL');

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const draftKey = `exam_draft_${docId}_${mode}`;

  // AI Explanation Modal State
  const [selectedAiQuestion, setSelectedAiQuestion] = useState<QuestionItem | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExplanationData, setAiExplanationData] = useState<any | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

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

  // Auto-save draft to localStorage every time answers change
  useEffect(() => {
    if (loading || examResult || questions.length === 0) return;
    const draft = {
      answers: userAnswers,
      flags: flaggedQuestions,
      timeLeft,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [userAnswers, flaggedQuestions, timeLeft, loading, examResult, questions.length]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/textbooks/exam/${docId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setDocument(data.document);
        setQuestions(data.questions);

        // Check for saved draft
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            const savedCount = Object.keys(parsed.answers || {}).length;
            if (savedCount > 0) {
              setPendingDraft(parsed);
              setShowResumeDialog(true);
            }
          } catch {
            localStorage.removeItem(draftKey);
          }
        }
      }
    } catch (err) {
      console.error('Error loading exam payload:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeDraft = () => {
    if (pendingDraft) {
      setUserAnswers(pendingDraft.answers || {});
      setFlaggedQuestions(pendingDraft.flags || {});
      if (mode === 'full_exam' && pendingDraft.timeLeft > 0) {
        setTimeLeft(pendingDraft.timeLeft);
      }
    }
    setShowResumeDialog(false);
    setPendingDraft(null);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(draftKey);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeLeft(mode === 'full_exam' ? 4500 : 0);
    setShowResumeDialog(false);
    setPendingDraft(null);
  };

  const handleSelectAnswer = (qId: number, optionChar: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionChar }));
  };

  const handleToggleFlag = (qId: number) => {
    setFlaggedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleToggleExplanation = (qId: number) => {
    setRevealedExplanations(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const scrollToQuestion = (qId: number) => {
    const el = questionRefs.current[qId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFetchAiExplanation = async (q: QuestionItem) => {
    setSelectedAiQuestion(q);
    setAiLoading(true);
    setAiExplanationData(null);
    setAiErrorMsg(null);

    // If DB has genuine Gemini data (common_trap or real option_explanations), use it immediately (0 latency)
    if (q.common_trap && q.option_explanations && Object.keys(q.option_explanations).length > 0) {
      setAiExplanationData({
        detailed_explanation: q.explanation,
        grammar_recall: `Chủ điểm: **${q.grammar_topic}**.`,
        grammar_topic: q.grammar_topic,
        option_explanations: q.option_explanations,
        common_trap: q.common_trap,
        sentence_translation: q.translated_sentence || '',
        exam_tip: null,
        key_vocabulary: [],
        source: 'db_cache',
      });
      setAiLoading(false);
      return;
    }

    // Call Gemini live API if DB lacks pre-computed AI data
    try {
      const res = await fetch('/api/generate/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          user_answer: userAnswers[q.id] || null,
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
      console.error('Error fetching AI explanation:', err);
      setAiErrorMsg('⚡ Không thể kết nối với server phân tích AI. Vui lòng kiểm tra lại kết nối mạng hoặc server backend.');
    } finally {
      setAiLoading(false);
    }
  };



  // Try to submit — shows confirm dialog first if needed
  const handleSubmitExam = () => {
    if (submitting || examResult) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    if (submitting) return;
    setSubmitting(true);
    try {
      const payloadAnswers: Record<string, string> = {};
      Object.entries(userAnswers).forEach(([qId, ans]) => {
        payloadAnswers[qId] = ans;
      });
      const timeSpent = mode === 'full_exam' ? 4500 - timeLeft : 0;
      const res = await fetch('/api/textbooks/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: docId, mode, time_spent_seconds: timeSpent, answers: payloadAnswers }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Clear draft on successful submit
        localStorage.removeItem(draftKey);
        setExamResult(data);
        setShowResultModal(true);
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Lỗi nộp bài thi. Vui lòng kiểm tra lại server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleConfirmSubmit();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Derived counts
  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Filter matrix questions
  const filteredMatrixQs = questions.filter(q => {
    if (matrixFilter === 'PART5') return q.part === 5;
    if (matrixFilter === 'PART6') return q.part === 6;
    if (matrixFilter === 'PART7') return q.part === 7;
    if (matrixFilter === 'FLAGGED') return flaggedQuestions[q.id];
    if (matrixFilter === 'UNANSWERED') return !userAnswers[q.id];
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="w-10 h-10 text-theme-accent animate-spin" />
        <p className="text-sm font-semibold text-theme-secondary">Đang nạp đề thi RC...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-base pb-24">

      {/* Resume Draft Dialog */}
      {showResumeDialog && pendingDraft && (
        <ResumeDraftDialog
          savedAnswerCount={Object.keys(pendingDraft.answers || {}).length}
          onResume={handleResumeDraft}
          onStartFresh={handleStartFresh}
        />
      )}

      {/* Confirm Submit Dialog */}
      {showConfirmDialog && (
        <ConfirmSubmitDialog
          unansweredCount={unansweredCount}
          flaggedCount={flaggedCount}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

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
                {flaggedCount > 0 && (
                  <span className="ml-2 text-theme-warning">🚩 {flaggedCount} đánh dấu</span>
                )}
              </p>
            </div>
          </div>

          {/* Timer & Submit */}
          <div className="flex items-center gap-4">
            {mode === 'full_exam' && !examResult && (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold border transition-all ${
                timeLeft < 300
                  ? 'bg-theme-error/20 text-theme-error border-theme-error/30 animate-pulse'
                  : timeLeft < 900
                  ? 'bg-theme-warning/20 text-theme-warning border-theme-warning/30'
                  : 'bg-theme-success/20 text-theme-success border-theme-success/30'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            {examResult ? (
              <button
                onClick={() => setShowResultModal(true)}
                className="px-4 sm:px-6 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all duration-200 animate-pulse"
              >
                <Trophy className="w-4 h-4 text-white" />
                <span>Xem Bảng Điểm TOEIC ({examResult.toeic_score}/495)</span>
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="px-4 sm:px-6 py-2 rounded-xl bg-theme-success hover:opacity-90 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Đang nộp...' : 'Nộp Bài Thi'}</span>
              </button>
            )}
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

            const isSubmitted = !!examResult;
            const isCorrect = isSubmitted && selectedOpt === q.correct_answer;
            const isWrong = isSubmitted && selectedOpt && selectedOpt !== q.correct_answer;
            const isSkipped = isSubmitted && !selectedOpt; // Bỏ trống

            return (
              <div
                key={q.id}
                ref={el => { questionRefs.current[q.id] = el; }}
                className={`bg-theme-surface rounded-2xl border transition-all p-5 sm:p-6 space-y-4 shadow-sm ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-theme-success/50 alert-success'
                      : isWrong
                      ? 'border-theme-error/50 alert-error'
                      : 'border-theme-warning/40 alert-warning'  // skipped = amber
                    : isFlagged
                    ? 'border-theme-warning/50 shadow-sm'
                    : isAnswered
                    ? 'border-theme-accent/40'
                    : 'border-theme'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-theme/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shadow-md ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-theme-success text-white'
                          : isWrong
                          ? 'bg-theme-error text-white'
                          : 'bg-theme-warning text-white'
                        : 'bg-theme-accent text-white'
                    }`}>
                      {q.q_num}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-theme-primary">
                        Part {q.part} • {q.grammar_topic}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Status Badge if Submitted */}
                    {isSubmitted && (
                      isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-bold alert-success text-theme-success px-2.5 py-1 rounded-full border border-theme-success/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                        </span>
                      ) : isSkipped ? (
                        <span className="flex items-center gap-1 text-xs font-bold alert-warning text-theme-warning px-2.5 py-1 rounded-full border border-theme-warning/30">
                          ⬜ Bỏ Trống
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold alert-error text-theme-error px-2.5 py-1 rounded-full border border-theme-error/30">
                          <XCircle className="w-3.5 h-3.5" /> Sai ({selectedOpt})
                        </span>
                      )
                    )}

                    {/* AI Explanation Button */}
                    {(isSubmitted || mode === 'practice') && (
                      <button
                        onClick={() => handleFetchAiExplanation(q)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Giải Thích</span>
                      </button>
                    )}

                    {/* Flag for Review Toggle */}
                    {!isSubmitted && (
                      <button
                        onClick={() => handleToggleFlag(q.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          isFlagged
                            ? 'alert-warning border-theme-warning/40 shadow-sm font-bold'
                            : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border-theme'
                        }`}
                      >
                        <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-current' : ''}`} />
                        <span>{isFlagged ? 'Đã Đánh Dấu' : 'Đánh Dấu'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text — use Markdown for Part 6/7, plain text for Part 5 */}
                {q.part === 5 ? (
                  <div className="text-sm sm:text-base font-semibold text-theme-primary leading-relaxed whitespace-pre-wrap">
                    {q.question_text}
                  </div>
                ) : (
                  <div className="text-sm text-theme-primary leading-relaxed">
                    <MarkdownPassage text={q.question_text} />
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                      {q.options.map(opt => {
                        const optChar = opt.charAt(0);
                        const isSelected = selectedOpt === optChar;
                        const isCorrectOpt = isSubmitted && optChar === q.correct_answer;
                        const isUserWrongOpt = isSubmitted && isSelected && optChar !== q.correct_answer;

                        const rawClean = opt.replace(/^\s*\(?[A-Da-d][\.\)]?\s*[-—]?\s*/, '').trim();
                        const optionBody = (rawClean && rawClean !== '—' && rawClean !== '-') ? rawClean : (opt.length > 2 ? opt.substring(2).trim() : '');
                        const displayText = optionBody && optionBody !== '—' && optionBody !== '-' ? optionBody : `Phương án (${optChar})`;

                        let optStyle = 'bg-theme-surface-2 hover:bg-theme-surface border-theme text-theme-secondary hover:text-theme-primary';
                        if (isCorrectOpt) optStyle = 'alert-success border-theme-success font-bold text-theme-success shadow-md';
                        else if (isUserWrongOpt) optStyle = 'alert-error border-theme-error font-bold text-theme-error shadow-md';
                        else if (isSelected) optStyle = 'bg-theme-accent/20 border-theme-accent text-theme-primary font-bold shadow-md';

                        return (
                          <div
                            key={opt}
                            onClick={() => !isSubmitted && handleSelectAnswer(q.id, optChar)}
                            className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
                              isSubmitted ? 'cursor-default' : 'cursor-pointer'
                            } ${optStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 ${
                                isCorrectOpt
                                  ? 'bg-theme-success text-white border-theme-success'
                                  : isUserWrongOpt
                                  ? 'bg-theme-error text-white border-theme-error'
                                  : isSelected
                                  ? 'bg-theme-accent text-white border-theme-accent'
                                  : 'border-theme-secondary/40 text-theme-secondary'
                              }`}>
                                {optChar}
                              </div>
                              <span>{displayText}</span>
                            </div>
                            {isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-theme-success shrink-0" />}
                            {isUserWrongOpt && <XCircle className="w-5 h-5 text-theme-error shrink-0" />}
                          </div>
                        );
                      })}
                </div>

                {/* Post-submission or Practice Mode: Show Explanation & Translation */}
                {(isSubmitted || (mode === 'practice' && isRevealed)) && (
                  <div className="pt-3 border-t border-theme space-y-3">
                    <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme text-xs space-y-2 animate-fade-in">
                      <div className="font-bold text-theme-success flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Đáp án đúng: ({q.correct_answer})
                      </div>
                      {q.explanation && (
                        <p className="text-theme-secondary leading-relaxed">{q.explanation}</p>
                      )}
                      {q.translated_sentence && (
                        <div className="pt-2 border-t border-theme text-theme-accent">
                          <strong>Bản dịch:</strong> {q.translated_sentence}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Practice Mode Toggle Button */}
                {mode === 'practice' && !isSubmitted && (
                  <div className="pt-2 border-t border-theme/50">
                    <button
                      onClick={() => handleToggleExplanation(q.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-theme-surface-3 hover:bg-theme-surface-2 text-theme-accent border border-theme-accent/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isRevealed ? 'Ẩn Giải Thích' : 'Xem Đáp Án & Giải Thích Tức Thì'}</span>
                    </button>
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
                <Layers className="w-4 h-4 text-theme-accent" /> Ma Trận Câu Hỏi
              </h3>
              <span className="text-xs font-semibold text-theme-accent">
                {answeredCount} / {questions.length}
              </span>
            </div>

            {/* Matrix Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-wrap">
              {(['ALL', 'PART5', 'PART6', 'PART7', 'FLAGGED', 'UNANSWERED'] as const).map(f => (
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
                  {f === 'FLAGGED' && `🚩 ${flaggedCount > 0 ? flaggedCount : ''}`}
                  {f === 'UNANSWERED' && `⬜ ${unansweredCount > 0 ? unansweredCount : ''}`}
                </button>
              ))}
            </div>

            {/* Question Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredMatrixQs.map(q => {
                const isAnswered2 = !!userAnswers[q.id];
                const isFlagged2 = !!flaggedQuestions[q.id];
                const isSubmitted = !!examResult;
                const isCorrect2 = isSubmitted && userAnswers[q.id] === q.correct_answer;
                const isWrong2 = isSubmitted && userAnswers[q.id] && userAnswers[q.id] !== q.correct_answer;
                const isSkipped2 = isSubmitted && !userAnswers[q.id];

                let gridStyle = 'bg-theme-surface-2 hover:bg-theme-surface text-theme-secondary border border-theme';
                if (isSubmitted) {
                  if (isCorrect2) gridStyle = 'bg-theme-success text-white font-bold shadow-md';
                  else if (isWrong2) gridStyle = 'bg-theme-error text-white font-bold shadow-md';
                  else if (isSkipped2) gridStyle = 'alert-warning border border-theme-warning/50 font-bold';
                } else if (isFlagged2) {
                  gridStyle = 'bg-theme-warning text-white shadow-md font-bold';
                } else if (isAnswered2) {
                  gridStyle = 'bg-theme-accent text-white shadow-md';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => scrollToQuestion(q.id)}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all ${gridStyle}`}
                  >
                    {q.q_num}
                    {isFlagged2 && !isSubmitted && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-theme-error border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend Footer */}
            <div className="pt-3 border-t border-theme flex items-center justify-between text-[11px] text-theme-secondary flex-wrap gap-2">
              {examResult ? (
                <>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-theme-success" /> Đúng</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-theme-error" /> Sai</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md alert-warning border border-theme-warning/50" /> Bỏ trống</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-theme-accent" /> Đã làm</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-theme-warning" /> 🚩 Đánh dấu</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-theme-surface-2 border border-theme" /> Chưa làm</div>
                </>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* AI Explanation Modal */}
      {selectedAiQuestion && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
          <div className="bg-theme-surface border border-theme-accent/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-theme-warning" />
                <h3 className="font-bold text-base text-theme-primary">
                  AI Giải Thích & Nhắc Lại Kiến Thức — Câu #{selectedAiQuestion.q_num}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAiQuestion(null)}
                className="px-2.5 py-1 rounded-lg bg-theme-surface-2 hover:bg-theme-surface text-xs font-bold text-theme-secondary hover:text-theme-primary cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>

            {aiLoading ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-theme-warning animate-spin mx-auto" />
                <p className="text-sm font-semibold text-theme-secondary">AI đang phân tích câu hỏi...</p>
              </div>
            ) : aiErrorMsg ? (
              <div className="p-5 rounded-2xl alert-error border border-theme-error/30 text-theme-error space-y-3 animate-fade-in text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-theme-error">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Chưa Thể Phân Tích AI Chi Tiết</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{aiErrorMsg}</p>
                <div className="pt-2 flex items-center justify-between border-t border-theme-error/20">
                  <span className="text-[11px] text-theme-secondary">Hạn ngạch API Gemini Free Tier tự động reset sau vài phút / 24h.</span>
                  <button
                    onClick={() => selectedAiQuestion && handleFetchAiExplanation(selectedAiQuestion)}
                    className="px-3 py-1.5 rounded-xl alert-error hover:opacity-90 text-theme-error border border-theme-error/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Thử Lại Phân Tích Live
                  </button>
                </div>
              </div>
            ) : aiExplanationData ? (
              <div className="space-y-4 text-xs">

                {/* Grammar Topic Tag */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-theme-accent/20 border border-theme-accent/30 text-theme-accent text-[10px] font-bold flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {selectedAiQuestion.grammar_topic}
                  </span>
                  {aiExplanationData.source === 'db_cache' && (
                    <span className="px-2 py-0.5 rounded-full alert-success border border-theme-success/20 text-theme-success text-[10px] font-semibold">
                      ⚡ Tức thì từ DB
                    </span>
                  )}
                </div>

                {/* Detailed Explanation */}
                <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-1.5">
                  <h4 className="font-bold text-theme-accent flex items-center gap-1.5">🧠 Phân Tích Chi Tiết</h4>
                  <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">
                    {aiExplanationData.detailed_explanation}
                  </p>
                </div>

                {/* Option Explanations from DB */}
                {aiExplanationData.option_explanations && Object.keys(aiExplanationData.option_explanations).length > 0 && (
                  <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-2">
                    <h4 className="font-bold text-theme-primary flex items-center gap-1.5">📋 Phân Tích Từng Đáp Án</h4>
                    {Object.entries(aiExplanationData.option_explanations).map(([opt, exp]) => (
                      <div key={opt} className={`flex gap-2 p-2 rounded-lg ${opt === selectedAiQuestion.correct_answer ? 'alert-success border border-theme-success/20' : 'bg-theme-surface-2'}`}>
                        <span className={`font-bold shrink-0 ${opt === selectedAiQuestion.correct_answer ? 'text-theme-success' : 'text-theme-error'}`}>({opt})</span>
                        <span className="text-theme-secondary leading-relaxed">{exp as string}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Common Trap — Bẫy phổ biến */}
                {aiExplanationData.common_trap && (
                  <div className="p-4 rounded-xl alert-error border border-theme-error/30 space-y-1.5">
                    <h4 className="font-bold text-theme-error flex items-center gap-1.5">
                      ⚠️ Bẫy Phổ Biến — Vì Sao Hay Nhầm?
                    </h4>
                    <p className="text-theme-primary leading-relaxed">{aiExplanationData.common_trap}</p>
                  </div>
                )}

                {/* Grammar Knowledge Recall */}
                <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-1.5">
                  <h4 className="font-bold text-theme-accent flex items-center gap-1.5">📚 Nhắc Lại Kiến Thức & Quy Tắc</h4>
                  <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">
                    {aiExplanationData.grammar_recall}
                  </p>
                </div>

                {/* Exam Tip */}
                {aiExplanationData.exam_tip && (
                  <div className="p-4 rounded-xl alert-warning border border-theme-warning/30 space-y-1.5">
                    <h4 className="font-bold text-theme-warning flex items-center gap-1.5">💡 Mẹo Làm Bài Nhanh</h4>
                    <p className="text-theme-primary leading-relaxed">{aiExplanationData.exam_tip}</p>
                  </div>
                )}

                {/* Translation */}
                {(aiExplanationData.sentence_translation || aiExplanationData.sentence_translation) && (
                  <div className="p-4 rounded-xl alert-success border border-theme-success/30 space-y-1.5">
                    <h4 className="font-bold text-theme-success flex items-center gap-1.5">📝 Bản Dịch Tiếng Việt</h4>
                    <p className="text-theme-primary leading-relaxed">
                      {aiExplanationData.sentence_translation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-theme-error">
                Không thể nạp phần giải thích. Vui lòng thử lại.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score Modal on Submit */}
      {examResult && showResultModal && (
        <ExamResultModal
          result={examResult}
          onClose={() => setShowResultModal(false)}
          onRetake={() => {
            setExamResult(null);
            setShowResultModal(false);
            setUserAnswers({});
            setFlaggedQuestions({});
            setRevealedExplanations({});
            setTimeLeft(mode === 'full_exam' ? 4500 : 0);
          }}
        />
      )}

    </div>
  );
};
