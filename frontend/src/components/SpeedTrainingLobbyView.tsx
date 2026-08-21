import React from 'react';
import { Flame, Clock, Play } from 'lucide-react';

export type SprintType = 'PART5' | 'PART6' | 'PART7';

export interface SprintConfig {
  type: SprintType;
  title: string;
  part: number;
  questionCount: number;
  timeLimitSeconds: number;
  targetSecPerQuestion: number;
  description: string;
}

/**
 * Predefined sprint presets and pacing configurations for TOEIC Part 5, 6, and 7 speed drills.
 */
export const SPRINT_CONFIGS: Record<SprintType, SprintConfig> = {
  PART5: {
    type: 'PART5',
    title: 'Part 5 Sprint (10 Câu / 3 Phút)',
    part: 5,
    questionCount: 10,
    timeLimitSeconds: 180,
    targetSecPerQuestion: 18,
    description: 'Rèn luyện phản xạ ngữ pháp & từ loại nhanh, mục tiêu trung bình 18 giây/câu để dành thời gian cho Part 7.'
  },
  PART6: {
    type: 'PART6',
    title: 'Part 6 Sprint (1 Đoạn / 2 Phút)',
    part: 6,
    questionCount: 4,
    timeLimitSeconds: 120,
    targetSecPerQuestion: 30,
    description: 'Luyện kỹ năng điền từ vào văn bản liền mạch trong 2 phút, kết hợp quan sát câu trước và câu sau.'
  },
  PART7: {
    type: 'PART7',
    title: 'Part 7 Sprint (1 Đoạn / 3 Phút)',
    part: 7,
    questionCount: 4,
    timeLimitSeconds: 180,
    targetSecPerQuestion: 45,
    description: 'Luyện kỹ năng đọc quét định vị từ khóa và loại suy đáp án nhanh cho 1 bài đọc đơn trong 3 phút.'
  }
};

interface SpeedTrainingLobbyViewProps {
  isLoading: boolean;
  onStartSprint: (sprintType: SprintType) => void;
}

/**
 * Lobby selection view for choosing Part 5, 6, or 7 speed training sprint presets.
 */
export const SpeedTrainingLobbyView: React.FC<SpeedTrainingLobbyViewProps> = ({
  isLoading,
  onStartSprint,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-theme-surface border border-theme p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-theme-accent text-xs font-bold uppercase tracking-wider mb-2">
          <Flame className="w-4 h-4 text-theme-warning" /> MODULE SPEED TRAINING (MỤC 24)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight mb-2">
          Luyện Tốc Độ & Tự Động Hóa Phản Xạ (Speed Sprint)
        </h1>
        <p className="text-xs sm:text-sm text-theme-secondary max-w-2xl leading-relaxed">
          Thiết kế theo phương pháp áp lực thời gian cao: <strong className="text-theme-primary font-bold">Accuracy &rarr; Automaticity &rarr; Speed</strong>. Huấn luyện não bộ nhận diện ngay từ loại, bẫy ngữ pháp và từ khóa bài đọc mà không bị phân vân tốn thời gian.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(SPRINT_CONFIGS) as SprintType[]).map((typeKey) => {
          const sprintItem = SPRINT_CONFIGS[typeKey];

          return (
            <div
              key={typeKey}
              className="bg-theme-surface rounded-2xl border border-theme hover:border-theme-accent p-6 space-y-5 flex flex-col justify-between shadow-md transition hover:shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center font-black">
                    P{sprintItem.part}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-theme-warning/15 text-theme-warning border border-theme-warning/30 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {Math.floor(sprintItem.timeLimitSeconds / 60)} phút
                  </span>
                </div>

                <h3 className="text-base font-bold text-theme-primary">
                  {sprintItem.title}
                </h3>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  {sprintItem.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-theme">
                <div className="flex justify-between text-xs text-theme-secondary font-medium">
                  <span>Mục tiêu tốc độ:</span>
                  <strong className="text-theme-accent font-bold">&le; {sprintItem.targetSecPerQuestion}s / câu</strong>
                </div>

                <button
                  onClick={() => onStartSprint(typeKey)}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Vào Chạy Sprint Ngay</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
