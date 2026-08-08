import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, Copy, Check, FileText, Eye, 
  BrainCircuit, Volume2, HelpCircle, BookOpen, CheckCircle2, RefreshCw, Award, XCircle
} from 'lucide-react';
import { fetchDocumentById } from '../api/documents';
import type { DocumentDetail } from '../api/documents';
import { triggerExtraction, fetchQuestions } from '../api/questions';
import type { QuestionItem } from '../api/questions';
import { fetchVocabulary } from '../api/vocabulary';
import type { VocabularyItem } from '../api/vocabulary';
import { speakText } from '../utils/tts';
import { GrammarQuickRefModal } from '../components/GrammarQuickRefModal';
import { MarkdownPassage } from '../components/MarkdownPassage';
import { TextHighlightPopup } from '../components/TextHighlightPopup';
import { PracticeTimer } from '../components/PracticeTimer';
import { AIStudyRecommendationCard } from '../components/AIStudyRecommendationCard';
import { useStudySessionTracker } from '../hooks/useStudySessionTracker';
import { useTheme } from '../context/ThemeContext';

interface DocumentDetailPageProps {
  docId: number;
  onBack: () => void;
}

export const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({ docId, onBack }) => {
  // Track study session automatically when reading document
  useStudySessionTracker('reading');
  const { theme } = useTheme();

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'questions' | 'vocab' | 'raw'>('preview');
  
  const [copied, setCopied] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Module 17: Selected Grammar Topic for Quick Ref Modal
  const [activeGrammarTopic, setActiveGrammarTopic] = useState<string | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedPartFilter, setSelectedPartFilter] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  // Exam Modes (Thi tự do vs Thi 75 Phút)
  const [examMode, setExamMode] = useState<'free' | 'timed_75'>('free');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [weakParts, setWeakParts] = useState<number[]>([]);

  // Vocab state
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);

  const loadDetail = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDocumentById(docId);
      setDoc(data);
      await loadExtractedData(docId);
    } catch (err) {
      setErrorMsg('Không thể tải chi tiết tài liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExtractedData = async (id: number) => {
    try {
      const qRes = await fetchQuestions({ document_id: id, limit: 100 });
      setQuestions(qRes.items);

      const vRes = await fetchVocabulary({ document_id: id, limit: 100 });
      setVocabList(vRes.items);
    } catch (err) {
      console.error("Failed to load extracted data:", err);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [docId]);

  const handleTriggerExtraction = async () => {
    if (!doc) return;
    setIsExtracting(true);
    setErrorMsg(null);
    try {
      await triggerExtraction(doc.id);
      await loadDetail();
      setActiveTab('questions');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Có lỗi xảy ra trong quá trình trích xuất AI.');
    } finally {
      setIsExtracting(false);
    }
  };

  const copyTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyMarkdown = () => {
    if (!doc) return;
    navigator.clipboard.writeText(doc.markdown_content);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const toggleShowAnswer = (qId: number) => {
    setShowAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSelectOption = (qId: number, optionLetter: string) => {
    if (isExamSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionLetter }));
  };

  const handleSubmitExam = () => {
    setIsExamSubmitted(true);

    let correctCount = 0;
    const weakGrammarMap: Record<string, number> = {};
    const weakPartMap: Record<number, number> = {};

    questions.forEach(q => {
      const userChoice = userAnswers[q.id];
      const isCorrect = q.correct_answer && userChoice && userChoice.toUpperCase() === q.correct_answer.toUpperCase();

      if (isCorrect) {
        correctCount += 1;
      } else {
        const topic = q.grammar_topic || 'general grammar';
        weakGrammarMap[topic] = (weakGrammarMap[topic] || 0) + 1;
        weakPartMap[q.part] = (weakPartMap[q.part] || 0) + 1;
      }
    });

    setScore({ correct: correctCount, total: questions.length });

    // Show answers for all questions
    const allAns: Record<number, boolean> = {};
    questions.forEach(q => { allAns[q.id] = true; });
    setShowAnswers(allAns);

    // Identify top weak grammar topics and parts
    setWeakTopics(Object.keys(weakGrammarMap));
    setWeakParts(Object.keys(weakPartMap).map(Number));
  };

  const getOptionLetter = (optStr: string): string => {
    const clean = optStr.trim();
    if (clean.startsWith('A') || clean.startsWith('(A)')) return 'A';
    if (clean.startsWith('B') || clean.startsWith('(B)')) return 'B';
    if (clean.startsWith('C') || clean.startsWith('(C)')) return 'C';
    if (clean.startsWith('D') || clean.startsWith('(D)')) return 'D';
    return clean.charAt(0);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-theme-accent/20 border border-theme-accent/30 flex items-center justify-center text-theme-accent animate-spin">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-theme-secondary font-medium">Đang tải nội dung Markdown...</p>
      </div>
    );
  }

  if (errorMsg && !doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-4 rounded-xl alert-error text-center font-semibold">
          {errorMsg}
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const tokenEstimate = Math.round((doc?.markdown_content.length || 0) / 4);
  const filteredQuestions = selectedPartFilter 
    ? questions.filter(q => q.part === selectedPartFilter)
    : questions;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 relative">
      {/* Module 16: Highlight Text Instant Context Lookup Popup */}
      <TextHighlightPopup documentId={docId} />

      {/* Module 17: Grammar Quick Ref Modal */}
      <GrammarQuickRefModal
        topicName={activeGrammarTopic}
        onClose={() => setActiveGrammarTopic(null)}
      />

      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition text-sm font-semibold w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tài liệu
        </button>

        <div className="flex items-center gap-3">
          {questions.length === 0 ? (
            <button
              onClick={handleTriggerExtraction}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-accent text-white text-xs sm:text-sm font-bold shadow-lg transition hover:opacity-90 disabled:opacity-50"
            >
              {isExtracting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BrainCircuit className="w-4 h-4" />
              )}
              <span>{isExtracting ? 'Đang trích xuất AI...' : 'Trích Xuất AI (Tự Động 0 Token Waste)'}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl alert-success text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 alert-success-icon" /> Đã trích xuất {questions.length} câu hỏi
            </span>
          )}

          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-xs font-semibold transition"
          >
            {copied ? <Check className="w-4 h-4 text-theme-success" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Banner info */}
      <div className="bg-theme-surface rounded-3xl p-6 border border-theme space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-theme-accent/20 text-theme-accent border border-theme-accent/30">
                {doc?.doc_type === 'RC_EXAM' ? 'Reading Test (Part 5, 6, 7)' : 'Listening Transcript'}
              </span>
              <span className="text-theme-secondary text-xs font-mono">
                {doc?.markdown_content.length.toLocaleString()} ký tự (~{tokenEstimate.toLocaleString()} tokens)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-theme-primary">{doc?.filename}</h1>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-theme pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'preview' ? 'bg-theme-accent text-white shadow-lg' : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            <Eye className="w-4 h-4" /> Xem Bài Đọc & Đề Thi
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'questions' ? 'bg-theme-accent text-white shadow-lg' : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Làm Bài Thi ({questions.length})
          </button>

          <button
            onClick={() => setActiveTab('vocab')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'vocab' ? 'bg-theme-accent text-white shadow-lg' : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Từ Vựng Trích Xuất ({vocabList.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-theme-surface rounded-3xl p-6 sm:p-8 border border-theme shadow-2xl">
        
        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className={`prose max-w-none select-text ${theme === 'light' ? 'prose-neutral' : 'prose-invert'} prose-headings:text-theme-accent prose-a:text-theme-accent`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {doc?.markdown_content || ''}
            </ReactMarkdown>
          </div>
        )}

        {/* QUESTIONS TAB & EXAM ENGINE */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            
            {/* Exam Mode Selector Banner */}
            <div className="p-6 rounded-2xl bg-theme-surface-2 border border-theme space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
                    <Award className="w-5 h-5 text-theme-warning" />
                    Chọn Chế Độ Thi Đề Thi Này
                  </h3>
                  <p className="text-xs text-theme-secondary">Chọn làm tự do không giới hạn thời gian hoặc thi 75 phút áp lực thi thật</p>
                </div>

                {/* Exam Mode Toggle */}
                <div className="inline-flex p-1 bg-theme-surface rounded-xl border border-theme space-x-1 shrink-0">
                  <button
                    onClick={() => { setExamMode('free'); setIsExamSubmitted(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      examMode === 'free' ? 'bg-theme-accent text-white shadow-lg' : 'text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    Thi Tự Do (Tự tính giờ)
                  </button>

                  <button
                    onClick={() => { setExamMode('timed_75'); setIsExamSubmitted(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      examMode === 'timed_75' ? 'bg-theme-warning text-white font-extrabold shadow-lg' : 'text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    Thi 75 Phút (Có đếm ngược)
                  </button>
                </div>
              </div>

              {/* Timer or Score Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-theme">
                {examMode === 'timed_75' ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-theme-warning">Thời Gian Đếm Ngược:</span>
                    <PracticeTimer targetMinutes={75} onTimeUp={handleSubmitExam} isPaused={isExamSubmitted} />
                  </div>
                ) : (
                  <span className="text-xs text-theme-secondary font-medium">Chế độ thi tự do — Chọn đáp án và bấm Nộp bài thi bất kỳ lúc nào</span>
                )}

                {!isExamSubmitted ? (
                  <button
                    onClick={handleSubmitExam}
                    className="px-4 py-2 bg-theme-success hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                  >
                    Nộp Bài Thi
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-bold text-theme-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã nộp bài! Điểm số: {score.correct} / {score.total} câu ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Personalized Recommendation Card after submission */}
            {isExamSubmitted && (
              <AIStudyRecommendationCard
                scoreCorrect={score.correct}
                scoreTotal={score.total}
                weakGrammarTopics={weakTopics}
                weakParts={weakParts}
              />
            )}

            {/* Question Filter Header */}
            <div className="flex items-center justify-between pb-2 border-b border-theme">
              <span className="text-xs text-theme-secondary font-semibold">Danh sách {filteredQuestions.length} câu hỏi</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSelectedPartFilter(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedPartFilter === null ? 'bg-theme-accent text-white' : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setSelectedPartFilter(5)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedPartFilter === 5 ? 'bg-theme-accent text-white' : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'}`}
                >
                  Part 5
                </button>
                <button
                  onClick={() => setSelectedPartFilter(6)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedPartFilter === 6 ? 'bg-theme-accent text-white' : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'}`}
                >
                  Part 6
                </button>
                <button
                  onClick={() => setSelectedPartFilter(7)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedPartFilter === 7 ? 'bg-theme-accent text-white' : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'}`}
                >
                  Part 7
                </button>
              </div>
            </div>

            {/* Question items */}
            {filteredQuestions.map((q, idx) => {
              const uChoice = userAnswers[q.id];

              let optExps: Record<string, string> = {};
              if (q.option_explanations_json) {
                try { optExps = JSON.parse(q.option_explanations_json); } catch(e) {}
              }

              const showDetail = isExamSubmitted || showAnswers[q.id];

              return (
                <div key={q.id} className="bg-theme-surface-2 rounded-2xl p-6 border border-theme space-y-4 shadow-sm hover:border-theme-accent transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-theme-accent/20 text-theme-accent font-mono text-xs font-bold border border-theme-accent/30">
                        Câu {idx + 1} (Part {q.part})
                      </span>

                      {/* Module 17 Badge */}
                      <button
                        onClick={() => setActiveGrammarTopic(q.grammar_topic || 'general grammar')}
                        className="px-2.5 py-1 rounded-lg bg-theme-accent/15 hover:bg-theme-accent/25 text-theme-accent border border-theme-accent/30 text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{q.grammar_topic || 'unclassified'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleShowAnswer(q.id)}
                      className="px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-surface-2 text-theme-primary text-xs font-semibold border border-theme transition"
                    >
                      {showDetail ? 'Ẩn đáp án' : 'Xem giải thích'}
                    </button>
                  </div>

                  <div className="text-base font-bold text-theme-primary leading-relaxed select-text">
                    <MarkdownPassage text={q.question_text} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, oIdx) => {
                      const letter = getOptionLetter(opt);
                      const isSelected = uChoice === letter;
                      const isOptCorrect = q.correct_answer && letter.toUpperCase() === q.correct_answer.toUpperCase();

                      let optStyle = "bg-theme-surface border-theme text-theme-primary hover:bg-theme-surface-2";

                      if (showDetail) {
                        if (isOptCorrect) {
                          optStyle = "alert-success border-theme-success font-bold text-theme-success shadow-lg";
                        } else if (isSelected) {
                          optStyle = "alert-error border-theme-error font-bold text-theme-error";
                        } else {
                          optStyle = "bg-theme-surface border-theme text-theme-secondary opacity-60";
                        }
                      } else if (isSelected) {
                        optStyle = "bg-theme-accent/20 border-theme-accent text-theme-accent font-bold";
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isExamSubmitted}
                          onClick={() => handleSelectOption(q.id, letter)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between ${optStyle}`}
                        >
                          <span>{opt}</span>
                          {showDetail && isOptCorrect && <CheckCircle2 className="w-4 h-4 text-theme-success shrink-0" />}
                          {showDetail && isSelected && !isOptCorrect && <XCircle className="w-4 h-4 text-theme-error shrink-0" />}
                          {!showDetail && isSelected && <Check className="w-4 h-4 text-theme-accent shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Explanations */}
                  {showDetail && (
                    <div className="p-4 rounded-xl bg-theme-surface border border-theme space-y-3 text-xs animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-theme-success">Đáp án chính xác:</span>
                        <span className="px-2 py-0.5 rounded alert-success font-bold">
                          {q.correct_answer || 'N/A'}
                        </span>
                      </div>

                      {/* Option specific explanations */}
                      {Object.keys(optExps).length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="font-bold text-theme-accent block">Giải thích chi tiết các lựa chọn:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(optExps).map(([letter, expText]) => (
                              <div key={letter} className="p-2 bg-theme-surface-2 border border-theme rounded-lg">
                                <span className="font-bold text-theme-warning font-mono mr-1">({letter}):</span>
                                <span className="text-theme-primary">{expText}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.explanation && (
                        <p className="text-theme-primary leading-relaxed pt-1">
                          <span className="font-bold text-theme-warning">Giải thích chung:</span> {q.explanation}
                        </p>
                      )}

                      {q.translated_sentence && (
                        <div className="p-3 bg-theme-surface-2 border border-theme rounded-xl space-y-1">
                          <span className="font-bold text-theme-success block">Bản dịch tiếng Việt hoàn chỉnh:</span>
                          <p className="text-theme-primary italic leading-relaxed">"{q.translated_sentence}"</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* VOCAB TAB */}
        {activeTab === 'vocab' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-theme-accent" />
              Danh sách từ vựng trích xuất ({vocabList.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabList.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-theme-surface-2 border border-theme space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-theme-accent">{v.word}</span>
                    <button onClick={() => speakText(v.word)} className="p-1 text-theme-secondary hover:text-theme-accent transition">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-theme-secondary font-mono">{v.ipa} • {v.part_of_speech}</p>
                  <p className="text-sm font-semibold text-theme-success">{v.meaning_vi}</p>
                  {v.example_sentence && (
                    <p className="text-xs text-theme-primary italic border-l-2 border-theme-accent pl-2">"{v.example_sentence}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
