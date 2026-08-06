import React from 'react';
import { BookOpen, FileText, Sparkles, BrainCircuit, BarChart3, GraduationCap } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  activeTab: 'textbooks' | 'upload' | 'practice' | 'flashcards' | 'dashboard';
  setActiveTab: (tab: 'textbooks' | 'upload' | 'practice' | 'flashcards' | 'dashboard') => void;
  selectedDocId: number | null;
  onBackToDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, selectedDocId, onBackToDocs }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-theme-surface/90 border-b border-theme transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => { onBackToDocs(); setActiveTab('textbooks'); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-theme-primary">
                  TOEIC AI Master
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded-full">
                  Local App
                </span>
              </div>
              <p className="text-xs text-theme-secondary font-medium">Luyện thi TOEIC RC Đề Cố Định & AI</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 bg-theme-surface-2 p-1 rounded-xl border border-theme">
            <button
              onClick={() => { onBackToDocs(); setActiveTab('textbooks'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'textbooks' && !selectedDocId
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Kho Đề Cố Định</span>
            </button>

            <button
              onClick={() => { onBackToDocs(); setActiveTab('upload'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'upload' && !selectedDocId
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Đề Thi Cá Nhân</span>
            </button>

            <button
              onClick={() => { onBackToDocs(); setActiveTab('practice'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'practice'
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Luyện Tập</span>
            </button>

            <button
              onClick={() => { onBackToDocs(); setActiveTab('flashcards'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'flashcards'
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => { onBackToDocs(); setActiveTab('dashboard'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Theme Switcher & Status Info */}
          <div className="flex items-center space-x-3">
            <ThemeSwitcher />

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Local Engine Active
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
