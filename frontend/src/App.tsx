import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TextbookCatalogView } from './components/TextbookCatalogView';
import { ExamTakePage } from './pages/ExamTakePage';
import { UploadPage } from './pages/UploadPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { PracticePage } from './pages/PracticePage';
import { FlashcardPage } from './pages/FlashcardPage';
import { DashboardPage } from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';

/**
 * Root application component orchestrating top-level tab routing between Kho Đề, Upload, Practice, Flashcards, Dashboard, and Roadmap.
 */
export function App() {
  const [activeTab, setActiveTab] = useState<'textbooks' | 'upload' | 'practice' | 'flashcards' | 'dashboard' | 'roadmap'>('textbooks');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  
  // Built-in exam active mode state
  const [activeExamDocId, setActiveExamDocId] = useState<number | null>(null);
  const [activeExamMode, setActiveExamMode] = useState<'full_exam' | 'practice'>('full_exam');

  useEffect(() => {
    document.title = 'TOEIC AI Master — Luyện Thi RC 75 Phút & Đề Cố Định';
  }, []);

  const handleStartExam = (docId: number, mode: 'full_exam' | 'practice') => {
    setActiveExamDocId(docId);
    setActiveExamMode(mode);
  };

  const handleBackToCatalog = () => {
    setActiveExamDocId(null);
  };

  const handleSelectDocument = (docId: number) => {
    setSelectedDocId(docId);
  };

  const handleBackToDocs = () => {
    setSelectedDocId(null);
    setActiveExamDocId(null);
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
        selectedDocId={selectedDocId || activeExamDocId}
        onBackToDocs={handleBackToDocs}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'textbooks' && (
          activeExamDocId !== null ? (
            <ExamTakePage
              docId={activeExamDocId}
              mode={activeExamMode}
              onBack={handleBackToCatalog}
            />
          ) : (
            <TextbookCatalogView onStartExam={handleStartExam} />
          )
        )}

        {activeTab === 'upload' && (
          selectedDocId !== null ? (
            <DocumentDetailPage docId={selectedDocId} onBack={handleBackToDocs} />
          ) : (
            <UploadPage onSelectDocument={handleSelectDocument} />
          )
        )}

        {activeTab === 'practice' && <PracticePage />}

        {activeTab === 'flashcards' && <FlashcardPage />}

        {activeTab === 'dashboard' && <DashboardPage />}

        {activeTab === 'roadmap' && <RoadmapPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-theme bg-theme-surface py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-theme-secondary">
          TOEIC Local Study Web App &bull; Trọn Bộ Đề Cố Định ETS 2017-2026, Hacker, YBM & Xanh Cam
        </div>
      </footer>
    </div>
  );
}

export default App;
