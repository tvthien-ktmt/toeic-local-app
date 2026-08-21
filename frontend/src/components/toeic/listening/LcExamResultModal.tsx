import React from 'react';
import { Award, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import type { LCExamResult } from '../../../types/toeicListening';

interface LcExamResultModalProps {
  result: LCExamResult;
  onReviewAnswers: () => void;
  onRetest: () => void;
  onBackToCatalog: () => void;
}

/**
 * High-impact Score Result and Diagnostic Modal for TOEIC Listening.
 * Displays ETS scaled score (5 to 495), Part-by-Part accuracy breakdowns, and root-cause error analysis.
 */
export const LcExamResultModal: React.FC<LcExamResultModalProps> = ({
  result,
  onReviewAnswers,
  onRetest,
  onBackToCatalog,
}) => {
  const accuracyPercent = Math.round((result.rawCorrectCount / result.totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fade-in">
        {/* Header: Trophy & Score Showcase */}
        <div className="text-center space-y-3 border-b border-theme/50 pb-6">
          <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-yellow-400 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20 animate-bounce">
            <Award className="w-9 h-9" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-bold uppercase tracking-wider">
              Kết Quả Bài Thi TOEIC Listening
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-theme-primary mt-1">
              {result.examTitle}
            </h3>
          </div>

          {/* Scaled Score Circle Banner */}
          <div className="p-4 rounded-2xl bg-theme-surface-2 border border-theme max-w-md mx-auto flex items-center justify-around">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-theme-secondary">Điểm LC Quy Đổi</span>
              <div className="text-3xl sm:text-4xl font-black text-theme-accent tracking-tight">
                {result.scaledScore}
                <span className="text-sm font-normal text-theme-secondary">/495</span>
              </div>
            </div>

            <div className="h-10 w-px bg-theme/50" />

            <div className="text-center">
              <span className="text-[11px] font-semibold text-theme-secondary">Số Câu Đúng</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-theme-primary">
                {result.rawCorrectCount}
                <span className="text-sm font-normal text-theme-secondary">/{result.totalQuestions} ({accuracyPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Part-by-Part Score Progress */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-theme-primary flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-theme-accent" />
            <span>Độ Chính Xác Từng Part:</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.entries(result.partScores).map(([partKey, data]) => {
              const partNum = partKey.replace('part', 'Part ');

              return (
                <div key={partKey} className="p-3 rounded-xl bg-theme-surface-2 border border-theme text-center space-y-1">
                  <span className="text-[11px] font-bold text-theme-secondary uppercase">{partNum}</span>
                  <div className="text-base font-extrabold text-theme-primary">
                    {data.percentage}%
                  </div>
                  <span className="text-[10px] text-theme-secondary">
                    {data.correct}/{data.total} câu
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Root-cause Error Diagnosis Breakdown */}
        {result.errorCauseBreakdown && (
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs sm:text-sm text-theme-primary flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-theme-warning" />
              <span>Chẩn Đoán Nguyên Nhân Mắc Lỗi Sai:</span>
            </h4>

            <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-theme-secondary">Mắc bẫy lặp từ / đồng âm (Trap Distractor):</span>
                <strong className="text-theme-warning">{result.errorCauseBreakdown.distractorTrap}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-secondary">Chưa kịp bắt từ đồng nghĩa (Paraphrase):</span>
                <strong className="text-theme-accent">{result.errorCauseBreakdown.paraphrase}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-secondary">Thiếu từ vựng chuyên ngành (Vocabulary):</span>
                <strong className="text-theme-primary">{result.errorCauseBreakdown.vocabulary}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-secondary">Chưa theo kịp tốc độ nói (Speed & Linking):</span>
                <strong className="text-theme-error">{result.errorCauseBreakdown.speechSpeed}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Action Items */}
        {result.recommendedActions && (
          <div className="p-4 rounded-2xl alert-success border border-theme-success/30 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-theme-success">
              <ShieldCheck className="w-4 h-4" />
              <span>Lộ Trình Cải Thiện Tiếp Theo:</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-theme-primary/90 text-[11px] leading-relaxed">
              {result.recommendedActions.map((act) => (
                <li key={act}>{act}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-theme/50">
          <button
            onClick={onBackToCatalog}
            className="px-4 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 transition-colors"
          >
            Về Kho Đề LC
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onRetest}
              className="px-4 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-primary hover:bg-theme-surface-2 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thi Lại Đề Này</span>
            </button>

            <button
              onClick={onReviewAnswers}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xem Lại &amp; Học Transcript</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
