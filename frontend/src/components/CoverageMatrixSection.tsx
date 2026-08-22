import React, { useState, useEffect } from 'react';
import { fetchCoverageMatrix, type CoverageMatrixRow, type CoverageMatrixResponse } from '../api/documents';
import { Layers, Award, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface CoverageMatrixSectionProps {
  onSelectTopicForPractice?: (part: number, topic: string) => void;
}

/**
 * Coverage Matrix component presenting user mastery and practice coverage across Part 5, 6, and 7 taxonomy (RC_Format.md Section 25-27).
 */
export const CoverageMatrixSection: React.FC<CoverageMatrixSectionProps> = () => {
  const [data, setData] = useState<CoverageMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [partFilter, setPartFilter] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    fetchCoverageMatrix()
      .then((response) => {
        setData(response);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl bg-theme-surface border border-theme flex flex-col items-center justify-center gap-2 text-theme-secondary">
        <RefreshCw className="w-6 h-6 animate-spin text-theme-accent" />
        <span className="text-xs font-semibold">Đang nạp ma trận độ phủ kiến thức...</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const filteredRows = data.rows.filter((rowItem) => {
    if (partFilter === 'ALL') {
      return true;
    }

    return rowItem.part === partFilter;
  });

  const getStatusBadge = (status: CoverageMatrixRow['status']) => {
    switch (status) {
      case 'MASTERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold alert-success text-theme-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Mastered
          </span>
        );
      case 'PROFICIENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold alert-info text-theme-accent flex items-center gap-1">
            <Award className="w-3 h-3" /> Proficient
          </span>
        );
      case 'PRACTICING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold alert-warning text-theme-warning flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Practicing
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-theme-surface-2 text-theme-secondary border border-theme">
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-theme-surface border border-theme shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-theme-accent text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> BẢNG MA TRẬN ĐỘ PHỦ KỸ NĂNG (COVERAGE MATRIX — MỤC 25)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-theme-primary tracking-tight">
            Ma Trận Kiến Thức & Mức Độ Thuần Thục
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            Theo dõi tỉ lệ bao phủ tất cả các dạng bài của Part 5, 6, 7. Tránh tình trạng bỏ sót dạng câu hỏi trước khi thi thật.
          </p>
        </div>

        {/* Overview metric */}
        <div className="flex items-center gap-3 bg-theme-surface-2 px-4 py-2.5 rounded-2xl border border-theme shrink-0">
          <div>
            <span className="text-[10px] text-theme-secondary font-bold block uppercase">Độ Phủ Tổng Thể</span>
            <div className="text-xl font-black text-theme-accent">
              {data.covered_categories}/{data.total_categories} <span className="text-xs font-semibold text-theme-secondary">({data.overall_coverage_pct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Part filter buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'ALL', label: 'Tất Cả 3 Part' },
            { id: 5, label: 'Part 5 (Word Form, Verb, Prep, Connector...)' },
            { id: 6, label: 'Part 6 (Context, Transition, Insertion...)' },
            { id: 7, label: 'Part 7 (Detail, Inference, Purpose, Synthesis...)' },
          ] as const
        ).map((tabItem) => (
          <button
            key={tabItem.label}
            onClick={() => setPartFilter(tabItem.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              partFilter === tabItem.id
                ? 'bg-theme-accent text-white shadow-sm'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-theme">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-surface-2 border-b border-theme text-theme-secondary font-bold">
              <th className="py-3 px-4">Part</th>
              <th className="py-3 px-4">Kỹ Năng (Skill)</th>
              <th className="py-3 px-4">Dạng Bài (Subskill)</th>
              <th className="py-3 px-4 hidden md:table-cell">Pattern Tiêu Biểu</th>
              <th className="py-3 px-4 text-center">Lượt Luyện</th>
              <th className="py-3 px-4">Mastery %</th>
              <th className="py-3 px-4 text-right">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme">
            {filteredRows.map((rowItem, index) => (
              <tr key={index} className="hover:bg-theme-surface-2/60 transition">
                <td className="py-3 px-4 font-mono font-bold text-theme-accent">
                  Part {rowItem.part}
                </td>
                <td className="py-3 px-4 font-semibold text-theme-primary">
                  {rowItem.skill}
                </td>
                <td className="py-3 px-4 font-bold text-theme-primary">
                  {rowItem.subskill}
                </td>
                <td className="py-3 px-4 text-theme-secondary text-[11px] hidden md:table-cell font-mono">
                  {rowItem.sample_patterns}
                </td>
                <td className="py-3 px-4 text-center font-bold text-theme-primary">
                  {rowItem.attempts} câu
                </td>
                <td className="py-3 px-4 min-w-[120px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>{rowItem.mastery_rate}%</span>
                    </div>
                    <div className="w-full bg-theme-surface-2 h-1.5 rounded-full overflow-hidden border border-theme">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rowItem.mastery_rate >= 80
                            ? 'bg-theme-success'
                            : rowItem.mastery_rate >= 60
                            ? 'bg-theme-warning'
                            : 'bg-theme-error'
                        }`}
                        style={{ width: `${rowItem.mastery_rate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  {getStatusBadge(rowItem.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
