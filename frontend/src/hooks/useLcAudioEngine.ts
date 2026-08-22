import { useState, useEffect, useRef, useCallback } from 'react';
import type { LCAudioEngineState, LCTranscriptLine } from '../types/toeicListening';

interface UseLcAudioEngineOptions {
  audioUrl?: string;
  transcriptLines?: LCTranscriptLine[];
  isExamMode?: boolean;
  autoPlay?: boolean;
  fallbackText?: string;
  onEnded?: () => void;
}

/**
 * Robust audio player hook for TOEIC Listening.
 * Supports HTML5 Audio, speed control, 5s replay, line-by-line sync,
 * and Web SpeechSynthesis fallback when audio files are offline/empty.
 */
export const useLcAudioEngine = ({
  audioUrl = '',
  transcriptLines = [],
  isExamMode = false,
  autoPlay = false,
  fallbackText = '',
  onEnded,
}: UseLcAudioEngineOptions = {}) => {
  const [audioState, setAudioState] = useState<LCAudioEngineState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 10,
    playbackRate: 1.0,
    volume: 1.0,
    isMuted: false,
    activeTranscriptLineId: null,
    isAudioLocked: isExamMode,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isUsingSpeechFallback = useRef<boolean>(false);
  const speechStartTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(10);
  const playbackRateRef = useRef<number>(audioState.playbackRate);
  const lastProgressUpdateRef = useRef<number>(0);

  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // Keep playbackRateRef synced
  playbackRateRef.current = audioState.playbackRate;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setAudioState((prev) => ({
        ...prev,
        duration: audio.duration || 10,
      }));
    };

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      setAudioState((prev) => {
        let activeLineId = prev.activeTranscriptLineId;
        if (transcriptLines.length > 0) {
          const matched = transcriptLines.find(
            (line) => current >= line.startTimeSeconds && current <= line.endTimeSeconds
          );
          activeLineId = matched ? matched.id : null;
        }

        return {
          ...prev,
          currentTime: current,
          activeTranscriptLineId: activeLineId,
        };
      });
    };

    const handleAudioEnded = () => {
      setAudioState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      }));
      if (onEndedRef.current) {
        onEndedRef.current();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleAudioEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.pause();
    };
  }, [transcriptLines]);

  // Load new audio source or setup Web Speech fallback without infinite loops
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audioUrl && audioUrl.trim().length > 0) {
      isUsingSpeechFallback.current = false;
      audio.src = audioUrl;
      audio.playbackRate = playbackRateRef.current;
      if (autoPlay) {
        audio.play().catch(() => {
          // Auto-play was prevented by browser policy
        });
      }
    } else {
      isUsingSpeechFallback.current = true;
      const textToSpeak = fallbackText || transcriptLines.map((line) => line.textEn).join(' ') || 'Audio preview';
      const wordCount = textToSpeak.split(/\s+/).length;
      const estimatedSeconds = Math.max(4, Math.round((wordCount / 130) * 60));
      estimatedDurationRef.current = estimatedSeconds;
      setAudioState((prev) => {
        if (prev.duration === estimatedSeconds) {
          return prev;
        }

        return {
          ...prev,
          duration: estimatedSeconds,
        };
      });
    }
  }, [audioUrl, fallbackText, autoPlay]);

  // Handle Web Speech tick with 150ms throttling to avoid 60fps React state churn
  const updateSpeechProgress = useCallback(() => {
    if (!isUsingSpeechFallback.current || !window.speechSynthesis.speaking) {
      return;
    }

    const now = Date.now();
    if (now - lastProgressUpdateRef.current >= 150) {
      lastProgressUpdateRef.current = now;
      const elapsed = (now - speechStartTimeRef.current) / 1000;
      const current = Math.min(elapsed, estimatedDurationRef.current);

      setAudioState((prev) => {
        let activeLineId = prev.activeTranscriptLineId;
        if (transcriptLines.length > 0) {
          const matched = transcriptLines.find(
            (line) => current >= line.startTimeSeconds && current <= line.endTimeSeconds
          );
          activeLineId = matched ? matched.id : null;
        }

        return {
          ...prev,
          currentTime: current,
          activeTranscriptLineId: activeLineId,
        };
      });
    }

    const totalElapsed = (now - speechStartTimeRef.current) / 1000;
    if (totalElapsed < estimatedDurationRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateSpeechProgress);
    }
  }, [transcriptLines]);

  const handlePlay = useCallback(() => {
    if (isExamMode && audioState.isPlaying) {
      return;
    }

    const audio = audioRef.current;

    if (!isUsingSpeechFallback.current && audio && audio.src) {
      audio.play().then(() => {
        setAudioState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
        }));
      }).catch((err) => {
        console.warn('Audio play prevented:', err);
      });
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = fallbackText || transcriptLines.map((line) => line.textEn).join(' ') || 'TOEIC Listening Test Practice';
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = audioState.playbackRate;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        setAudioState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
        }));
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (onEnded) {
          onEnded();
        }
      };

      utterance.onerror = () => {
        setAudioState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
        }));
      };

      speechUtteranceRef.current = utterance;
      speechStartTimeRef.current = Date.now();
      window.speechSynthesis.speak(utterance);

      setAudioState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
      }));

      animationFrameRef.current = requestAnimationFrame(updateSpeechProgress);
    }
  }, [audioState.isPlaying, audioState.playbackRate, fallbackText, isExamMode, onEnded, transcriptLines, updateSpeechProgress]);

  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (!isUsingSpeechFallback.current && audio) {
      audio.pause();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }

    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const handleSeek = useCallback((targetSeconds: number) => {
    if (isExamMode) {
      return;
    }

    const audio = audioRef.current;
    if (!isUsingSpeechFallback.current && audio) {
      audio.currentTime = targetSeconds;
    }

    setAudioState((prev) => ({
      ...prev,
      currentTime: targetSeconds,
    }));
  }, [isExamMode]);

  const handleReplayFiveSeconds = useCallback(() => {
    if (isExamMode) {
      return;
    }

    const newTime = Math.max(0, audioState.currentTime - 5);
    handleSeek(newTime);
  }, [audioState.currentTime, handleSeek, isExamMode]);

  const handleSetPlaybackRate = useCallback((newRate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = newRate;
    }
    setAudioState((prev) => ({
      ...prev,
      playbackRate: newRate,
    }));
  }, []);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      activeTranscriptLineId: null,
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    audioState,
    handlePlay,
    handlePause,
    handleSeek,
    handleReplayFiveSeconds,
    handleSetPlaybackRate,
    handleStop,
  };
};
