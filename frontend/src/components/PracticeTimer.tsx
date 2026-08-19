import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface PracticeTimerProps {
  targetMinutes: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

/**
 * Floating countdown timer badge with color shifts when under 5 minutes remaining.
 */
export const PracticeTimer: React.FC<PracticeTimerProps> = ({ targetMinutes, onTimeUp, isPaused = false }) => {
  const totalSeconds = targetMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);

  useEffect(() => {
    setSecondsLeft(targetMinutes * 60);
  }, [targetMinutes]);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((previousSeconds) => {
        if (previousSeconds <= 1) {
          clearInterval(interval);
          if (onTimeUp) {
            onTimeUp();
          }

          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const ratio = secondsLeft / totalSeconds;

  let badgeColor = "bg-theme-success/15 text-theme-success border-theme-success/40";
  let iconColor = "text-theme-success";

  if (ratio <= 0.1) {
    badgeColor = "bg-theme-error/15 text-theme-error border-theme-error/40 animate-pulse";
    iconColor = "text-theme-error";
  } else if (ratio <= 0.3) {
    badgeColor = "bg-theme-warning/15 text-theme-warning border-theme-warning/40";
    iconColor = "text-theme-warning";
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-lg transition-colors ${badgeColor}`}>
      <Clock className={`w-4 h-4 ${iconColor}`} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {ratio <= 0.1 && (
        <AlertTriangle className="w-3.5 h-3.5 text-theme-error ml-1" />
      )}
    </div>
  );
};
