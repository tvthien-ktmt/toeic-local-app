import React from 'react';
import type { SkillCompetencyResult } from '../../utils/fullToeicScoreCalculator';

interface ToeicCompetencyBreakdownSectionProps {
  competencyList: SkillCompetencyResult[];
}

/**
 * Breakdown of user performance across 14 TOEIC core competency skills.
 */
export const ToeicCompetencyBreakdownSection: React.FC<ToeicCompetencyBreakdownSectionProps> = ({
  competencyList,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
        Đánh Giá Theo 14 Dạng Kỹ Năng Cốt Lõi
      </h4>

      <div className="space-y-2.5">
        {competencyList.map((comp) => (
          <div
            key={comp.skillId}
            className="p-4 rounded-2xl bg-theme-surface-2 border border-theme space-y-2"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-theme-primary">
                  {comp.nameVi}
                </span>
                <p className="text-[11px] text-theme-secondary">
                  {comp.recommendationVi}
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  comp.rating === 'EXCELLENT'
                    ? 'bg-theme-success/20 text-theme-success'
                    : comp.rating === 'GOOD'
                    ? 'bg-theme-warning/20 text-theme-warning'
                    : 'bg-theme-error/20 text-theme-error'
                }`}
              >
                {comp.percentage}% ({comp.rating})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
