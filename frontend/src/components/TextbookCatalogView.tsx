import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Trophy, Play, CheckCircle2, Sparkles, Search, Layers, RefreshCw, AlertCircle } from 'lucide-react';

interface TestItem {
  id: number;
  filename: string;
  test_number: number;
  question_count: number;
  highest_score: number | null;
  highest_raw: number | null;
  attempt_count: number;
  last_completed: string | null;
}

interface SeriesItem {
  series_title: string;
  total_tests: number;
  tests: TestItem[];
}

interface CategoryItem {
  category_name: string;
  series: SeriesItem[];
}

interface TextbookCatalogViewProps {
  onStartExam: (docId: number, mode: 'full_exam' | 'practice') => void;
}

export const TextbookCatalogView: React.FC<TextbookCatalogViewProps> = ({ onStartExam }) => {
  const [catalog, setCatalog] = useState<CategoryItem[]>([]);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [showModeModal, setShowModeModal] = useState<boolean>(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/textbooks/catalog');
      const data = await res.json();
      if (data.status === 'success') {
        setCatalog(data.catalog);
        setTotalTests(data.total_builtin_tests);
      }
    } catch (err) {
      console.error('Error fetching textbook catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const categoriesList = ['ALL', ...catalog.map(c => c.category_name)];

  const handleOpenModeModal = (test: TestItem) => {
    setSelectedTest(test);
    setShowModeModal(true);
  };

  const handleConfirmStart = (mode: 'full_exam' | 'practice') => {
    if (selectedTest) {
      setShowModeModal(false);
      onStartExam(selectedTest.id, mode);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl mb-8">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Kho Đề Thi Cố Định Trọn Bộ (ETS, Hacker, YBM, Xanh Cam)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Luyện Thi TOEIC Reading RC — 180+ Đề Cố Định
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Hệ thống tích hợp sẵn trọn bộ đề thi từ các bộ sách nổi tiếng (ETS 2017 - 2026, Hacker Vol 3, YBM 2025/2026, Xanh Cam). 
            Chọn đề làm ngay với <strong className="text-amber-300 font-semibold">Chế độ thi thật 75 phút RC</strong> hoặc <strong className="text-emerald-300 font-semibold">Luyện tập tự do không giới hạn</strong>.
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-200 text-xs sm:text-sm font-medium">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Tổng số đề: <strong className="text-white font-bold">{totalTests} Đề RC</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 text-xs sm:text-sm font-medium">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Thời gian thi: <strong className="text-white font-bold">75 phút / 100 câu</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 text-xs sm:text-sm font-medium">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Thang điểm: <strong className="text-white font-bold">5 - 495 điểm RC</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Publisher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-theme-accent text-white shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-3 border border-theme'
              }`}
            >
              {cat === 'ALL' ? '📚 Tất Cả Bộ Sách' : cat}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-theme-surface border border-theme text-xs sm:text-sm text-theme-primary placeholder-theme-secondary focus:outline-none focus:border-theme-accent transition-colors"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="w-8 h-8 text-theme-accent animate-spin" />
          <p className="text-sm text-theme-secondary font-medium">Đang nạp danh mục đề thi cố định...</p>
        </div>
      )}

      {/* Catalog Display */}
      {!loading && catalog.length === 0 && (
        <div className="text-center py-16 bg-theme-surface rounded-2xl border border-theme">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-theme-primary mb-1">Chưa tìm thấy đề thi cố định nào</h3>
          <p className="text-xs text-theme-secondary">Vui lòng kiểm tra thư mục d:\TOIEC Web\textbook</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-10">
          {catalog
            .filter(cat => activeCategory === 'ALL' || cat.category_name === activeCategory)
            .map(cat => (
              <div key={cat.category_name} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-theme pb-3">
                  <BookOpen className="w-5 h-5 text-theme-accent" />
                  <h2 className="text-xl font-bold text-theme-primary tracking-tight">
                    Bộ Sách: {cat.category_name}
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-theme-accent/10 text-theme-accent rounded-full border border-theme-accent/20">
                    {cat.series.reduce((acc, s) => acc + s.total_tests, 0)} Đề Thi
                  </span>
                </div>

                {cat.series.map(ser => {
                  const filteredTests = ser.tests.filter(t => 
                    t.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ser.series_title.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredTests.length === 0) return null;

                  return (
                    <div key={ser.series_title} className="bg-theme-surface rounded-2xl border border-theme p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-theme-accent" />
                          {ser.series_title}
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
                            className="group relative bg-theme-surface-2 hover:bg-theme-surface-3 border border-theme hover:border-theme-accent/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:shadow-indigo-500/10"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                                  TEST {test.test_number < 10 ? `0${test.test_number}` : test.test_number}
                                </span>
                                {test.highest_score !== null && (
                                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
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
                            <div className="space-y-2 pt-2 border-t border-theme/50">
                              <button
                                onClick={() => handleOpenModeModal(test)}
                                className="w-full py-2 px-3 rounded-lg bg-theme-accent hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
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
      {showModeModal && selectedTest && (
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
                className="group cursor-pointer p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-400 transition-all duration-200 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-amber-300">Thi Thật RC (75 Phút)</h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 rounded">Khuyên Dùng</span>
                  </div>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    Có đồng hồ đếm ngược 75:00. Tự động nộp bài khi hết giờ và tính điểm TOEIC RC chuẩn (5-495 điểm).
                  </p>
                </div>
              </div>

              {/* Mode 2: Unlimited Practice */}
              <div
                onClick={() => handleConfirmStart('practice')}
                className="group cursor-pointer p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 hover:border-emerald-400 transition-all duration-200 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 mb-0.5">Luyện Tập Tự Do (Không Giới Hạn)</h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    Không giới hạn thời gian. Xem ngay đáp án, giải thích chi tiết và bản dịch Tiếng Việt từng câu.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setShowModeModal(false)}
              className="w-full py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
            >
              Hủy Bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
