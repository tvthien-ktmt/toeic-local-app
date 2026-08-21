import React, { useState } from 'react';
import {
  Headphones,
  Play,
  Clock,
  Sparkles,
  Award,
  Lock,
  BookOpen,
  Layers,
  Search,
} from 'lucide-react';
import type { LCExamDocument } from '../../../types/toeicListening';
import { TOEIC_LC_FULL_CATALOG } from '../../../data/lcCatalogData';

interface LcCatalogViewProps {
  onStartExam: (document: LCExamDocument, mode: 'full_exam' | 'practice') => void;
}

/**
 * Full TOEIC Listening Catalog displaying all 180+ tests matching RC series (ETS 2017-2026, Hacker, YBM, Xanh Cam).
 */
export const LcCatalogView: React.FC<LcCatalogViewProps> = ({ onStartExam }) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingDoc, setPendingDoc] = useState<LCExamDocument | null>(null);

  const categories = [
    { id: 'ALL', label: 'Tất Cả Bộ Sách LC' },
    { id: 'ETS', label: 'ETS (2017 - 2026)' },
    { id: 'HACKER', label: 'Hacker LC' },
    { id: 'YBM', label: 'YBM (2025/2026 & Vol 1-3)' },
    { id: 'XANH CAM', label: 'Xanh Cam LC' },
  ];

  // Calculate total tests count
  const totalTestsCount = TOEIC_LC_FULL_CATALOG.reduce((accumulated, group) => {
    return accumulated + group.series.reduce((seriesAcc, s) => seriesAcc + s.totalTests, 0);
  }, 0);

  const filteredGroups = TOEIC_LC_FULL_CATALOG.filter((group) => {
    if (activeCategory !== 'ALL' && group.category !== activeCategory) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Kho Đề Thi Cố Định Trọn Bộ LC (ETS 2017 - 2026, Hacker, YBM, Xanh Cam)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Luyện Thi TOEIC Listening LC — {totalTestsCount}+ Đề Cố Định
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Hệ thống tích hợp toàn bộ các bộ đề Listening tương ứng với phần Reading (ETS 2017 - 2026, Hacker Vol 3, YBM 2025/2026, Xanh Cam). 
            Tùy chọn <strong className="text-yellow-300">Chế độ thi thật 45 phút LC</strong> hoặc <strong className="text-green-300">Luyện tập tự do có giải thích</strong>.
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/20 text-xs">
            <div className="flex items-center gap-1.5 text-blue-100">
              <Layers className="w-4 h-4 text-yellow-300" />
              <span>Tổng số: <strong className="text-white font-bold">{totalTestsCount} Đề LC</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-100">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span>Thời gian thi: <strong className="text-white font-bold">45 phút / 100 câu</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-100">
              <Award className="w-4 h-4 text-yellow-300" />
              <span>Thang điểm: <strong className="text-white font-bold">5 - 495 điểm LC</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 w-full sm:w-auto touch-pan-x"
          style={{ scrollbarWidth: 'thin' }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'bg-theme-surface border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm đề thi (ví dụ: ETS 2024, Test 01)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-theme-surface border border-theme text-xs text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
          />
        </div>
      </div>

      {/* Full Catalog Series Groups */}
      <div className="space-y-10">
        {filteredGroups.map((group) => (
          <div key={group.category} className="space-y-6">
            {/* Group Header */}
            <div className="flex items-center justify-between border-b border-theme/50 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-theme-primary flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-theme-accent" />
                  <span>{group.title}</span>
                </h2>
                <p className="text-xs text-theme-secondary mt-0.5">
                  {group.description}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-theme-accent/15 text-theme-accent border border-theme-accent/30">
                {group.badge}
              </span>
            </div>

            {/* Series Sub-sections */}
            <div className="space-y-6">
              {group.series.map((seriesObj) => {
                // Apply search filter if query is provided
                const matchingTests = seriesObj.tests.filter((testItem) => {
                  if (!searchQuery.trim()) {
                    return true;
                  }
                  const term = searchQuery.toLowerCase();

                  return testItem.title.toLowerCase().includes(term) || testItem.series.toLowerCase().includes(term);
                });

                if (matchingTests.length === 0) {
                  return null;
                }

                return (
                  <div key={seriesObj.seriesTitle} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-theme-primary">
                      <span className="w-2 h-2 rounded-full bg-theme-accent" />
                      <span>{seriesObj.seriesTitle}</span>
                      <span className="text-theme-secondary font-normal">({seriesObj.totalTests} Đề)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {matchingTests.map((testItem) => (
                        <div
                          key={testItem.id}
                          className="bg-theme-surface border border-theme hover:border-theme-accent/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-theme-surface-2 border border-theme text-theme-secondary">
                                {testItem.series}
                              </span>
                              <span className="text-[11px] font-bold text-theme-primary flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-theme-accent" />
                                <span>{testItem.durationMinutes}p</span>
                              </span>
                            </div>

                            <h3 className="text-xs sm:text-sm font-bold text-theme-primary group-hover:text-theme-accent transition-colors leading-snug">
                              {testItem.title}
                            </h3>

                            <div className="flex items-center justify-between gap-2 text-[11px] pt-1">
                              {testItem.parts ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-theme-success/15 text-theme-success border border-theme-success/30 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Đủ 100 Câu &amp; Ảnh</span>
                                </span>
                              ) : (
                                <span className="text-theme-secondary text-[10px]">
                                  Đang cập nhật
                                </span>
                              )}
                              <span className="text-theme-secondary font-medium">Thang 495đ</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setPendingDoc(testItem)}
                            className="w-full py-2 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Vào Phòng Thi</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Start Exam Mode Selection Modal */}
      {pendingDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-theme-surface border border-theme rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-theme-accent/15 text-theme-accent flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-theme-primary">
                Chọn Chế Độ Thi Listening
              </h2>
              <p className="text-xs text-theme-secondary">
                {pendingDoc.title} &bull; {pendingDoc.totalQuestions} câu &bull; {pendingDoc.durationMinutes} phút
              </p>
            </div>

            {/* Mode Choices Grid */}
            <div className="grid grid-cols-1 gap-3">
              {/* Exam Mode Option */}
              <button
                type="button"
                onClick={() => {
                  const doc = pendingDoc;
                  setPendingDoc(null);
                  onStartExam(doc, 'full_exam');
                }}
                className="p-4 rounded-2xl border-2 border-theme hover:border-theme-warning bg-theme-surface hover:bg-theme-warning/5 transition-all cursor-pointer space-y-2 group text-left w-full focus-visible:ring-2 focus-visible:ring-theme-warning focus-visible:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-theme-primary group-hover:text-theme-warning flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-theme-warning" />
                    <span>Chế Độ Thi Thật (Exam Mode)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-warning/20 text-theme-warning">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  Audio tự động phát liên tục 45 phút, không tua lại, không tạm dừng, không xem transcript hay đáp án. Tính điểm chuẩn 5-495 ETS.
                </p>
              </button>

              {/* Practice Mode Option */}
              <button
                type="button"
                onClick={() => {
                  const doc = pendingDoc;
                  setPendingDoc(null);
                  onStartExam(doc, 'practice');
                }}
                className="p-4 rounded-2xl border-2 border-theme hover:border-theme-accent bg-theme-surface hover:bg-theme-accent/5 transition-all cursor-pointer space-y-2 group text-left w-full focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-theme-primary group-hover:text-theme-accent flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-theme-accent" />
                    <span>Chế Độ Luyện Tập (Practice Mode)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-accent/20 text-theme-accent">
                    Tự do
                  </span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  Được tạm dừng, nghe lại, chỉnh tốc độ (0.75x - 1.2x), xem transcript đồng bộ và giải thích chi tiết cạm bẫy.
                </p>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setPendingDoc(null)}
              className="w-full py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
