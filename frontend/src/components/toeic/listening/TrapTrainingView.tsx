import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Play, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';
import type { LCTrapTrainingItem, LCTrapType } from '../../../types/toeicListening';
import { MOCK_LC_TRAP_ITEMS } from '../../../data/sampleLcData';
import { LcFeatureUpdatingCard } from './LcFeatureUpdatingCard';

interface TrapTrainingViewProps {
  onCompleteDrill?: () => void;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Dedicated TOEIC Trap Training Module.
 * Trains reflex recognition of keyword repetition, similar sounds, and wrong context distractors.
 */
export const TrapTrainingView: React.FC<TrapTrainingViewProps> = ({
  onNavigateHome,
  onNavigateCatalog,
}) => {
  const [selectedTrapType, setSelectedTrapType] = useState<LCTrapType>('KEYWORD_REPETITION');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const currentItem: LCTrapTrainingItem | undefined =
    MOCK_LC_TRAP_ITEMS.find((item) => item.trapType === selectedTrapType) || MOCK_LC_TRAP_ITEMS[0];

  const handlePlayPrompt = () => {
    if (!currentItem) {
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentItem.exampleQuestion.promptText);
      utterance.rate = 0.95;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (key: string) => {
    if (isAnswered) {
      return;
    }
    setSelectedOption(key);
    setIsAnswered(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const trapOptions: Array<{ type: LCTrapType; label: string }> = [
    { type: 'KEYWORD_REPETITION', label: 'Bẫy Lặp Từ Khóa' },
    { type: 'SIMILAR_SOUND', label: 'Bẫy Đồng Âm' },
    { type: 'WRONG_ACTION', label: 'Bẫy Sai Hành Động' },
  ];

  if (!currentItem || MOCK_LC_TRAP_ITEMS.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-theme-warning" />
              <span>Phòng Luyện Nhận Diện Bẫy Đề Thi TOEIC LC</span>
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1">
              Phân tích bản chất các loại bẫy phổ biến nhất của ETS để không bị mất điểm oan.
            </p>
          </div>
        </div>

        <LcFeatureUpdatingCard
          title="Luyện Phản Xạ Bẫy Đề Thi (Trap Training)"
          description="Hệ thống đang tổng hợp và phân loại các cạm bẫy thực tế (Lặp từ khóa, Từ đồng âm, Sai hành động) từ các bộ đề ETS và YBM."
          badge="Tính Năng Đang Cập Nhật Dữ Liệu"
          onNavigateHome={onNavigateHome}
          onNavigateCatalog={onNavigateCatalog}
        />
      </div>
    );
  }

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 sm:p-7 shadow-sm transition-colors space-y-6 animate-fade-in">
      {/* Header & Trap Type Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-theme/50 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-theme-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-theme-warning" />
            <span>Phòng Luyện Nhận Diện Bẫy Đề Thi TOEIC LC</span>
          </h3>
          <p className="text-xs text-theme-secondary mt-0.5">
            Phân tích bản chất các loại bẫy phổ biến nhất của ETS để không bị mất điểm oan
          </p>
        </div>

        {/* Trap Type Selector */}
        <div className="flex items-center gap-1.5 bg-theme-surface-2 p-1 rounded-xl border border-theme">
          {trapOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                setSelectedTrapType(opt.type);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTrapType === opt.type
                  ? 'bg-theme-warning text-white shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trap Deep Explanation Card */}
      <div className="p-5 rounded-2xl bg-theme-warning/10 border border-theme-warning/30 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-theme-warning" />
          <h4 className="text-sm font-bold text-theme-primary">
            {currentItem.title}
          </h4>
        </div>
        <p className="text-xs text-theme-secondary leading-relaxed">
          {currentItem.description}
        </p>
        <div className="p-3 rounded-xl bg-theme-surface border border-theme-warning/40 text-xs font-semibold text-theme-warning">
          💡 Chiến thuật xử lý: {currentItem.howToAvoid}
        </div>
      </div>

      {/* Example Question Exercise */}
      <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-theme-primary uppercase flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-theme-accent" />
            <span>Câu Hỏi Mẫu:</span>
          </span>

          <button
            onClick={handlePlayPrompt}
            className="px-3 py-1.5 rounded-xl bg-theme-accent text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Nghe Câu Hỏi</span>
          </button>
        </div>

        <p className="text-sm sm:text-base font-bold text-theme-primary">
          "{currentItem.exampleQuestion.promptText}"
        </p>

        {/* 3 Choices Grid */}
        <div className="space-y-2">
          {currentItem.exampleQuestion.options.map((option) => {
            const isSelected = selectedOption === option.key;
            const isCorrect = option.key === currentItem.exampleQuestion.correctOption;

            let optionStyle = 'border-theme hover:bg-theme-surface text-theme-primary';
            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'border-theme-success bg-theme-success/15 text-theme-primary font-medium';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-theme-error bg-theme-error/15 text-theme-primary';
              }
            } else if (isSelected) {
              optionStyle = 'border-theme-accent bg-theme-accent/10 text-theme-accent font-semibold';
            }

            return (
              <button
                key={option.key}
                onClick={() => handleSelectOption(option.key)}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${optionStyle}`}
              >
                <span className="w-6 h-6 rounded-md bg-theme-surface border border-theme text-theme-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {option.key}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm leading-snug">{option.text}</p>
                </div>
                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-theme-success shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation on Answer */}
        {isAnswered && (
          <div className="p-4 rounded-xl bg-theme-surface border border-theme text-xs space-y-2 animate-fade-in">
            <p className="font-bold text-theme-primary">
              Giải thích cạm bẫy trong câu:
            </p>
            <p className="text-theme-secondary leading-relaxed">
              {currentItem.exampleQuestion.explanation}
            </p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-2 rounded-xl bg-theme-accent text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Thử Lại Câu Khác</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
