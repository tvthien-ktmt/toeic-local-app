import React, { useState, useEffect } from 'react';
import { History, RefreshCw } from 'lucide-react';

interface HistoryAttempt {
  id: number;
  mode: string;
  raw_score: number;
  total_questions: number;
  toeic_score: number;
  time_spent_seconds: number;
  part5_correct: number;
  part6_correct: number;
  part7_correct: number;
  completed_at: string;
}

interface ExamHistoryTabProps {
  documentId?: number;
  historyAttempts?: HistoryAttempt[];
  isHistoryLoading?: boolean;
}

/**
 * Tab component rendering historical exam attempts with score progressions and completion timestamps.
 */
export const ExamHistoryTab: React.FC<ExamHistoryTabProps> = ({
  documentId,
  historyAttempts: initialHistoryAttempts,
  isHistoryLoading: initialIsHistoryLoading,
}) => {
  const [attempts, setAttempts] = useState<HistoryAttempt[]>(initialHistoryAttempts || []);
  const [isLoading, setIsLoading] = useState<boolean>(
    initialIsHistoryLoading !== undefined ? initialIsHistoryLoading : !!documentId
  );

  useEffect(() => {
    if (initialHistoryAttempts) {
      setAttempts(initialHistoryAttempts);
      setIsLoading(false);

      return;
    }

    if (documentId) {
      setIsLoading(true);
      fetch(`/api/textbooks/history/${documentId}`)
        .then((response) => response.json())
        .then((data) => {
          setAttempts(data.history || []);
          setIsLoading(false);
        })
        .catch((error: unknown) => {
          console.error('Failed to load exam history:', error);
          setIsLoading(false);
        });
    }
  }, [documentId, initialHistoryAttempts]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-theme pb-3">
        <History className="w-5 h-5 text-theme-accent" />
        <h3 className="font-bold text-theme-primary">Lịch Sử Thi Đề Này</h3>
      </div>

      {/* Score Progression Visualizer (Module XVI) */}
      {attempts.length >= 2 && (
        <div className="bg-theme-surface-2 p-4 rounded-2xl border border-theme space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-theme-primary">Tiến trình điểm số (Progression Trend)</span>
            <span className="text-theme-success font-bold">
              {attempts[0].toeic_score >= attempts[attempts.length - 1].toeic_score
                ? `+${attempts[0].toeic_score - attempts[attempts.length - 1].toeic_score} điểm so với lần đầu`
                : `${attempts[0].toeic_score - attempts[attempts.length - 1].toeic_score} điểm`}
            </span>
          </div>

          {/* Bar / Sparkline comparison */}
          <div className="flex items-end justify-between gap-2 h-24 pt-4 px-2 border-b border-theme">
            {[...attempts].reverse().map((attItem, idx) => {
              const heightPercent = Math.max(15, Math.round((attItem.toeic_score / 495) * 100));
              const isLatest = idx === attempts.length - 1;

              return (
                <div key={attItem.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <span className="text-[10px] font-bold text-theme-primary opacity-0 group-hover:opacity-100 transition absolute -top-5">
                    {attItem.toeic_score}
                  </span>
                  <div
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                      isLatest ? 'bg-theme-accent shadow-md' : 'bg-theme-secondary/40 hover:bg-theme-secondary/60'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] font-semibold text-theme-secondary">
                    L{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-xs text-theme-secondary flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-theme-accent" />
          <span>Đang tải lịch sử...</span>
        </div>
      ) : attempts.length === 0 ? (
        <div className="py-8 text-center text-xs text-theme-secondary">
          Chưa có lịch sử thi nào cho đề này.
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((attemptItem, index) => (
            <div
              key={attemptItem.id}
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                index === 0 ? 'border-theme-accent bg-theme-surface' : 'border-theme bg-theme-surface-2'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-theme-accent text-white rounded">
                      MỚI NHẤT
                    </span>
                  )}
                  <span className="text-theme-secondary">
                    {new Date(attemptItem.completed_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-theme-secondary">•</span>
                  <span className="text-theme-secondary">
                    {attemptItem.mode === 'full_exam' ? 'Thi Thật' : 'Luyện Tập'}
                  </span>
                </div>
                <span className="font-black text-theme-accent text-base">
                  {attemptItem.toeic_score} <span className="text-xs font-normal text-theme-secondary">/ 495</span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-theme-secondary">
                <span>Đúng {attemptItem.raw_score}/{attemptItem.total_questions} câu</span>
                <span>P5: {attemptItem.part5_correct}/30</span>
                <span>P6: {attemptItem.part6_correct}/16</span>
                <span>P7: {attemptItem.part7_correct}/54</span>
                <span className="ml-auto">
                  {Math.floor(attemptItem.time_spent_seconds / 60)}p{attemptItem.time_spent_seconds % 60}s
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
