import React from 'react';
import { Play, Pause, RotateCcw, Volume2, Lock, Sparkles, Gauge } from 'lucide-react';
import type { LCAudioEngineState } from '../../../types/toeicListening';

interface AudioPlayerEngineProps {
  audioState: LCAudioEngineState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
  onReplayFiveSeconds: () => void;
  onSetPlaybackRate: (rate: number) => void;
  isExamMode?: boolean;
  label?: string;
  subLabel?: string;
}

/**
 * Visual audio player engine with waveform progress, speed controller, and exam mode locking indicator.
 */
export const AudioPlayerEngine: React.FC<AudioPlayerEngineProps> = ({
  audioState,
  onPlay,
  onPause,
  onSeek,
  onReplayFiveSeconds,
  onSetPlaybackRate,
  isExamMode = false,
  label = 'TOEIC Official Audio Stream',
  subLabel = 'Chế độ âm thanh chuẩn ETS',
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = audioState.duration > 0
    ? Math.min(100, Math.max(0, (audioState.currentTime / audioState.duration) * 100))
    : 0;

  const speedOptions = [0.75, 0.85, 1.0, 1.1, 1.2];

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
      {/* Top Header: Track Label & Mode Indicator */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isExamMode ? 'bg-theme-warning/15 text-theme-warning' : 'bg-theme-accent/15 text-theme-accent'
          }`}>
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-theme-primary truncate">
              {label}
            </h4>
            <p className="text-[11px] text-theme-secondary truncate">
              {subLabel}
            </p>
          </div>
        </div>

        {/* Mode Pill Badge */}
        {isExamMode ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-warning/15 border border-theme-warning/30 text-theme-warning text-[11px] font-semibold shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span>Exam Mode (Khóa tua)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-accent/15 border border-theme-accent/30 text-theme-accent text-[11px] font-semibold shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Mode</span>
          </div>
        )}
      </div>

      {/* Waveform / Progress Slider */}
      <div className="space-y-1.5 mb-3">
        <div className="relative w-full h-3 bg-theme-surface-2 rounded-full overflow-hidden cursor-pointer">
          <div
            className={`h-full transition-all duration-150 ${
              isExamMode ? 'bg-theme-warning' : 'bg-theme-accent'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
          {!isExamMode && (
            <input
              type="range"
              min={0}
              max={audioState.duration || 10}
              step={0.1}
              value={audioState.currentTime}
              onChange={(event) => onSeek(parseFloat(event.target.value))}
              aria-label="Audio progress slider"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          )}
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] text-theme-secondary font-mono">
          <span>{formatTime(audioState.currentTime)}</span>
          <span>{formatTime(audioState.duration)}</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-theme/40">
        {/* Play / Pause / Replay Buttons */}
        <div className="flex items-center gap-2">
          {!isExamMode && (
            <button
              onClick={onReplayFiveSeconds}
              title="Lùi lại 5 giây"
              className="p-2 rounded-xl border border-theme hover:bg-theme-surface-2 text-theme-secondary hover:text-theme-primary transition-colors text-xs flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">-5s</span>
            </button>
          )}

          <button
            onClick={audioState.isPlaying ? onPause : onPlay}
            disabled={isExamMode && audioState.isPlaying}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
              audioState.isPlaying
                ? 'bg-theme-warning text-white hover:brightness-110'
                : 'bg-theme-accent text-white hover:brightness-110'
            } ${isExamMode && audioState.isPlaying ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {audioState.isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{isExamMode ? 'Đang tự phát thi...' : 'Tạm Dừng'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isExamMode ? 'Bắt Đầu Audio' : 'Phát Audio'}</span>
              </>
            )}
          </button>
        </div>

        {/* Playback Speed Selector (Practice Mode only) */}
        {!isExamMode && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-theme-secondary mr-1">
              <Gauge className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tốc độ:</span>
            </div>
            <div className="flex items-center gap-1 bg-theme-surface-2 p-0.5 rounded-lg border border-theme">
              {speedOptions.map((rate) => (
                <button
                  key={rate}
                  onClick={() => onSetPlaybackRate(rate)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                    audioState.playbackRate === rate
                      ? 'bg-theme-accent text-white shadow-xs'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
