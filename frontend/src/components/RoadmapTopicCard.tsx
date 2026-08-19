import React from 'react';

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

interface RoadmapTopicCardProps {
  topicItem: CurriculumTopic;
  isNext: boolean;
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
 * Interactive topic node card in the curriculum roadmap showing mastery level badges and prerequisite links.
 */
export const RoadmapTopicCard: React.FC<RoadmapTopicCardProps> = ({
  topicItem,
  isNext,
  onSelectTopicId,
}) => {
  const masteryStatus = topicItem.status ?? topicItem.mastery?.status ?? 'unknown';
  const masteryPct = topicItem.mastery_pct ?? topicItem.mastery?.mastery_pct ?? 0;

  return (
    <div
      onClick={() => onSelectTopicId(topicItem.id)}
      className={`bg-theme-surface rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between hover:shadow-lg ${
        isNext
          ? 'border-theme-accent ring-2 ring-theme-accent/30'
          : 'border-theme hover:border-theme-accent/60'
      }`}
    >
      {/* "Học tiếp" badge */}
      {isNext && (
        <div className="absolute top-3 right-3 bg-theme-accent text-white rounded-md px-2 py-0.5 text-[11px] font-bold shadow">
          Học tiếp
        </div>
      )}

      <div>
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              masteryStatus === 'ok'
                ? 'bg-theme-success'
                : masteryStatus === 'weak'
                ? 'bg-theme-warning'
                : 'bg-theme-secondary'
            }`}
          />
          <span className="text-xs font-semibold text-theme-secondary">
            {STATUS_LABELS[masteryStatus]}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-theme-primary mb-2 leading-snug pr-12">
          {topicItem.canonical_name}
        </h3>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-3 text-xs">
          <span className="bg-theme-surface-2 text-theme-secondary border border-theme rounded px-2 py-0.5 text-[11px]">
            {topicItem.level}
          </span>
          <span className="bg-theme-accent/15 text-theme-accent border border-theme-accent/25 rounded px-2 py-0.5 text-[11px] font-medium">
            {CAT_LABELS[topicItem.category]}
          </span>
          <span className="text-theme-secondary text-[11px] self-center">
            Part {topicItem.parts.join('/')}
          </span>
        </div>
      </div>

      <div>
        {/* Mastery progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-theme-secondary font-medium">Độ vững:</span>
            <span className="text-theme-primary font-bold">{masteryPct}%</span>
          </div>
          <div className="h-1.5 bg-theme-surface-2 rounded-full overflow-hidden border border-theme">
            <div
              className={`h-full transition-all duration-300 ${
                masteryStatus === 'ok'
                  ? 'bg-theme-success'
                  : masteryStatus === 'weak'
                  ? 'bg-theme-warning'
                  : 'bg-theme-secondary'
              }`}
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        {/* Footer meta */}
        <div className="flex justify-between items-center text-[11px] border-t border-theme pt-2 mt-1 text-theme-secondary">
          <span>
            {topicItem.source_count}/4 nguồn · {topicItem.question_count.toLocaleString()} câu DB
          </span>
          {topicItem.has_lesson ? (
            <span className="text-theme-success font-medium">Bài giảng</span>
          ) : (
            <span className="text-theme-secondary">Sinh AI</span>
          )}
        </div>
      </div>
    </div>
  );
};
