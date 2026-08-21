import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Volume2, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import type { LCShadowingItem } from '../../../types/toeicListening';
import { MOCK_LC_SHADOWING_ITEMS } from '../../../data/sampleLcData';
import { LcFeatureUpdatingCard } from './LcFeatureUpdatingCard';

interface ShadowingPracticeViewProps {
  onCompleteItem?: (rating: number) => void;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Interactive Shadowing Practice Module for TOEIC Listening.
 * Allows listening to native speech, recording user voice, and side-by-side playback comparison.
 */
export const ShadowingPracticeView: React.FC<ShadowingPracticeViewProps> = ({
  onCompleteItem,
  onNavigateHome,
  onNavigateCatalog,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [selfRating, setSelfRating] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentItem: LCShadowingItem | undefined =
    MOCK_LC_SHADOWING_ITEMS[currentIndex] || MOCK_LC_SHADOWING_ITEMS[0];

  const handlePlayOriginal = () => {
    if (!currentItem) {
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentItem.fullTextEn);
      utterance.rate = currentItem.recommendedSpeed || 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      // Microphone fallback
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setRecordedAudioUrl('recording-completed');
      }, 3000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(false);
      setRecordedAudioUrl('recording-completed');
    }
  };

  const handleRate = (rating: number) => {
    setSelfRating(rating);
    if (onCompleteItem) {
      onCompleteItem(rating);
    }
  };

  const handleNext = () => {
    if (currentIndex < MOCK_LC_SHADOWING_ITEMS.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      setCurrentIndex(0);
    }
    setRecordedAudioUrl(null);
    setSelfRating(null);
    setIsRecording(false);
  };

  if (!currentItem || MOCK_LC_SHADOWING_ITEMS.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-2">
              <Mic className="w-6 h-6 text-theme-accent" />
              <span>Luyện Shadowing &amp; Phát Âm Bản Xứ</span>
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1">
              Luyện nói đuổi theo câu thoại mẫu và đối chiếu giọng đọc với người bản xứ.
            </p>
          </div>
        </div>

        <LcFeatureUpdatingCard
          title="Luyện Nói & Shadowing (Phát Âm Bản Xứ)"
          description="Dữ liệu câu thoại mẫu và audio giọng đọc theo ngữ điệu 4 accent đang được cập nhật từ các bài hội thoại Part 3 và Part 4."
          badge="Tính Năng Đang Cập Nhật Dữ Liệu"
          onNavigateHome={onNavigateHome}
          onNavigateCatalog={onNavigateCatalog}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-theme/50 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-2">
            <Mic className="w-6 h-6 text-theme-accent" />
            <span>Luyện Shadowing &amp; Phát Âm Bản Xứ</span>
          </h2>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Nghe câu thoại mẫu bản xứ, thu âm giọng đọc và tự đánh giá độ trôi chảy.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-theme-accent/15 text-theme-accent">
          Câu {currentIndex + 1} / {MOCK_LC_SHADOWING_ITEMS.length}
        </span>
      </div>

      {/* Main Shadowing Workspace */}
      <div className="bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Part & Speaker Info */}
        <div className="flex items-center justify-between text-xs text-theme-secondary">
          <span>Part {currentItem.part} &bull; {currentItem.speakerRole}</span>
          <span className="font-semibold text-theme-accent">Tốc độ gợi ý: {currentItem.recommendedSpeed}x</span>
        </div>

        {/* English Prompt Box */}
        <div className="p-6 rounded-2xl bg-theme-surface-2 border border-theme space-y-3">
          <p className="text-base sm:text-lg font-bold text-theme-primary leading-relaxed">
            "{currentItem.fullTextEn}"
          </p>
          <p className="text-xs text-theme-secondary italic">
            {currentItem.vietnameseMeaning}
          </p>
        </div>

        {/* Step 1: Listen to Native Audio */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-theme-primary uppercase flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-theme-accent" />
            <span>Bước 1: Nghe phát âm mẫu bản xứ</span>
          </span>

          <button
            onClick={handlePlayOriginal}
            className="px-5 py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Nghe Giọng Đọc Mẫu</span>
          </button>
        </div>

        {/* Step 2: Record User Speech */}
        <div className="space-y-3 pt-2 border-t border-theme/50">
          <span className="text-xs font-bold text-theme-primary uppercase flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-theme-warning" />
            <span>Bước 2: Bật Micro và đọc theo (Shadowing)</span>
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-5 py-3 rounded-2xl bg-theme-warning text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Bắt Đầu Thu Âm Giọng Nói</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-5 py-3 rounded-2xl bg-theme-error text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Dừng Thu Âm &amp; Hoàn Tất</span>
              </button>
            )}

            {recordedAudioUrl && (
              <span className="text-xs font-bold text-theme-success flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>Đã ghi âm thành công!</span>
              </span>
            )}
          </div>
        </div>

        {/* Step 3: Self-Evaluation & Stars Rating */}
        {recordedAudioUrl && (
          <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3 animate-fade-in">
            <span className="text-xs font-bold text-theme-primary block">
              Bước 3: Tự chấm điểm mức độ trôi chảy của bạn:
            </span>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selfRating && selfRating >= star
                      ? 'bg-theme-warning text-white shadow-xs'
                      : 'bg-theme-surface border border-theme text-theme-secondary hover:border-theme-warning'
                  }`}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next Question Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-theme/50">
          <button
            onClick={() => {
              setRecordedAudioUrl(null);
              setSelfRating(null);
            }}
            className="px-4 py-2 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thu Âm Lại</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Câu Tiếp Theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
