import React from 'react';
import { BookOpen, FileText, Sparkles, BrainCircuit, BarChart3 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'upload' | 'practice' | 'flashcards' | 'dashboard';
  setActiveTab: (tab: 'upload' | 'practice' | 'flashcards' | 'dashboard') => void;
  selectedDocId: number | null;
  onBackToDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, selectedDocId, onBackToDocs }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => { onBackToDocs(); setActiveTab('upload'); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                  TOEIC AI Master
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Local MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Hệ thống học TOEIC tối ưu Token AI</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => { onBackToDocs(); setActiveTab('upload'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'upload' && !selectedDocId
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tài liệu</span>
            </button>

            <button
              onClick={() => { onBackToDocs(); setActiveTab('practice'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'practice'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Luyện tập</span>
            </button>

            <button
              onClick={() => { onBackToDocs(); setActiveTab('flashcards'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => { onBackToDocs(); setActiveTab('dashboard'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Status info */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Local Engine Active (FastAPI + SQLite)
          </div>

        </div>
      </div>
    </header>
  );
};
