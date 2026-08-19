import React from 'react';
import { Activity } from 'lucide-react';

interface ExamHistoryItem {
  id: number;
  mode: string;
  exam_title: string;
  completed_at: string;
  time_spent_seconds: number;
  toeic_score: number;
  raw_score: number;
  total_questions: number;
  part5_correct: number;
  part6_correct: number;
  part7_correct: number;
}

interface DashboardExamHistorySectionProps {
  examHistory: ExamHistoryItem[];
}

/**
 * Dashboard card section presenting a tabular history of completed full exams and scaled TOEIC scores.
 */
export const DashboardExamHistorySection: React.FC<DashboardExamHistorySectionProps> = ({
  examHistory,
}) => {
  return (
    <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-theme-primary font-bold text-base">
          <Activity className="w-5 h-5 text-theme-accent" />
          <h2>Lịch Sử Thi & Điểm Đề Cố Định (TOEIC RC 75 Phút)</h2>
        </div>
        <span className="text-xs font-semibold text-theme-secondary">
          {examHistory.length} Lượt thi đã hoàn thành
        </span>
      </div>

      {examHistory.length === 0 ? (
        <div className="text-center py-8 bg-theme-surface-2 rounded-2xl border border-theme text-xs text-theme-secondary">
          Bạn chưa hoàn thành lượt thi đề cố định nào. Hãy chọn 1 đề trong <strong className="text-theme-primary">Kho Đề Cố Định</strong> để thử sức!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {examHistory.map((historyItem) => (
            <div
              key={historyItem.id}
              className="p-4 bg-theme-surface-2 border border-theme rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-theme-accent text-white rounded">
                    {historyItem.mode === 'full_exam' ? 'Thi Thật 75m' : 'Luyện Tập'}
                  </span>
                  <h4 className="text-sm font-bold text-theme-primary">
                    {historyItem.exam_title.replace(/^\[.*?\]\s*/, '')}
                  </h4>
                </div>
                <p className="text-xs text-theme-secondary">
                  Hoàn thành lúc: {new Date(historyItem.completed_at).toLocaleString('vi-VN')} &bull; Thời gian: {Math.floor(historyItem.time_spent_seconds / 60)} phút {historyItem.time_spent_seconds % 60}s
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-lg font-black text-theme-success">
                    {historyItem.toeic_score} <span className="text-xs text-theme-secondary font-normal">/ 495 RC</span>
                  </div>
                  <div className="text-[11px] text-theme-secondary">
                    Đúng {historyItem.raw_score}/{historyItem.total_questions} câu (P5: {historyItem.part5_correct}/30, P6: {historyItem.part6_correct}/16, P7: {historyItem.part7_correct}/54)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
