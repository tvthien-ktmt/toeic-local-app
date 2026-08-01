import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UploadPage } from './pages/UploadPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { PracticePage } from './pages/PracticePage';
import { FlashcardPage } from './pages/FlashcardPage';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'practice' | 'flashcards' | 'dashboard'>('upload');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  const handleSelectDocument = (docId: number) => {
    setSelectedDocId(docId);
  };

  const handleBackToDocs = () => {
    setSelectedDocId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
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
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          TOEIC Local Study Web App &bull; Built with FastAPI, SQLite, Microsoft MarkItDown & React Vite
        </div>
      </footer>
    </div>
  );
}

export default App;
