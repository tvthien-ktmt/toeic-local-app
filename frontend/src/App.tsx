import { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import type { AppNavTab } from './components/Navbar';
import type { LCExamDocument } from './types/toeicListening';

// Route-based code-splitting: each page becomes a separate JS chunk loaded on demand,
// reducing initial bundle size from ~1MB to ~100KB (Navbar + active page only).
const TextbookCatalogView = lazy(() => import('./components/TextbookCatalogView').then(m => ({ default: m.TextbookCatalogView })));
const ExamTakePage = lazy(() => import('./pages/ExamTakePage').then(m => ({ default: m.ExamTakePage })));
const UploadPage = lazy(() => import('./pages/UploadPage').then(m => ({ default: m.UploadPage })));
const DocumentDetailPage = lazy(() => import('./pages/DocumentDetailPage').then(m => ({ default: m.DocumentDetailPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then(m => ({ default: m.PracticePage })));
const FlashcardPage = lazy(() => import('./pages/FlashcardPage').then(m => ({ default: m.FlashcardPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const ErrorNotebookPage = lazy(() => import('./pages/ErrorNotebookPage').then(m => ({ default: m.ErrorNotebookPage })));
const SpeedTrainingPage = lazy(() => import('./pages/SpeedTrainingPage').then(m => ({ default: m.SpeedTrainingPage })));
const LcCatalogView = lazy(() => import('./components/toeic/listening/LcCatalogView').then(m => ({ default: m.LcCatalogView })));
const LcExamTakePage = lazy(() => import('./pages/LcExamTakePage').then(m => ({ default: m.LcExamTakePage })));
const LcPracticeHubPage = lazy(() => import('./pages/LcPracticeHubPage').then(m => ({ default: m.LcPracticeHubPage })));
const LcDashboardPage = lazy(() => import('./pages/LcDashboardPage').then(m => ({ default: m.LcDashboardPage })));
const LcErrorNotebookPage = lazy(() => import('./pages/LcErrorNotebookPage').then(m => ({ default: m.LcErrorNotebookPage })));
const FullToeicExamTakePage = lazy(() => import('./pages/FullToeicExamTakePage').then(m => ({ default: m.FullToeicExamTakePage })));
const RcKnowledgeHubPage = lazy(() => import('./pages/RcKnowledgeHubPage').then(m => ({ default: m.RcKnowledgeHubPage })));
const QuestionTypePracticePage = lazy(() => import('./pages/QuestionTypePracticePage').then(m => ({ default: m.QuestionTypePracticePage })));
const FrequentVocabBankPage = lazy(() => import('./pages/FrequentVocabBankPage').then(m => ({ default: m.FrequentVocabBankPage })));

/**
 * Fullscreen loading skeleton shown while lazy-loaded page chunks are being fetched.
 */
function PageLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-theme-secondary animate-pulse">
      <div className="w-10 h-10 rounded-full border-4 border-theme-accent border-t-transparent animate-spin" />
      <p className="text-sm font-medium">Đang tải trang...</p>
    </div>
  );
}

/**
 * Root application component orchestrating top-level navigation between LC & RC tracks.
 */
export function App() {
  const [activeTab, setActiveTab] = useState<AppNavTab>('lc_catalog');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  
  // RC Exam active state
  const [activeExamDocId, setActiveExamDocId] = useState<number | null>(null);
  const [activeExamMode, setActiveExamMode] = useState<'full_exam' | 'practice'>('full_exam');

  // LC Exam active state
  const [activeLcExamDoc, setActiveLcExamDoc] = useState<LCExamDocument | null>(null);
  const [activeLcExamMode, setActiveLcExamMode] = useState<'full_exam' | 'practice'>('full_exam');

  useEffect(() => {
    document.title = 'TOEIC AI Master — Luyện Thi LC & RC Chuẩn ETS';
  }, []);

  const handleStartRcExam = (docId: number, mode: 'full_exam' | 'practice') => {
    setActiveExamDocId(docId);
    setActiveExamMode(mode);
  };

  const handleStartLcExam = (document: LCExamDocument, mode: 'full_exam' | 'practice') => {
    setActiveLcExamDoc(document);
    setActiveLcExamMode(mode);
  };

  const handleBackToRcCatalog = () => {
    setActiveExamDocId(null);
  };

  const handleBackToLcCatalog = () => {
    setActiveLcExamDoc(null);
  };

  const handleSelectDocument = (docId: number) => {
    setSelectedDocId(docId);
  };

  const handleBackToDocs = () => {
    setSelectedDocId(null);
    setActiveExamDocId(null);
    setActiveLcExamDoc(null);
  };

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          handleBackToDocs();
          setActiveTab(tab);
        }}
        selectedDocId={selectedDocId || activeExamDocId || (activeLcExamDoc ? activeLcExamDoc.id : null)}
        onBackToDocs={handleBackToDocs}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
      <Suspense fallback={<PageLoadingSkeleton />}>
        {/* Full 2-Skill Exam Track */}
        {activeTab === 'full_exam' && (
          <FullToeicExamTakePage
            onNavigateHome={() => setActiveTab('lc_catalog')}
          />
        )}

        {/* Knowledge & Tactics Curriculum Track */}
        {activeTab === 'rc_knowledge' && (
          <RcKnowledgeHubPage
            onNavigateDrills={() => setActiveTab('type_drills')}
          />
        )}

        {/* Question-Type Drills Track */}
        {activeTab === 'type_drills' && (
          <QuestionTypePracticePage
            onNavigateLessons={() => setActiveTab('rc_knowledge')}
            onNavigateHome={() => setActiveTab('lc_catalog')}
          />
        )}

        {/* Frequent High-Yield Vocabulary Bank Track */}
        {activeTab === 'frequent_vocab' && (
          <FrequentVocabBankPage
            onNavigateFlashcards={() => setActiveTab('flashcards')}
          />
        )}

        {/* LC Track */}
        {activeTab === 'lc_catalog' && (
          activeLcExamDoc !== null ? (
            <LcExamTakePage
              document={activeLcExamDoc}
              mode={activeLcExamMode}
              onBack={handleBackToLcCatalog}
              onNavigateHome={() => setActiveTab('lc_catalog')}
            />
          ) : (
            <LcCatalogView onStartExam={handleStartLcExam} />
          )
        )}

        {activeTab === 'lc_practice' && (
          <LcPracticeHubPage
            onNavigateHome={() => setActiveTab('lc_catalog')}
            onNavigateCatalog={() => setActiveTab('lc_catalog')}
          />
        )}

        {activeTab === 'lc_dashboard' && (
          <LcDashboardPage
            onNavigateTab={(tab) => setActiveTab(tab as AppNavTab)}
            onStartExam={() => {
              setActiveTab('lc_catalog');
            }}
          />
        )}

        {activeTab === 'lc_errors' && (
          <LcErrorNotebookPage
            onNavigateHome={() => setActiveTab('lc_catalog')}
            onNavigateCatalog={() => setActiveTab('lc_catalog')}
          />
        )}

        {/* RC Track */}
        {activeTab === 'textbooks' && (
          activeExamDocId !== null ? (
            <ExamTakePage
              docId={activeExamDocId}
              mode={activeExamMode}
              onBack={handleBackToRcCatalog}
            />
          ) : (
            <TextbookCatalogView onStartExam={handleStartRcExam} />
          )
        )}

        {activeTab === 'roadmap' && <RoadmapPage />}

        {activeTab === 'errors' && <ErrorNotebookPage />}

        {activeTab === 'speed' && <SpeedTrainingPage />}

        {activeTab === 'practice' && <PracticePage />}

        {activeTab === 'flashcards' && <FlashcardPage />}

        {activeTab === 'dashboard' && <DashboardPage onNavigateTab={(tab) => setActiveTab(tab as AppNavTab)} />}

        {activeTab === 'upload' && (
          selectedDocId !== null ? (
            <DocumentDetailPage docId={selectedDocId} onBack={handleBackToDocs} />
          ) : (
            <UploadPage onSelectDocument={handleSelectDocument} />
          )
        )}
      </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme bg-theme-surface py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-theme-secondary">
          TOEIC Local Study Web App &bull; Trọn Bộ Đề Cố Định LC &amp; RC (ETS 2017-2026, Hacker, YBM &amp; Xanh Cam)
        </div>
      </footer>
    </div>
  );
}

export default App;
