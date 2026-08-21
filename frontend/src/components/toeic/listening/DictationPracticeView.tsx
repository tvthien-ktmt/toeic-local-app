import React, { useState, useMemo } from 'react';
import { FileText, Volume2, RotateCcw, Sparkles, ArrowRight, Eye, Play } from 'lucide-react';
import type { LCDictationItem } from '../../../types/toeicListening';
import { MOCK_LC_DICTATION_ITEMS } from '../../../data/sampleLcData';
import { LcFeatureUpdatingCard } from './LcFeatureUpdatingCard';
import { DictationEvaluationResult } from './DictationEvaluationResult';
import type { DictationEvaluationSummary } from './DictationEvaluationResult';

interface DictationPracticeViewProps {
  onCompleteItem?: (accuracy: number) => void;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Interactive Dictation (Chép chính tả) Practice Module for TOEIC Listening.
 * Supports Level selection, audio playback, typed input comparison, word-by-word diff, and accuracy calculation.
 */
export const DictationPracticeView: React.FC<DictationPracticeViewProps> = ({
  onCompleteItem,
  onNavigateHome,
  onNavigateCatalog,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'Basic' | 'Intermediate' | 'Advanced'>('Basic');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const filteredItems = MOCK_LC_DICTATION_ITEMS.filter((item) => item.level === selectedLevel);
  const currentItem: LCDictationItem | undefined = filteredItems[currentIndex] || filteredItems[0];

  const handleSpeak = (rate: number = 0.9) => {
    if (!currentItem) {
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentItem.fullSentenceEn);
      utterance.rate = rate;
      utterance.lang = currentItem.speakerAccent === 'UK' ? 'en-GB' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Word-by-word accuracy evaluation
  const evaluationResult: DictationEvaluationSummary | null = useMemo(() => {
    if (!currentItem || !isEvaluated) {
      return null;
    }

    const targetWords = currentItem.fullSentenceEn
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const userWords = userInput
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    let matchCount = 0;
    const wordDiffs = targetWords.map((targetWord, index) => {
      const userWord = userWords[index] || '';
      const isMatch = targetWord === userWord;
      if (isMatch) {
        matchCount += 1;
      }

      return {
        targetWord,
        userWord,
        isMatch,
      };
    });

    const accuracyPercentage = targetWords.length > 0 ? Math.round((matchCount / targetWords.length) * 100) : 0;

    return {
      wordDiffs,
      matchCount,
      totalTargetWords: targetWords.length,
      accuracyPercentage,
    };
  }, [currentItem, userInput, isEvaluated]);

  const handleCheck = () => {
    if (!userInput.trim()) {
      return;
    }
    setIsEvaluated(true);
    if (onCompleteItem && evaluationResult) {
      onCompleteItem(evaluationResult.accuracyPercentage);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      setCurrentIndex(0);
    }
    setUserInput('');
    setIsEvaluated(false);
    setIsRevealed(false);
  };

  if (!currentItem || filteredItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-2">
              <FileText className="w-6 h-6 text-theme-accent" />
              <span>Luyện Chép Chính Tả (Dictation)</span>
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1">
              Rèn luyện khả năng bắt từ, nhận diện nối âm và độ chính xác từng từ trong câu.
            </p>
          </div>
        </div>

        <LcFeatureUpdatingCard
          title="Bài Tập Chép Chính Tả (Dictation)"
          description="Dữ liệu bài tập chép chính tả theo các cấp độ Basic, Intermediate, Advanced đang được chuẩn bị từ các bộ đề ETS và Hacker."
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme/50 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-2">
            <FileText className="w-6 h-6 text-theme-accent" />
            <span>Luyện Chép Chính Tả (Dictation)</span>
          </h2>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Nghe câu thoại bản xứ và gõ lại chính xác từng từ để nâng cao khả năng bắt âm.
          </p>
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center gap-1.5 bg-theme-surface-2 p-1 rounded-xl border border-theme">
          {(['Basic', 'Intermediate', 'Advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => {
                setSelectedLevel(level);
                setCurrentIndex(0);
                setIsEvaluated(false);
                setUserInput('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedLevel === level
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dictation Card */}
      <div className="bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Progress & Item Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-theme-accent/15 text-theme-accent font-bold">
              Câu {currentIndex + 1} / {filteredItems.length}
            </span>
            <span className="text-theme-secondary">
              Chủ đề: <strong className="text-theme-primary">{currentItem.topic}</strong>
            </span>
          </div>

          <span className="text-theme-secondary">
            Giọng: <strong className="text-theme-primary">{currentItem.speakerAccent} Accent</strong>
          </span>
        </div>

        {/* Audio Controls Box */}
        <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSpeak(0.95)}
              className="px-4 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Phát Audio Chuẩn (1.0x)</span>
            </button>

            <button
              onClick={() => handleSpeak(0.75)}
              className="px-3.5 py-2.5 rounded-xl bg-theme-surface border border-theme hover:border-theme-accent text-theme-primary font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Nghe tốc độ chậm"
            >
              <Volume2 className="w-4 h-4 text-theme-accent" />
              <span>Chậm (0.75x)</span>
            </button>
          </div>

          <button
            onClick={() => setIsRevealed(!isRevealed)}
            className="text-xs font-semibold text-theme-secondary hover:text-theme-primary flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isRevealed ? 'Ẩn gợi ý' : 'Xem gợi ý / Dịch nghĩa'}</span>
          </button>
        </div>

        {/* Hint / Translation Dropdown */}
        {isRevealed && (
          <div className="p-4 rounded-xl bg-theme-accent/10 border border-theme-accent/30 text-xs space-y-1 animate-fade-in">
            <p className="font-semibold text-theme-accent">Dịch nghĩa tiếng Việt:</p>
            <p className="text-theme-primary">{currentItem.vietnameseMeaning}</p>
          </div>
        )}

        {/* User Input Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
            <span>Gõ lại câu nghe được vào ô bên dưới:</span>
          </label>
          <textarea
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            disabled={isEvaluated}
            placeholder="Type what you hear..."
            rows={3}
            className="w-full p-4 rounded-2xl bg-theme-surface border-2 border-theme focus:border-theme-accent focus:outline-none text-sm text-theme-primary font-medium transition-colors resize-none"
          />
        </div>

        {/* Evaluation Diff Showcase */}
        {isEvaluated && evaluationResult && (
          <DictationEvaluationResult
            evaluationResult={evaluationResult}
            currentItem={currentItem}
          />
        )}

        {/* Action Buttons Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setUserInput('');
              setIsEvaluated(false);
            }}
            className="px-4 py-2 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm Lại Câu Này</span>
          </button>

          {!isEvaluated ? (
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-theme-accent disabled:opacity-50 text-white font-bold text-xs shadow-md hover:brightness-110 cursor-pointer transition-all"
            >
              Kiểm Tra Đáp Án
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Câu Tiếp Theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
