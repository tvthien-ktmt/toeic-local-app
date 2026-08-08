import React from 'react';
import { BookOpen, FileText, Sparkles, BrainCircuit, BarChart3, GraduationCap, Map } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  activeTab: 'textbooks' | 'upload' | 'practice' | 'flashcards' | 'dashboard' | 'roadmap';
  setActiveTab: (tab: 'textbooks' | 'upload' | 'practice' | 'flashcards' | 'dashboard' | 'roadmap') => void;
  selectedDocId: number | null;
  onBackToDocs: () => void;
}

type Tab = {
  id: NavbarProps['activeTab'];
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  special?: boolean;
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, selectedDocId, onBackToDocs }) => {
  const tabs: Tab[] = [
    {
      id: 'textbooks',
      label: 'Kho Đề Cố Định',
      shortLabel: 'Kho Đề',
      icon: <GraduationCap className="w-4 h-4 text-theme-warning shrink-0" />,
    },
    {
      id: 'upload',
      label: 'Đề Thi Cá Nhân',
      shortLabel: 'Cá Nhân',
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'practice',
      label: 'Luyện Tập',
      shortLabel: 'Luyện Tập',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      shortLabel: 'Flash',
      icon: <Sparkles className="w-4 h-4 text-theme-accent shrink-0" />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Stats',
      icon: <BarChart3 className="w-4 h-4 text-theme-success shrink-0" />,
    },
    {
      id: 'roadmap',
      label: 'Lộ Trình',
      shortLabel: 'Lộ Trình',
      icon: <Map className="w-4 h-4 text-theme-accent shrink-0" />,
      special: true,
    },
  ];

  const handleTabClick = (id: NavbarProps['activeTab']) => {
    onBackToDocs();
    setActiveTab(id);
  };

  const isActive = (id: NavbarProps['activeTab']) => {
    if (id === 'textbooks') return activeTab === 'textbooks' && !selectedDocId;
    return activeTab === id;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-theme-surface/90 border-b border-theme transition-colors">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Row 1: Logo + ThemeSwitcher + Status badge ── */}
        <div className="flex items-center justify-between h-12 border-b border-theme/50">

          {/* Logo */}
          <div
            onClick={() => handleTabClick('textbooks')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-theme-accent flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-theme-primary whitespace-nowrap">
                  TOEIC AI Master
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded-full whitespace-nowrap">
                  Local
                </span>
              </div>
              <p className="text-[10px] text-theme-secondary whitespace-nowrap leading-none mt-0.5">
                Luyện thi TOEIC RC &amp; AI
              </p>
            </div>
          </div>

          {/* Right side: ThemeSwitcher + status */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg alert-success border border-theme-success/30 text-theme-success text-[10px] font-medium whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
              Engine Active
            </div>
            <ThemeSwitcher />
          </div>
        </div>

        {/* ── Row 2: Navigation tabs ── */}
        <div className="flex items-center gap-0.5 h-10 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const active = isActive(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                title={tab.label}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0
                  ${active
                    ? 'bg-theme-accent text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2'
                  }
                `}
              >
                {tab.icon}
                {/* Full label on large screens, short on medium, icon-only on small */}
                <span className="hidden md:inline">{tab.shortLabel}</span>
                <span className="hidden lg:inline md:hidden">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
