import React, { useState } from 'react';
import {
  Volume2,
  FileText,
  Mic,
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  Headphones,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DictationPracticeView } from '../components/toeic/listening/DictationPracticeView';
import { ShadowingPracticeView } from '../components/toeic/listening/ShadowingPracticeView';
import { TrapTrainingView } from '../components/toeic/listening/TrapTrainingView';
import { ParaphraseTrainingView } from '../components/toeic/listening/ParaphraseTrainingView';
import { TranscriptSmartView } from '../components/toeic/listening/TranscriptSmartView';
import { LcFeatureUpdatingCard } from '../components/toeic/listening/LcFeatureUpdatingCard';

type PracticeSubTab =
  | 'DICTATION'
  | 'SHADOWING'
  | 'TRAPS'
  | 'PARAPHRASE'
  | 'TRANSCRIPT'
  | 'PART1_DRILL'
  | 'PART2_DRILL'
  | 'PART3_DRILL'
  | 'PART4_DRILL';

interface LcPracticeHubPageProps {
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Central Learning and Skill Practice Hub for TOEIC Listening.
 * Orchestrates Dictation, Shadowing, Traps, Paraphrases, Transcripts, and Part-by-Part Drills.
 */
export const LcPracticeHubPage: React.FC<LcPracticeHubPageProps> = ({
  onNavigateHome,
  onNavigateCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<PracticeSubTab>('DICTATION');

  const navItems: Array<{ id: PracticeSubTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'DICTATION', label: 'Chép Chính Tả (Dictation)', icon: <FileText className="w-4 h-4" />, badge: 'Cốt Lõi' },
    { id: 'SHADOWING', label: 'Luyện Shadowing & Nói', icon: <Mic className="w-4 h-4" />, badge: 'Phản Xạ' },
    { id: 'TRAPS', label: 'Luyện Nhận Diện Bẫy LC', icon: <AlertTriangle className="w-4 h-4 text-theme-warning" />, badge: 'Bẫy ETS' },
    { id: 'PARAPHRASE', label: 'Cặp Từ Paraphrase', icon: <ArrowRightLeft className="w-4 h-4 text-theme-accent" /> },
    { id: 'TRANSCRIPT', label: 'Kho Transcript Thông Minh', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'PART1_DRILL', label: 'Part 1 — Hình Ảnh', icon: <Headphones className="w-4 h-4" /> },
    { id: 'PART2_DRILL', label: 'Part 2 — Hỏi Đáp Nhanh', icon: <Zap className="w-4 h-4 text-theme-warning" /> },
    { id: 'PART3_DRILL', label: 'Part 3 — Hội Thoại', icon: <Volume2 className="w-4 h-4 text-theme-accent" /> },
    { id: 'PART4_DRILL', label: 'Part 4 — Bài Nói Ngắn', icon: <Sparkles className="w-4 h-4 text-theme-success" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-theme/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trung Tâm Luyện Kỹ Năng Nghe Chuyên Sâu</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
            Luyện Nghe TOEIC LC &bull; Kỹ Năng &amp; Bẫy Đề Thi
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1 max-w-2xl">
            Tập trung cải thiện từng mắt xích yếu: Bắt âm chính tả, luyện phản xạ nối âm, nhận diện bẫy lặp từ và mở rộng vốn từ vựng đồng nghĩa.
          </p>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 touch-pan-x"
        style={{ scrollbarWidth: 'thin' }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'bg-theme-surface border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                  isActive ? 'bg-white/25 text-white' : 'bg-theme-accent/15 text-theme-accent'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Active View */}
      <div>
        {activeTab === 'DICTATION' && (
          <DictationPracticeView
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'SHADOWING' && (
          <ShadowingPracticeView
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'TRAPS' && (
          <TrapTrainingView
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'PARAPHRASE' && (
          <ParaphraseTrainingView
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'TRANSCRIPT' && (
          <TranscriptSmartView
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'PART1_DRILL' && (
          <LcFeatureUpdatingCard
            title="Luyện Đề Chuyên Sâu — Part 1 (Hình Ảnh)"
            description="Ngân hàng câu hỏi hình ảnh Part 1 đang được cập nhật từ trọn bộ ETS 2017-2026 và Hacker LC."
            badge="Part 1 Đang Cập Nhật"
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'PART2_DRILL' && (
          <LcFeatureUpdatingCard
            title="Luyện Đề Chuyên Sâu — Part 2 (Hỏi Đáp Nhanh)"
            description="Ngân hàng 25 câu hỏi đáp Part 2 kèm phân loại câu hỏi WH, Yes/No và câu gián tiếp đang được cập nhật."
            badge="Part 2 Đang Cập Nhật"
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'PART3_DRILL' && (
          <LcFeatureUpdatingCard
            title="Luyện Đề Chuyên Sâu — Part 3 (Hội Thoại)"
            description="Ngân hàng 39 câu hội thoại Part 3 kèm phân vai người nói và cạm bẫy suy luận đang được đồng bộ."
            badge="Part 3 Đang Cập Nhật"
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}

        {activeTab === 'PART4_DRILL' && (
          <LcFeatureUpdatingCard
            title="Luyện Đề Chuyên Sâu — Part 4 (Bài Nói Ngắn)"
            description="Ngân hàng 30 câu bài nói ngắn Part 4 kèm các chủ đề thông báo, quảng cáo, thuyết trình đang được chuẩn bị."
            badge="Part 4 Đang Cập Nhật"
            onNavigateHome={onNavigateHome}
            onNavigateCatalog={onNavigateCatalog}
          />
        )}
      </div>
    </div>
  );
};
