import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface DailyLesson {
  topic_id: number;
  canonical_name: string;
  category: string;
  status: string;
  has_lesson_generated: boolean;
}

interface DailyPlanData {
  today_lessons: DailyLesson[];
}

interface RoadmapDailyPlanTabProps {
  dailyPlan: DailyPlanData | null;
  dailyMinutes: number;
  onSetDailyMinutes: (minutes: number) => void;
  onSelectTopicId: (topicId: number) => void;
}

const STATUS_LABELS: Record<string, string> = {
  unknown: 'Chưa học',
  weak: 'Cần ôn',
  ok: 'Đã vững',
};

const CAT_LABELS: Record<string, string> = {
  grammar_topic: 'Ngữ pháp',
  question_type: 'Dạng câu hỏi',
  vocab_topic: 'Từ vựng',
};

/**
 * Daily study plan tab allocating prioritized roadmap topics based on user's available study minutes.
 */
export const RoadmapDailyPlanTab: React.FC<RoadmapDailyPlanTabProps> = ({
  dailyPlan,
  dailyMinutes,
  onSetDailyMinutes,
  onSelectTopicId,
}) => {
  return (
    <div>
      {/* Time selector */}
      <div className="bg-theme-surface rounded-xl p-4 mb-5 border border-theme flex gap-3 items-center flex-wrap">
        <span className="text-theme-secondary text-xs sm:text-sm font-medium">Thời gian học/ngày:</span>
        {[20, 40, 60].map((minuteOption) => (
          <button
            key={minuteOption}
            onClick={() => onSetDailyMinutes(minuteOption)}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition cursor-pointer ${
              dailyMinutes === minuteOption
                ? 'bg-theme-accent text-white border-theme-accent shadow'
                : 'bg-theme-surface-2 text-theme-secondary border-theme hover:text-theme-primary'
            }`}
          >
            {minuteOption} phút
          </button>
        ))}
      </div>

      {dailyPlan && (
        <div>
          <h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-theme-accent" />
            <span>Bài học hôm nay ({dailyPlan.today_lessons.length} chủ điểm)</span>
          </h3>
          {dailyPlan.today_lessons.map((lesson, index) => (
            <div
              key={lesson.topic_id}
              className="bg-theme-surface rounded-xl p-4 mb-3 border border-theme hover:border-theme-accent transition cursor-pointer flex justify-between items-center"
              onClick={() => onSelectTopicId(lesson.topic_id)}
            >
              <div>
                <div className="text-theme-primary font-semibold text-sm sm:text-base mb-1">
                  {index + 1}. {lesson.canonical_name}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-theme-accent font-medium">
                    {STATUS_LABELS[lesson.status] || lesson.status}
                  </span>
                  <span className="text-theme-secondary">
                    {CAT_LABELS[lesson.category] || lesson.category}
                  </span>
                  {!lesson.has_lesson_generated && (
                    <span className="text-theme-warning font-semibold">Sẽ sinh AI</span>
                  )}
                </div>
              </div>
              <span className="text-theme-accent font-bold text-lg">&rarr;</span>
            </div>
          ))}

          {dailyPlan.today_lessons.length === 0 && (
            <div className="alert-success rounded-2xl p-6 text-center text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 alert-success-icon" />
              <span>Tuyệt vời! Bạn đã hoàn thành tất cả các chủ điểm. Hãy làm bài luyện tập đề thi thật!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
