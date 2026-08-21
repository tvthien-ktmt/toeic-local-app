import React from 'react';
import { Layers, BookOpen, Clock, Award } from 'lucide-react';
import { PracticeTimer } from './PracticeTimer';

interface PracticeHeaderSectionProps {
  practiceMode: 'part_practice' | 'full_mock';
  score: { correct: number; total: number };
  isMockSubmitted: boolean;
  isShowCoverageMatrix: boolean;
  isGuidedMode: boolean;
  onToggleGuidedMode: () => void;
  onToggleCoverageMatrix: () => void;
  onChangePracticeMode: (mode: 'part_practice' | 'full_mock') => void;
  onFinishMockTest: () => void;
}

/**
 * Practice page header toolbar displaying mode selection, timer or score summary, and coverage matrix toggle.
 */
export const PracticeHeaderSection: React.FC<PracticeHeaderSectionProps> = ({
  practiceMode,
  score,
  isMockSubmitted,
  isShowCoverageMatrix,
  isGuidedMode,
  onToggleGuidedMode,
  onToggleCoverageMatrix,
  onChangePracticeMode,
  onFinishMockTest,
}) => {
  return (
    <div className="bg-theme-surface rounded-3xl p-6 sm:p-8 border border-theme shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-theme-accent/15 border border-theme-accent/30 rounded-full text-theme-accent text-xs font-bold uppercase tracking-wider">
            <span>Ngân hàng câu hỏi TOEIC RC Thông minh</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary tracking-tight">
              Luyện Tập & Củng Cố Kiến Thức
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1">
              Rèn luyện theo Part, dạng câu hỏi hoặc thi thử đề chuẩn 75 phút để đo lường năng lực thực tế.
            </p>
          </div>

          {practiceMode === 'part_practice' && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onToggleGuidedMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                  isGuidedMode
                    ? 'bg-theme-warning/20 border-theme-warning text-theme-warning'
                    : 'bg-theme-surface-2 border-theme text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isGuidedMode ? 'bg-theme-warning animate-ping' : 'bg-theme-secondary'}`} />
                <span>Guided Mode (Chiến thuật 3 bước): {isGuidedMode ? 'Đang Bật' : 'Đang Tắt'}</span>
              </button>

              <button
                onClick={onToggleCoverageMatrix}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                  isShowCoverageMatrix
                    ? 'bg-theme-accent text-white border-theme-accent'
                    : 'bg-theme-surface-2 border-theme text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isShowCoverageMatrix ? 'Đóng Ma Trận Độ Phủ' : 'Xem Ma Trận Độ Phủ Kỹ Năng'}</span>
              </button>
            </div>
          )}

          <div className="inline-flex p-1 bg-theme-surface-2 rounded-2xl border border-theme space-x-1 pt-1">
            <button
              onClick={() => onChangePracticeMode('part_practice')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                practiceMode === 'part_practice'
                  ? 'bg-theme-accent text-white shadow-lg'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Luyện Theo Dạng Bài</span>
            </button>

            <button
              onClick={() => onChangePracticeMode('full_mock')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                practiceMode === 'full_mock'
                  ? 'bg-theme-accent text-white font-extrabold shadow-lg'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Thi Thử Đầy Đủ 75 Phút (Full Mock)</span>
            </button>
          </div>
        </div>

        <div className="bg-theme-surface-2 rounded-2xl p-4 border border-theme text-center shrink-0 min-w-[180px] shadow-lg space-y-2">
          {practiceMode === 'full_mock' ? (
            <>
              <span className="text-xs text-theme-warning font-bold block uppercase tracking-wider">
                Đồng hồ Thi Thử
              </span>
              <PracticeTimer
                targetMinutes={75}
                onTimeUp={onFinishMockTest}
                isPaused={isMockSubmitted}
              />
              {!isMockSubmitted ? (
                <button
                  onClick={onFinishMockTest}
                  className="w-full py-1.5 px-3 bg-theme-warning hover:opacity-90 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Nộp Bài Thi Thử
                </button>
              ) : (
                <span className="text-xs text-theme-success font-bold block">Đã hoàn thành!</span>
              )}
            </>
          ) : (
            <>
              <Award className="w-6 h-6 mx-auto text-theme-accent mb-1" />
              <span className="text-xs text-theme-secondary block font-medium">Điểm số luyện tập</span>
              <span className="text-2xl font-extrabold text-theme-primary">
                {score.correct} / {score.total}
              </span>
              {score.total > 0 && (
                <span className="text-xs font-bold text-theme-success block mt-1">
                  ({Math.round((score.correct / score.total) * 100)}% Chính xác)
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
