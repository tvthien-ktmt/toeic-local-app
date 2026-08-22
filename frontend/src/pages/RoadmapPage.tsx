import React, { useState, useEffect } from 'react';
import { PlacementTest } from '../components/PlacementTest';
import { LessonModal } from '../components/LessonModal';
import { RoadmapDailyPlanTab, type DailyPlanData } from '../components/RoadmapDailyPlanTab';
import { RoadmapTopicCard } from '../components/RoadmapTopicCard';

interface MasteryInfo {
  status: 'unknown' | 'weak' | 'ok';
  correct_count: number;
  total_count: number;
  mastery_pct: number;
}

interface CurriculumTopic {
  id: number;
  canonical_name: string;
  category: 'grammar_topic' | 'question_type' | 'vocab_topic';
  level: 'basic' | 'intermediate' | 'advanced';
  parts: number[];
  source_count: number;
  prerequisite_topic_id: number | null;
  question_count: number;
  has_specific_db_topic: boolean;
  has_lesson: boolean;
  mastery?: MasteryInfo;
  status?: 'unknown' | 'weak' | 'ok';
  mastery_pct?: number;
}

interface RoadmapSummary {
  total: number;
  unknown: number;
  weak: number;
  ok: number;
  next_recommended: number | null;
}

const CAT_LABELS: Record<string, string> = {
  grammar_topic: 'Ngữ pháp',
  question_type: 'Dạng câu hỏi',
  vocab_topic: 'Từ vựng',
};

const API_BASE = '';

/**
 * Curriculum roadmap view presenting the 45-topic progressive learning tree, placement test, and daily study plan.
 */
export const RoadmapPage: React.FC = () => {
  const [view, setView] = useState<'roadmap' | 'placement' | 'daily'>('roadmap');
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [summary, setSummary] = useState<RoadmapSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dailyPlan, setDailyPlan] = useState<DailyPlanData | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(40);

  const fetchRoadmap = () => {
    setIsLoading(true);
    fetch(`${API_BASE}/api/curriculum/roadmap`)
      .then((response) => response.json())
      .then((data) => {
        setTopics(data.roadmap || []);
        setSummary(data.summary || null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const fetchDailyPlan = (minutes: number) => {
    fetch(`${API_BASE}/api/curriculum/daily-plan?minutes_per_day=${minutes}`)
      .then((response) => response.json())
      .then((data) => setDailyPlan(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  useEffect(() => {
    if (view === 'daily') {
      fetchDailyPlan(dailyMinutes);
    }
  }, [view, dailyMinutes]);

  const filteredTopics = topics.filter((topicItem) => {
    const status = topicItem.status ?? topicItem.mastery?.status ?? 'unknown';
    if (filterLevel !== 'all' && topicItem.level !== filterLevel) {
      return false;
    }
    if (filterCategory !== 'all' && topicItem.category !== filterCategory) {
      return false;
    }
    if (filterStatus !== 'all' && status !== filterStatus) {
      return false;
    }

    return true;
  });

  const progressPct = summary
    ? Math.round((summary.ok / Math.max(1, summary.total)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary font-sans">
      {/* Lesson Modal */}
      {selectedTopicId && (
        <LessonModal
          topicId={selectedTopicId}
          onClose={() => {
            setSelectedTopicId(null);
            fetchRoadmap();
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-theme-primary tracking-tight mb-2">
            Lộ Trình Mất Gốc → 495
          </h1>
          <p className="text-theme-secondary text-sm sm:text-base">
            Lộ trình cá nhân hoá dựa trên điểm mạnh/yếu thật của bạn
          </p>
        </div>

        {/* Overall Progress Card */}
        {summary && (
          <div className="bg-theme-surface rounded-2xl p-6 mb-6 border border-theme shadow-lg grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-theme-secondary text-sm font-medium">Tiến độ tổng thể</span>
                <span className="text-theme-accent font-extrabold text-base">{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-theme-surface-2 rounded-full overflow-hidden border border-theme">
                <div
                  className="h-full bg-theme-accent transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex gap-4 mt-3 flex-wrap text-xs sm:text-sm">
                <span className="text-theme-success font-semibold">Đã vững: {summary.ok}</span>
                <span className="text-theme-warning font-semibold">Cần ôn: {summary.weak}</span>
                <span className="text-theme-secondary font-semibold">Chưa học: {summary.unknown}</span>
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-theme pt-3 md:pt-0 md:pl-5">
              <div className="text-theme-secondary text-xs">Tổng chủ điểm</div>
              <div className="text-3xl font-black text-theme-primary">{summary.total}</div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 border-b border-theme pb-3">
          {(['roadmap', 'placement', 'daily'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition border cursor-pointer ${
                view === tab
                  ? 'bg-theme-accent text-white border-theme-accent shadow'
                  : 'bg-theme-surface text-theme-secondary border-theme hover:text-theme-primary hover:bg-theme-surface-2'
              }`}
            >
              {tab === 'roadmap'
                ? 'Lộ Trình'
                : tab === 'placement'
                ? 'Chẩn Đoán'
                : 'Kế Hoạch Hôm Nay'}
            </button>
          ))}
        </div>

        {/* PLACEMENT TEST TAB */}
        {view === 'placement' && (
          <PlacementTest
            onComplete={() => {
              setView('roadmap');
              fetchRoadmap();
            }}
          />
        )}

        {/* DAILY PLAN TAB */}
        {view === 'daily' && (
          <RoadmapDailyPlanTab
            dailyPlan={dailyPlan}
            dailyMinutes={dailyMinutes}
            onSetDailyMinutes={setDailyMinutes}
            onSelectTopicId={setSelectedTopicId}
          />
        )}

        {/* ROADMAP TAB */}
        {view === 'roadmap' && (
          <div>
            {/* Filters */}
            <div className="flex gap-3 mb-5 flex-wrap bg-theme-surface p-4 rounded-xl border border-theme text-xs sm:text-sm">
              <select
                value={filterLevel}
                onChange={(changeEvent) => setFilterLevel(changeEvent.target.value)}
                className="bg-theme-surface-2 border border-theme text-theme-primary rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">Tất cả mục tiêu</option>
                <option value="500">Mục tiêu 500+</option>
                <option value="650">Mục tiêu 650+</option>
                <option value="800">Mục tiêu 800+</option>
                <option value="900">Mục tiêu 900+</option>
              </select>
              <select
                value={filterCategory}
                onChange={(changeEvent) => setFilterCategory(changeEvent.target.value)}
                className="bg-theme-surface-2 border border-theme text-theme-primary rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">Tất cả chủ điểm</option>
                {Object.entries(CAT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(changeEvent) => setFilterStatus(changeEvent.target.value)}
                className="bg-theme-surface-2 border border-theme text-theme-primary rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="not_started">Chưa học</option>
                <option value="learning">Đang học</option>
                <option value="review_needed">Cần ôn lại</option>
                <option value="mastered">Đã nắm vững</option>
              </select>
              <span className="text-theme-secondary text-xs self-center ml-auto">
                Hiển thị {filteredTopics.length}/{topics.length} chủ điểm
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-16 text-theme-secondary text-sm font-medium">
                Đang tải lộ trình...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((topicItem) => {
                  const isNext = summary?.next_recommended === topicItem.id;

                  return (
                    <RoadmapTopicCard
                      key={topicItem.id}
                      topicItem={topicItem}
                      isNext={isNext}
                      onSelectTopicId={setSelectedTopicId}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;
