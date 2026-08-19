import React, { useState, useEffect } from 'react';
import { fetchTextbookCatalog, type CatalogCategory, type TestItem } from '../api/documents';
import { BookOpen, Layers, Clock, Trophy, Play, CheckCircle2, Search, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface TextbookCatalogViewProps {
  onStartExam: (testId: number, mode: 'full_exam' | 'practice') => void;
}

/**
 * Built-in textbook catalog library displaying ETS 2020-2024 test series with mode selection modals (Full Exam / Practice).
 */
export const TextbookCatalogView: React.FC<TextbookCatalogViewProps> = ({ onStartExam }) => {
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal mode selector state
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [isShowModeModal, setIsShowModeModal] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    fetchTextbookCatalog()
      .then((data: CatalogCategory[]) => {
        setCatalog(data);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        console.error('Failed to load textbook catalog:', error);
        setIsLoading(false);
      });
  }, []);

  const totalTests = catalog.reduce((accumulated, category) => {
    return accumulated + category.series.reduce((seriesAccumulated, seriesItem) => seriesAccumulated + seriesItem.total_tests, 0);
  }, 0);

  const categoriesList = ['ALL', ...catalog.map((category) => category.category_name)];

  const handleOpenModeModal = (test: TestItem) => {
    setSelectedTest(test);
    setIsShowModeModal(true);
  };

  const handleConfirmStart = (mode: 'full_exam' | 'practice') => {
    if (selectedTest) {
      setIsShowModeModal(false);
      onStartExam(selectedTest.id, mode);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-theme-surface border border-theme p-6 sm:p-8 shadow-xl mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Kho Đề Thi Cố Định Trọn Bộ (ETS, Hacker, YBM, Xanh Cam)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-primary tracking-tight mb-3">
            Luyện Thi TOEIC Reading RC — 180+ Đề Cố Định
          </h1>
          <p className="text-theme-secondary text-sm sm:text-base max-w-3xl leading-relaxed">
            Hệ thống tích hợp sẵn trọn bộ đề thi từ các bộ sách nổi tiếng (ETS 2017 - 2026, Hacker Vol 3, YBM 2025/2026, Xanh Cam). 
            Chọn đề làm ngay với <strong className="text-theme-warning font-semibold">Chế độ thi thật 75 phút RC</strong> hoặc <strong className="text-theme-success font-semibold">Luyện tập tự do không giới hạn</strong>.
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-theme">
            <div className="flex items-center gap-2 text-theme-secondary text-xs sm:text-sm font-medium">
              <Layers className="w-4 h-4 text-theme-accent" />
              <span>Tổng số đề: <strong className="text-theme-primary font-bold">{totalTests} Đề RC</strong></span>
            </div>
            <div className="flex items-center gap-2 text-theme-secondary text-xs sm:text-sm font-medium">
              <Clock className="w-4 h-4 text-theme-warning" />
              <span>Thời gian thi: <strong className="text-theme-primary font-bold">75 phút / 100 câu</strong></span>
            </div>
            <div className="flex items-center gap-2 text-theme-secondary text-xs sm:text-sm font-medium">
              <Trophy className="w-4 h-4 text-theme-success" />
              <span>Thang điểm: <strong className="text-theme-primary font-bold">5 - 495 điểm RC</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Publisher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categoriesList.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap border ${
                activeCategory === category
                  ? 'bg-theme-accent text-white border-theme-accent shadow-md'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-surface border-theme'
              }`}
            >
              {category === 'ALL' ? 'Tất Cả Bộ Sách' : category}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ đề (VD: 2024, Vol 1)..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-theme-surface border border-theme text-xs sm:text-sm text-theme-primary placeholder-theme-secondary focus:outline-none focus:border-theme-accent transition-colors"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="w-8 h-8 text-theme-accent animate-spin" />
          <p className="text-sm text-theme-secondary font-medium">Đang nạp danh mục đề thi cố định...</p>
        </div>
      )}

      {/* Catalog Display */}
      {!isLoading && catalog.length === 0 && (
        <div className="text-center py-16 bg-theme-surface rounded-2xl border border-theme">
          <AlertCircle className="w-12 h-12 text-theme-warning mx-auto mb-3" />
          <h3 className="text-lg font-bold text-theme-primary mb-1">Chưa tìm thấy đề thi cố định nào</h3>
          <p className="text-xs text-theme-secondary">Vui lòng kiểm tra thư mục d:\TOIEC Web\textbook</p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-10">
          {catalog
            .filter((category) => activeCategory === 'ALL' || category.category_name === activeCategory)
            .map((category) => (
              <div key={category.category_name} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-theme pb-3">
                  <BookOpen className="w-5 h-5 text-theme-accent" />
                  <h2 className="text-xl font-bold text-theme-primary tracking-tight">
                    Bộ Sách: {category.category_name}
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-theme-accent/10 text-theme-accent rounded-full border border-theme-accent/20">
                    {category.series.reduce((accumulated, currentSeries) => accumulated + currentSeries.total_tests, 0)} Đề Thi
                  </span>
                </div>

                {category.series
                  .filter((seriesItem) => !seriesItem.series_title.toLowerCase().includes('đáp án') && !seriesItem.series_title.toLowerCase().includes('dáp án'))
                  .map((seriesItem) => {
                    const cleanSeriesTitle = seriesItem.series_title.replace(/\s*\(\d+\)/g, '').replace(/đáp án/gi, '').trim();
                    const filteredTests = seriesItem.tests.filter((testItem) => 
                      testItem.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      cleanSeriesTitle.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredTests.length === 0) {
                      return null;
                    }

                    return (
                      <div key={seriesItem.series_title} className="bg-theme-surface rounded-2xl border border-theme p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-theme-accent" />
                            {cleanSeriesTitle}
                          </h3>
                        <span className="text-xs text-theme-secondary font-medium">
                          {filteredTests.length} Đề RC (100 câu/đề)
                        </span>
                      </div>

                      {/* Tests Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTests.map(test => (
                          <div
                            key={test.id}
                            className="group relative bg-theme-surface-2 hover:bg-theme-surface border border-theme hover:border-theme-accent rounded-xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-lg"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-theme-accent/15 text-theme-accent border border-theme-accent/30 rounded-md">
                                  TEST {test.test_number < 10 ? `0${test.test_number}` : test.test_number}
                                </span>
                                {test.highest_score !== null && (
                                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-theme-success alert-success border border-theme-success/30 px-2 py-0.5 rounded-full">
                                    <Trophy className="w-3 h-3" /> {test.highest_score} / 495
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-bold text-theme-primary group-hover:text-theme-accent transition-colors line-clamp-2 mb-1">
                                {test.filename.replace(/^\[.*?\]\s*/, '')}
                              </h4>
                              <p className="text-[11px] text-theme-secondary mb-4">
                                Cấu trúc chuẩn TOEIC RC (100 Câu: Part 5, 6, 7)
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 pt-2 border-t border-theme">
                              <button
                                onClick={() => handleOpenModeModal(test)}
                                className="w-full py-2 px-3 rounded-lg bg-theme-accent hover:bg-theme-accent-hover text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Vào Làm Bài</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      )}

      {/* Mode Selector Modal */}
      {isShowModeModal && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-theme-surface border border-theme rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-theme-accent/20 border border-theme-accent/30 text-theme-accent flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-theme-primary">
                {selectedTest.filename.replace(/^\[.*?\]\s*/, '')}
              </h3>
              <p className="text-xs text-theme-secondary">
                Vui lòng chọn chế độ thi phù hợp với nhu cầu ôn tập của bạn
              </p>
            </div>

            {/* Mode Cards */}
            <div className="space-y-3">
              {/* Mode 1: Full Exam 75m */}
              <div
                onClick={() => handleConfirmStart('full_exam')}
                className="group cursor-pointer p-4 rounded-xl alert-warning border border-theme-warning/40 hover:border-theme-warning transition-all duration-200 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-theme-warning/20 text-theme-warning flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-theme-warning">Thi Thật RC (75 Phút)</h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-theme-warning text-white rounded">Khuyên Dùng</span>
                  </div>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    Có đồng hồ đếm ngược 75:00. Tự động nộp bài khi hết giờ và tính điểm TOEIC RC chuẩn (5-495 điểm).
                  </p>
                </div>
              </div>

              {/* Mode 2: Unlimited Practice */}
              <div
                onClick={() => handleConfirmStart('practice')}
                className="group cursor-pointer p-4 rounded-xl alert-success border border-theme-success/40 hover:border-theme-success transition-all duration-200 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-theme-success/20 text-theme-success flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-theme-success mb-0.5">Luyện Tập Tự Do (Không Giới Hạn)</h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    Không giới hạn thời gian. Xem ngay đáp án, giải thích chi tiết và bản dịch Tiếng Việt từng câu.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setIsShowModeModal(false)}
              className="w-full py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
