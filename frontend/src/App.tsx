import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadPage } from './pages/UploadPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { PracticePage } from './pages/PracticePage';
import { FlashcardPage } from './pages/FlashcardPage';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'practice' | 'flashcards' | 'dashboard'>('upload');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'TOEIC AI Master — Ôn Thi Local App';
  }, []);

  const handleSelectDocument = (docId: number) => {
    setSelectedDocId(docId);
  };

  const handleBackToDocs = () => {
    setSelectedDocId(null);
  };

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDocId={selectedDocId}
        onBackToDocs={handleBackToDocs}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-theme bg-theme-surface py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-theme-secondary">
          TOEIC Local Study Web App &bull; Built with FastAPI, SQLite, Local PyMuPDF/Tesseract & React Vite
        </div>
      </footer>
    </div>
  );
}

export default App;
