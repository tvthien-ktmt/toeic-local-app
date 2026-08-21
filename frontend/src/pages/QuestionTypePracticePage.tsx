import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { QUESTION_TYPE_DRILLS } from '../data/questionTypeDrillsData';
import type { QuestionTypeDrillItem } from '../data/questionTypeDrillsData';

interface QuestionTypePracticePageProps {
  initialCategory?: string;
  onNavigateHome?: () => void;
  onNavigateLessons?: () => void;
}

/**
 * Dedicated Question-Type Drill Training Page.
 * Allows students to practice specific TOEIC question types with immediate feedback and applied tactics.
 */
export const QuestionTypePracticePage: React.FC<QuestionTypePracticePageProps> = ({
  onNavigateLessons,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [scoreCount, setScoreCount] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const filteredDrills = QUESTION_TYPE_DRILLS.filter((drill) => {
    if (selectedCategory === 'ALL') return true;

    return drill.questionTypeCategory === selectedCategory;
  });

  const currentDrill: QuestionTypeDrillItem = filteredDrills[currentDrillIndex] || QUESTION_TYPE_DRILLS[0];

  const handleSelectOption = (letter: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(letter);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || isAnswerSubmitted) return;

    const isCorrect = selectedAnswer === currentDrill.correctAnswer;
    setScoreCount((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));
    setIsAnswerSubmitted(true);
  };

  const handleNextDrill = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCurrentDrillIndex((prev) => (prev + 1) % filteredDrills.length);
  };

  const handleResetPractice = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCurrentDrillIndex(0);
    setScoreCount({ correct: 0, total: 0 });
  };

  const categories = [
    { id: 'ALL', label: 'Tất Cả Dạng Bài' },
    { id: 'P5_WORD_FORM', label: 'Part 5 — Từ Loại' },
    { id: 'P5_PREPOSITIONS_CONJUNCTIONS', label: 'Part 5 — Giới Từ & Liên Từ' },
    { id: 'P5_PARTICIPLES', label: 'Part 5 — Phân Từ V-ing / V-ed' },
    { id: 'P6_SENTENCE_INSERTION', label: 'Part 6 — Điền Cả Câu' },
    { id: 'P7_NOT_EXCEPT', label: 'Part 7 — Câu Hỏi NOT / EXCEPT' },
    { id: 'P7_INFERENCE', label: 'Part 7 — Câu Hỏi Suy Luận' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-theme-primary">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-theme/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Khu Luyện Tập Phân Loại Theo Dạng Bài (Question-Type Drills)</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Luyện Chuyên Sâu Từng Dạng Câu Hỏi TOEIC
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Luyện tập tập trung vào các dạng câu hỏi hay sai để nâng cao độ chính xác và tốc độ phản xạ.
          </p>
        </div>

        {/* Live Score Tracker */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme shadow-xs flex items-center gap-3">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-theme-secondary">Đã Làm</span>
              <p className="text-base font-black text-theme-primary">{scoreCount.total}</p>
            </div>
            <div className="w-px h-7 bg-theme/40" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-theme-success">Đúng</span>
              <p className="text-base font-black text-theme-success">{scoreCount.correct}</p>
            </div>
          </div>

          {onNavigateLessons && (
            <button
              type="button"
              onClick={onNavigateLessons}
              className="px-4 py-3 rounded-2xl bg-theme-surface-2 border border-theme text-xs font-bold text-theme-primary hover:text-theme-accent transition-colors cursor-pointer"
            >
              Xem Lý Thuyết
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-theme-surface rounded-2xl border border-theme">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentDrillIndex(0);
              setSelectedAnswer(null);
              setIsAnswerSubmitted(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-theme-accent text-white shadow-xs'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Drill Question Card */}
      <div className="bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Type Badge & Progress Indicator */}
        <div className="flex items-center justify-between border-b border-theme/50 pb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-theme-accent/15 text-theme-accent border border-theme-accent/30">
            {currentDrill.typeNameVi}
          </span>
          <span className="text-xs font-semibold text-theme-secondary">
            Câu {currentDrillIndex + 1} / {filteredDrills.length}
          </span>
        </div>

        {/* Passage Text if present (Part 6 / Part 7) */}
        {currentDrill.passageText && (
          <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface-2 border border-theme text-xs sm:text-sm text-theme-primary leading-relaxed">
            <span className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block mb-2">
              Đoạn Văn Bài Đọc:
            </span>
            <p className="whitespace-pre-line font-medium">{currentDrill.passageText}</p>
          </div>
        )}

        {/* Question Stem */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">
            Câu Hỏi:
          </span>
          <h3 className="text-sm sm:text-base font-bold text-theme-primary leading-snug">
            {currentDrill.questionStem}
          </h3>
        </div>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentDrill.options.map((option) => {
            const isSelected = selectedAnswer === option.key;
            const isCorrect = option.key === currentDrill.correctAnswer;

            let optionStyle = 'border-theme hover:bg-theme-surface-2 text-theme-primary';
            if (isAnswerSubmitted) {
              if (isCorrect) {
                optionStyle = 'border-theme-success bg-theme-success/15 text-theme-success font-bold ring-1 ring-theme-success';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-theme-error bg-theme-error/15 text-theme-error font-medium';
              }
            } else if (isSelected) {
              optionStyle = 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold ring-1 ring-theme-accent';
            }

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelectOption(option.key)}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${optionStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-theme-accent text-white'
                      : 'bg-theme-surface-2 text-theme-secondary border border-theme'
                  }`}
                >
                  {option.key}
                </span>
                <span className="text-xs font-medium leading-snug">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Answer Submission / Next Question Action */}
        <div className="flex items-center justify-between pt-4 border-t border-theme/40">
          <button
            type="button"
            onClick={handleResetPractice}
            className="px-4 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm Lại Từ Đầu</span>
          </button>

          {!isAnswerSubmitted ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
              className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
            >
              Kiểm Tra Đáp Án
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextDrill}
              className="px-6 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Câu Tiếp Theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Detailed Explanation & Applied Tactics Card */}
        {isAnswerSubmitted && (
          <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              {selectedAnswer === currentDrill.correctAnswer ? (
                <div className="flex items-center gap-1.5 text-theme-success font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chính xác! (+1 Điểm)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-theme-error font-bold text-xs">
                  <XCircle className="w-4 h-4" />
                  <span>Chưa chính xác. Đáp án đúng là ({currentDrill.correctAnswer})</span>
                </div>
              )}
            </div>

            <p className="text-xs text-theme-primary leading-relaxed">
              <strong>Giải thích chi tiết: </strong>
              {currentDrill.detailedExplanationVi}
            </p>

            <div className="p-3 rounded-xl bg-theme-surface border border-theme text-xs text-theme-secondary flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-theme-primary">Chiến thuật áp dụng: </strong>
                {currentDrill.tacticsAppliedVi}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
