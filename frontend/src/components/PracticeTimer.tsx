import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface PracticeTimerProps {
  targetMinutes: number;
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export const PracticeTimer: React.FC<PracticeTimerProps> = ({ targetMinutes, onTimeUp, isPaused = false }) => {
  const totalSeconds = targetMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);

  useEffect(() => {
    setSecondsLeft(targetMinutes * 60);
  }, [targetMinutes]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTimeUp]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const ratio = secondsLeft / totalSeconds;

  let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  let iconColor = "text-emerald-400";

  if (ratio <= 0.1) {
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
    iconColor = "text-rose-400";
  } else if (ratio <= 0.3) {
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    iconColor = "text-amber-400";
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-lg transition-colors ${badgeColor}`}>
      <Clock className={`w-4 h-4 ${iconColor}`} />
      <span>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      {ratio <= 0.1 && (
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 ml-1" />
      )}
    </div>
  );
};
