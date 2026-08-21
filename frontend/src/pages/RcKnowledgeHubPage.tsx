import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Layers,
} from 'lucide-react';
import { RC_KNOWLEDGE_LESSONS } from '../data/rcKnowledgeLessonsData';
import { KnowledgeLessonDetailCard } from '../components/toeic/KnowledgeLessonDetailCard';

interface RcKnowledgeHubPageProps {
  onNavigateDrills?: (part?: string) => void;
}

/**
 * Interactive TOEIC Knowledge & Test-Taking Tactics Curriculum Page.
 * Implements complete grammar taxonomy, 6-step reading process, and trap avoidance rules.
 */
export const RcKnowledgeHubPage: React.FC<RcKnowledgeHubPageProps> = ({
  onNavigateDrills,
}) => {
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLessonId, setActiveLessonId] = useState<string>(RC_KNOWLEDGE_LESSONS[0].id);

  const filteredLessons = RC_KNOWLEDGE_LESSONS.filter((lesson) => {
    if (selectedPartFilter !== 'ALL' && lesson.part !== selectedPartFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = lesson.title.toLowerCase().includes(q);
      const matchSummary = lesson.summaryVi.toLowerCase().includes(q);
      const matchPart = lesson.part.toLowerCase().includes(q);

      return matchTitle || matchSummary || matchPart;
    }

    return true;
  });

  const currentLesson = RC_KNOWLEDGE_LESSONS.find((item) => item.id === activeLessonId) || RC_KNOWLEDGE_LESSONS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-theme-primary">
      {/* Hero Welcome Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-theme/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-bold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Hệ Thống Dạy Kiến Thức &amp; Chiến Thuật TOEIC (Learning Layer)</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Kho Kiến Thức Ngữ Pháp &amp; Phương Pháp Giải Đề Chuẩn ETS
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Nắm vững bản chất ngữ pháp, nhận diện dạng câu hỏi trong 5 giây và làm chủ quy trình 6 bước đọc hiểu Part 7.
          </p>
        </div>

        {/* Quick Action to Drills */}
        {onNavigateDrills && (
          <button
            type="button"
            onClick={() => onNavigateDrills()}
            className="px-5 py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Đến Khu Luyện Theo Dạng Bài</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-theme-surface border border-theme shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'Part 5', 'Part 6', 'Part 7'] as const).map((partOption) => (
            <button
              key={partOption}
              type="button"
              onClick={() => setSelectedPartFilter(partOption)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedPartFilter === partOption
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
              }`}
            >
              {partOption === 'ALL' ? 'Tất Cả Bài Học' : partOption}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-theme-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm chủ đề, từ khóa ngữ pháp..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-theme-surface-2 border border-theme text-xs text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-1 focus:ring-theme-accent"
          />
        </div>
      </div>

      {/* Main 2-Column Content Layout (4 cols Sidebar + 8 cols Lesson Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Navigation List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-theme-surface border border-theme rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-theme-secondary uppercase tracking-wider">
              <span>Danh Sách Bài Học ({filteredLessons.length})</span>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {filteredLessons.map((lesson) => {
                const isActive = lesson.id === currentLesson.id;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer space-y-1.5 ${
                      isActive
                        ? 'border-theme-accent bg-theme-accent/10 shadow-xs ring-1 ring-theme-accent'
                        : 'border-theme/60 bg-theme-surface hover:bg-theme-surface-2'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-theme-accent/15 text-theme-accent">
                        {lesson.part}
                      </span>
                      <span className="text-[10px] font-bold text-theme-secondary">
                        {lesson.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-theme-primary leading-snug line-clamp-2">
                      {lesson.title}
                    </h4>

                    <p className="text-[11px] text-theme-secondary line-clamp-2 leading-relaxed">
                      {lesson.summaryVi}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Lesson Viewer */}
        <div className="lg:col-span-8">
          <KnowledgeLessonDetailCard
            lesson={currentLesson}
            onStartDrill={(part) => onNavigateDrills && onNavigateDrills(part)}
          />
        </div>
      </div>
    </div>
  );
};
