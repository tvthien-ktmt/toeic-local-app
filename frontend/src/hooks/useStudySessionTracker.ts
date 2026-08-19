import { useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Custom hook tracking user active study duration and flushing session stats to backend upon unmount/navigation.
 */
export const useStudySessionTracker = (sessionType: 'practice' | 'quiz' | 'flashcard' | 'reading') => {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    const flushStudySession = () => {
      const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      // Only record meaningful study sessions (>= 5 seconds)
      if (elapsedSeconds >= 5) {
        // Use sendBeacon or axios for reliable exit recording
        try {
          const payload = JSON.stringify({
            session_type: sessionType,
            duration_seconds: elapsedSeconds
          });
          const blob = new Blob([payload], { type: 'application/json' });
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/dashboard/study-session', blob);
          } else {
            axios.post('/api/dashboard/study-session', {
              session_type: sessionType,
              duration_seconds: elapsedSeconds
            });
          }
        } catch (e) {
          console.error("Failed to flush study session:", e);
        }
      }
    };

    const handleBeforeUnload = () => {
      flushStudySession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushStudySession();
    };
  }, [sessionType]);
};
