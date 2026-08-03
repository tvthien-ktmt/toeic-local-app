import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, Copy, Check, FileText, Headphones, Code, Eye, Hash, Clock, Sparkles, 
  BrainCircuit, Volume2, HelpCircle, BookOpen, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { fetchDocumentById } from '../api/documents';
import type { DocumentDetail } from '../api/documents';
import { triggerExtraction, fetchQuestions } from '../api/questions';
import type { QuestionItem } from '../api/questions';
import { fetchVocabulary } from '../api/vocabulary';
import type { VocabularyItem } from '../api/vocabulary';
import { speakText } from '../utils/tts';
import { GrammarQuickRefModal } from '../components/GrammarQuickRefModal';
import { TextHighlightPopup } from '../components/TextHighlightPopup';

interface DocumentDetailPageProps {
  docId: number;
  onBack: () => void;
}

export const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({ docId, onBack }) => {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'questions' | 'vocab' | 'raw'>('preview');
  
  const [copied, setCopied] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);

  // Module 17: Selected Grammar Topic for Quick Ref Modal
  const [activeGrammarTopic, setActiveGrammarTopic] = useState<string | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedPartFilter, setSelectedPartFilter] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

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
      console.error('Failed to load questions/vocab:', err);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [docId]);

  const handleExtractAI = async () => {
    if (!doc) return;
    setIsExtracting(true);
    setErrorMsg(null);
    setExtractSuccess(null);

    try {
      const result = await triggerExtraction(doc.id);
      setExtractSuccess(`Đã trích xuất thành công ${result.questions_count} câu hỏi và ${result.vocabulary_count} từ vựng TOEIC!`);
      await loadDetail();
      setActiveTab('questions');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Có lỗi xảy ra trong quá trình trích xuất AI.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!doc) return;
    navigator.clipboard.writeText(doc.markdown_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleShowAnswer = (qId: number) => {
    setShowAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-spin">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-slate-300 font-medium">Đang tải nội dung Markdown...</p>
      </div>
    );
  }

  if (errorMsg && !doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-red-400 font-semibold">{errorMsg}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm"
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

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Action Tabs */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Markdown Preview
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Câu hỏi ({questions.length})
            </button>

            <button
              onClick={() => setActiveTab('vocab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'vocab' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Từ vựng ({vocabList.length})
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'raw' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Raw Code
            </button>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã copy' : 'Copy MD'}</span>
          </button>
        </div>
      </div>

      {/* Extract AI Banner */}
      {extractSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{extractSuccess}</span>
          </div>
          <button onClick={() => setExtractSuccess(null)} className="text-emerald-400 hover:text-emerald-200 text-xs underline">Đóng</button>
        </div>
      )}

      {/* Document Header Card */}
      <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl border ${
              doc?.doc_type === 'RC_EXAM' 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            }`}>
              {doc?.doc_type === 'RC_EXAM' ? <FileText className="w-7 h-7" /> : <Headphones className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{doc?.filename}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {doc?.doc_type === 'RC_EXAM' ? 'Reading Exam' : 'Listening Transcript'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Status: {doc?.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-4 pt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {doc?.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('vi-VN') : ''}</span>
                <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Hash: {doc?.content_hash?.substring(0, 12)}...</span>
              </p>
            </div>
          </div>

          {/* Trigger Extraction Button */}
          <button
            onClick={handleExtractAI}
            disabled={isExtracting}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 self-start sm:self-auto"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang trích xuất AI...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>Trích xuất AI (Questions & Vocab)</span>
              </>
            )}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-700/50 text-xs">
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Dung lượng Markdown</span>
            <span className="font-semibold text-slate-200">{((doc?.markdown_content.length || 0) / 1024).toFixed(2)} KB</span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Câu hỏi đã trích</span>
            <span className="font-semibold text-indigo-400">{questions.length} câu</span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Từ vựng đã trích</span>
            <span className="font-semibold text-purple-400">{vocabList.length} từ</span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Ước tính Token
            </span>
            <span className="font-semibold text-amber-300">~{tokenEstimate.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl min-h-[500px]">
        
        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="prose prose-invert max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-indigo-300 prose-code:text-amber-300 prose-pre:bg-slate-950 prose-table:border-slate-800 prose-th:bg-slate-800/80 prose-th:text-slate-200 prose-td:border-slate-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {doc?.markdown_content || ''}
            </ReactMarkdown>
          </div>
        )}

        {/* RAW TAB */}
        {activeTab === 'raw' && (
          <pre className="font-mono text-xs sm:text-sm text-indigo-200 whitespace-pre-wrap overflow-x-auto leading-relaxed bg-slate-950 p-6 rounded-2xl border border-slate-800 selection:bg-indigo-600">
            {doc?.markdown_content}
          </pre>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  Danh sách câu hỏi trích xuất ({questions.length})
                </h3>
                <p className="text-xs text-slate-400">Trích xuất câu hỏi từ Part 5, 6, 7 kèm đáp án và giải thích ngữ pháp</p>
              </div>

              {/* Part Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
                <button
                  onClick={() => setSelectedPartFilter(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedPartFilter === null ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Tất cả ({questions.length})
                </button>
                <button
                  onClick={() => setSelectedPartFilter(5)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedPartFilter === 5 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Part 5 ({questions.filter(q => q.part === 5).length})
                </button>
                <button
                  onClick={() => setSelectedPartFilter(6)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedPartFilter === 6 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Part 6 ({questions.filter(q => q.part === 6).length})
                </button>
                <button
                  onClick={() => setSelectedPartFilter(7)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedPartFilter === 7 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Part 7 ({questions.filter(q => q.part === 7).length})
                </button>
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <HelpCircle className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-slate-300 font-medium">Chưa có câu hỏi nào cho lựa chọn này</p>
                <p className="text-xs text-slate-500">Hãy nhấn nút "Trích xuất AI" ở trên để AI phân tích đề và tạo danh sách câu hỏi!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredQuestions.map((q) => {
                  let optExps: Record<string, string> = {};
                  if (q.option_explanations_json) {
                    try { optExps = JSON.parse(q.option_explanations_json); } catch(e) {}
                  }

                  return (
                    <div key={q.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 space-y-4 hover:border-slate-600 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                            Part {q.part}
                          </span>

                          {/* Module 17: Interactive Clickable Grammar Topic Badge */}
                          <button
                            onClick={() => setActiveGrammarTopic(q.grammar_topic || 'general grammar')}
                            className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center space-x-1 transition"
                            title="Bấm để xem thẻ Ôn Nhanh Ngữ Pháp"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{q.grammar_topic || 'unclassified'}</span>
                          </button>

                          {q.topic_tag && (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                              {q.topic_tag}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleShowAnswer(q.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition"
                        >
                          {showAnswers[q.id] ? 'Ẩn đáp án & giải thích' : 'Hiện đáp án & giải thích'}
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-white leading-relaxed select-text">
                        {q.question_text}
                      </h4>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl border text-xs font-medium transition ${
                              showAnswers[q.id] && q.correct_answer && opt.startsWith(q.correct_answer)
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold'
                                : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>

                      {/* Explanation box */}
                      {showAnswers[q.id] && (
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-3 animate-fade-in text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">Đáp án đúng:</span>
                            {q.correct_answer ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                {q.correct_answer}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Chưa xác định trong đề gốc (null)
                              </span>
                            )}
                          </div>

                          {/* Module 18: Option-specific explanations list */}
                          {Object.keys(optExps).length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="font-bold text-indigo-300 block">Giải thích riêng cho từng lựa chọn:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(optExps).map(([letter, expText]) => (
                                  <div key={letter} className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                                    <span className="font-bold text-amber-400 font-mono mr-1">({letter}):</span>
                                    <span className="text-slate-300">{expText}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {q.explanation && (
                            <p className="text-slate-300 leading-relaxed pt-1">
                              <span className="font-bold text-amber-300">Giải thích chung:</span> {q.explanation}
                            </p>
                          )}

                          {/* Module 18: Sentence translation */}
                          {q.translated_sentence && (
                            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                              <span className="font-bold text-emerald-400 block">Bản dịch tiếng Việt hoàn chỉnh:</span>
                              <p className="text-slate-200 italic">"{q.translated_sentence}"</p>
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
        )}

        {/* VOCABULARY TAB */}
        {activeTab === 'vocab' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Danh sách từ vựng TOEIC ({vocabList.length})
                </h3>
                <p className="text-xs text-slate-400">Phiên âm IPA, nghĩa tiếng Việt phù hợp ngữ cảnh & phát âm chuẩn Web Speech API</p>
              </div>
            </div>

            {vocabList.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <BookOpen className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-slate-300 font-medium">Chưa có từ vựng nào được trích xuất</p>
                <p className="text-xs text-slate-500">Hãy nhấn nút "Trích xuất AI" ở trên để lọc danh sách từ vựng TOEIC!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vocabList.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/60 space-y-3 hover:border-purple-500/50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-extrabold text-white capitalize">{item.word}</h4>
                          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {item.ipa}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                            {item.part_of_speech}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-emerald-300 mt-1">{item.meaning_vi}</p>
                      </div>

                      {/* TTS Audio Button */}
                      <button
                        onClick={() => speakText(item.word)}
                        className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition shrink-0"
                        title="Nghe phát âm từ vựng"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.example_sentence && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-bold text-indigo-300">Ví dụ trong đề:</span>
                          <button
                            onClick={() => speakText(item.example_sentence || '')}
                            className="text-slate-400 hover:text-indigo-300 p-1"
                            title="Nghe phát âm câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-slate-300 italic">"{item.example_sentence}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                      <span>Xuất hiện: {item.appears_in_part}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-bold">
                        Tần suất: {item.frequency_count} lần
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
