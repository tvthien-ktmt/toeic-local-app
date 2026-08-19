import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, FileText } from 'lucide-react';
import { fetchDocumentById } from '../api/documents';
import type { DocumentDetail } from '../api/documents';
import { triggerExtraction, fetchQuestions } from '../api/questions';
import type { QuestionItem } from '../api/questions';
import { fetchVocabulary } from '../api/vocabulary';
import type { VocabularyItem } from '../api/vocabulary';
import { GrammarQuickRefModal } from '../components/GrammarQuickRefModal';
import { TextHighlightPopup } from '../components/TextHighlightPopup';
import { DocumentQuestionsView } from '../components/DocumentQuestionsView';
import { DocumentVocabView } from '../components/DocumentVocabView';
import { DocumentHeaderBanner } from '../components/DocumentHeaderBanner';
import { useStudySessionTracker } from '../hooks/useStudySessionTracker';
import { useTheme } from '../context/ThemeContext';

interface DocumentDetailPageProps {
  docId: number;
  onBack: () => void;
}

/**
 * Document detail view displaying raw markdown text with inline AI vocabulary popup, extracted questions, and vocabulary tab.
 */
export const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({ docId, onBack }) => {
  useStudySessionTracker('reading');
  const { theme } = useTheme();

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'questions' | 'vocab'>('preview');

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeGrammarTopic, setActiveGrammarTopic] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedPartFilter, setSelectedPartFilter] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const [examMode, setExamMode] = useState<'free' | 'timed_75'>('free');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [weakParts, setWeakParts] = useState<number[]>([]);

  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);

  const loadExtractedData = async (id: number) => {
    try {
      const questionResponse = await fetchQuestions({ document_id: id, limit: 100 });
      setQuestions(questionResponse.items);

      const vocabResponse = await fetchVocabulary({ document_id: id, limit: 100 });
      setVocabList(vocabResponse.items);
    } catch (error) {
      console.error('Failed to load extracted data:', error);
    }
  };

  const loadDetail = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDocumentById(docId);
      setDoc(data);
      await loadExtractedData(docId);
    } catch (error) {
      setErrorMsg('Không thể tải chi tiết tài liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [docId]);

  const handleTriggerExtraction = async () => {
    if (!doc) {
      return;
    }

    setIsExtracting(true);
    setErrorMsg(null);
    try {
      await triggerExtraction(doc.id);
      await loadDetail();
      setActiveTab('questions');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Có lỗi xảy ra trong quá trình trích xuất AI.');
    } finally {
      setIsExtracting(false);
    }
  };

  const copyTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyMarkdown = () => {
    if (!doc) {
      return;
    }

    navigator.clipboard.writeText(doc.markdown_content);
    setIsCopied(true);
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleShowAnswer = (questionId: number) => {
    setShowAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: !previousAnswers[questionId],
    }));
  };

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    if (isExamSubmitted) {
      return;
    }

    setUserAnswers((previousAnswers) => ({ ...previousAnswers, [questionId]: optionLetter }));
  };

  const handleSubmitExam = () => {
    setIsExamSubmitted(true);

    let correctCount = 0;
    const weakGrammarMap: Record<string, number> = {};
    const weakPartMap: Record<number, number> = {};

    questions.forEach((questionItem) => {
      const userChoice = userAnswers[questionItem.id];
      const isCorrect =
        questionItem.correct_answer &&
        userChoice &&
        userChoice.toUpperCase() === questionItem.correct_answer.toUpperCase();

      if (isCorrect) {
        correctCount += 1;
      } else {
        const topic = questionItem.grammar_topic || 'general grammar';
        weakGrammarMap[topic] = (weakGrammarMap[topic] || 0) + 1;
        weakPartMap[questionItem.part] = (weakPartMap[questionItem.part] || 0) + 1;
      }
    });

    setScore({ correct: correctCount, total: questions.length });

    const allAns: Record<number, boolean> = {};
    questions.forEach((questionItem) => {
      allAns[questionItem.id] = true;
    });
    setShowAnswers(allAns);

    setWeakTopics(Object.keys(weakGrammarMap));
    setWeakParts(Object.keys(weakPartMap).map(Number));
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const filteredQuestions = selectedPartFilter
    ? questions.filter((questionItem) => questionItem.part === selectedPartFilter)
    : questions;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 relative">
      <TextHighlightPopup documentId={docId} />

      <GrammarQuickRefModal
        topicName={activeGrammarTopic}
        onClose={() => setActiveGrammarTopic(null)}
      />

      <DocumentHeaderBanner
        doc={doc}
        docId={docId}
        questionCount={questions.length}
        vocabCount={vocabList.length}
        isExtracting={isExtracting}
        isCopied={isCopied}
        activeTab={activeTab}
        onBack={onBack}
        onTriggerExtraction={handleTriggerExtraction}
        onCopyMarkdown={handleCopyMarkdown}
        onSetActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="bg-theme-surface rounded-3xl p-6 sm:p-8 border border-theme shadow-2xl">
        {activeTab === 'preview' && (
          <div
            className={`prose max-w-none select-text ${
              theme === 'light' ? 'prose-neutral' : 'prose-invert'
            } prose-headings:text-theme-accent prose-a:text-theme-accent`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {doc?.markdown_content || ''}
            </ReactMarkdown>
          </div>
        )}

        {activeTab === 'questions' && (
          <DocumentQuestionsView
            filteredQuestions={filteredQuestions}
            selectedPartFilter={selectedPartFilter}
            examMode={examMode}
            userAnswers={userAnswers}
            isExamSubmitted={isExamSubmitted}
            score={score}
            weakTopics={weakTopics}
            weakParts={weakParts}
            showAnswers={showAnswers}
            onSetExamMode={setExamMode}
            onSetSelectedPartFilter={setSelectedPartFilter}
            onSelectOption={handleSelectOption}
            onSubmitExam={handleSubmitExam}
            onToggleShowAnswer={toggleShowAnswer}
            onOpenGrammarModal={setActiveGrammarTopic}
          />
        )}

        {activeTab === 'vocab' && <DocumentVocabView vocabList={vocabList} />}
      </div>
    </div>
  );
};
