import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { AppNavTab } from './components/Navbar';
import { TextbookCatalogView } from './components/TextbookCatalogView';
import { ExamTakePage } from './pages/ExamTakePage';
import { UploadPage } from './pages/UploadPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { PracticePage } from './pages/PracticePage';
import { FlashcardPage } from './pages/FlashcardPage';
import { DashboardPage } from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';
import { ErrorNotebookPage } from './pages/ErrorNotebookPage';
import { SpeedTrainingPage } from './pages/SpeedTrainingPage';
import { LcCatalogView } from './components/toeic/listening/LcCatalogView';
import { LcExamTakePage } from './pages/LcExamTakePage';
import { LcPracticeHubPage } from './pages/LcPracticeHubPage';
import { LcDashboardPage } from './pages/LcDashboardPage';
import { LcErrorNotebookPage } from './pages/LcErrorNotebookPage';
import { FullToeicExamTakePage } from './pages/FullToeicExamTakePage';
import { RcKnowledgeHubPage } from './pages/RcKnowledgeHubPage';
import { QuestionTypePracticePage } from './pages/QuestionTypePracticePage';
import { FrequentVocabBankPage } from './pages/FrequentVocabBankPage';
import type { LCExamDocument } from './types/toeicListening';

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
