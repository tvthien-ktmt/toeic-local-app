import React from 'react';
import {
  BookOpen,
  FileText,
  Sparkles,
  BrainCircuit,
  BarChart3,
  GraduationCap,
  Map,
  BookMarked,
  Zap,
  Headphones,
  Volume2,
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export type AppNavTab =
  | 'textbooks'
  | 'lc_catalog'
  | 'lc_practice'
  | 'lc_dashboard'
  | 'lc_errors'
  | 'roadmap'
  | 'errors'
  | 'speed'
  | 'practice'
  | 'flashcards'
  | 'dashboard'
  | 'upload';

interface NavbarProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  selectedDocId: number | null;
  onBackToDocs: () => void;
}

interface TabItem {
  id: AppNavTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  isLcSection?: boolean;
}

/**
 * Top navigation bar providing responsive tabs for both RC and LC tracks.
 */
export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, selectedDocId, onBackToDocs }) => {
  const tabs: TabItem[] = [
    {
      id: 'lc_catalog',
      label: 'Kho Đề LC (Listening)',
      shortLabel: 'Đề LC',
      icon: <Headphones className="w-4 h-4 text-theme-accent shrink-0" />,
      isLcSection: true,
    },
    {
      id: 'lc_practice',
      label: 'Luyện Nghe LC',
      shortLabel: 'Luyện LC',
      icon: <Volume2 className="w-4 h-4 text-theme-warning shrink-0" />,
      isLcSection: true,
    },
    {
      id: 'lc_dashboard',
      label: 'Dashboard LC',
      shortLabel: 'Stats LC',
      icon: <BarChart3 className="w-4 h-4 text-theme-success shrink-0" />,
      isLcSection: true,
    },
    {
      id: 'lc_errors',
      label: 'Sổ Lỗi LC (SRS)',
      shortLabel: 'Lỗi LC',
      icon: <BookMarked className="w-4 h-4 text-theme-error shrink-0" />,
      isLcSection: true,
    },
    {
      id: 'textbooks',
      label: 'Kho Đề RC (Reading)',
      shortLabel: 'Đề RC',
      icon: <GraduationCap className="w-4 h-4 text-theme-warning shrink-0" />,
    },
    {
      id: 'roadmap',
      label: 'Lộ Trình RC',
      shortLabel: 'Lộ Trình',
      icon: <Map className="w-4 h-4 text-theme-accent shrink-0" />,
    },
    {
      id: 'errors',
      label: 'Sổ Lỗi RC',
      shortLabel: 'Lỗi RC',
      icon: <BookMarked className="w-4 h-4 text-theme-error shrink-0" />,
    },
    {
      id: 'speed',
      label: 'Luyện Tốc Độ RC',
      shortLabel: 'Tốc Độ',
      icon: <Zap className="w-4 h-4 text-theme-warning shrink-0" />,
    },
    {
      id: 'practice',
      label: 'Luyện Tập RC',
      shortLabel: 'Luyện RC',
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
      label: 'Dashboard RC',
      shortLabel: 'Stats RC',
      icon: <BarChart3 className="w-4 h-4 text-theme-success shrink-0" />,
    },
    {
      id: 'upload',
      label: 'Tài Liệu Upload',
      shortLabel: 'Upload',
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleTabClick = (id: AppNavTab) => {
    onBackToDocs();
    setActiveTab(id);
  };

  const isActive = (id: AppNavTab) => {
    if (id === 'textbooks' || id === 'lc_catalog') {
      return activeTab === id && !selectedDocId;
    }

    return activeTab === id;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-theme-surface/90 border-b border-theme transition-colors">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Row 1: Logo + ThemeSwitcher + Status badge ── */}
        <div className="flex items-center justify-between h-12 border-b border-theme/50">

          {/* Logo */}
          <div
            onClick={() => handleTabClick('lc_catalog')}
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
                  LC &amp; RC Full
                </span>
              </div>
              <p className="text-[10px] text-theme-secondary whitespace-nowrap leading-none mt-0.5">
                Hệ thống luyện thi TOEIC Listening &amp; Reading Chuẩn ETS
              </p>
            </div>
          </div>

          {/* Right side: ThemeSwitcher + status */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg alert-success border border-theme-success/30 text-theme-success text-[10px] font-medium whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
              LC &amp; RC Engines Active
            </div>
            <ThemeSwitcher />
          </div>
        </div>

        {/* ── Row 2: Navigation tabs ── */}
        <div className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const active = isActive(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                title={tab.label}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer
                  ${active
                    ? 'bg-theme-accent text-white shadow-md font-bold'
                    : tab.isLcSection
                    ? 'text-theme-primary hover:bg-theme-surface-2 border border-theme-accent/20'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2'
                  }
                `}
              >
                {tab.icon}
                {/* Full label on large screens, short on medium, icon-only on small */}
                <span className="hidden md:inline lg:hidden">{tab.shortLabel}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
