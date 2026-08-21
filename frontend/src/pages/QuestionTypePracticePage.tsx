import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { QUESTION_TYPE_DRILLS } from '../data/questionTypeDrillsData';
import type { QuestionTypeDrillItem } from '../data/questionTypeDrillsData';
import { QuestionTypeDrillCard } from '../components/toeic/QuestionTypeDrillCard';

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

  const currentDrill: QuestionTypeDrillItem = filteredDrills[currentDrillIndex] || {
    id: 'placeholder',
    part: 'Part 5',
    questionTypeCategory: 'P5_WORD_FORM',
    typeNameVi: 'Part 5 — Dạng Bài',
    questionStem: 'Đang cập nhật câu hỏi...',
    options: [],
    correctAnswer: 'A',
    detailedExplanationVi: '',
    tacticsAppliedVi: '',
  };

  const handleSelectOption = (letter: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(letter);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || isAnswerSubmitted) return;

    const isCorrect = selectedAnswer === currentDrill.correctAnswer;
    setScoreCount((previousScore) => ({
      correct: isCorrect ? previousScore.correct + 1 : previousScore.correct,
      total: previousScore.total + 1,
    }));
    setIsAnswerSubmitted(true);
  };

  const handleNextDrill = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCurrentDrillIndex((previousIndex) => (previousIndex + 1) % filteredDrills.length);
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

      {/* Drill Question Card or Developing State */}
      {filteredDrills.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-surface border border-theme max-w-xl mx-auto space-y-4 shadow-xs animate-fade-in my-8">
          <div className="w-16 h-16 rounded-3xl bg-theme-accent/15 text-theme-accent flex items-center justify-center mx-auto shadow-inner">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-theme-warning/15 text-theme-warning border border-theme-warning/30">
              Tính Năng Đang Phát Triển
            </span>
            <h3 className="text-xl font-extrabold text-theme-primary">
              Luyện Theo Dạng Bài
            </h3>
            <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed max-w-md mx-auto">
              Tính năng đang được phát triển, vui lòng đợi admin làm việc nhé!
            </p>
          </div>
        </div>
      ) : (
        <QuestionTypeDrillCard
          currentDrill={currentDrill}
          currentDrillIndex={currentDrillIndex}
          totalDrillsCount={filteredDrills.length}
          selectedAnswer={selectedAnswer}
          isAnswerSubmitted={isAnswerSubmitted}
          onSelectOption={handleSelectOption}
          onCheckAnswer={handleCheckAnswer}
          onNextDrill={handleNextDrill}
          onResetPractice={handleResetPractice}
        />
      )}
    </div>
  );
};
