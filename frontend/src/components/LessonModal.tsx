import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { LessonMarkdownRenderer } from './LessonMarkdownRenderer';
import { LessonQuickCheckSection } from './LessonQuickCheckSection';

interface MasteryInfo {
  status: 'unknown' | 'weak' | 'ok';
  correct_count: number;
  total_count: number;
  mastery_pct: number;
}

interface WorkedExample {
  id: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  common_trap: string | null;
  grammar_topic: string | null;
}

interface QuickCheckQ {
  id: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  part: number;
}

interface LessonData {
  topic_id: number;
  canonical_name: string;
  category: string;
  level: string;
  parts: number[];
  lesson_id: number;
  content_markdown: string;
  has_real_examples: boolean;
  worked_examples: WorkedExample[];
  quick_check: QuickCheckQ[];
  mastery: MasteryInfo;
}

interface LessonModalProps {
  topicId: number;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  unknown: 'Chưa học',
  weak: 'Cần ôn',
  ok: 'Đã vững',
};

const CAT_LABELS: Record<string, string> = {
  grammar_topic: 'Ngữ pháp',
  question_type: 'Dạng câu hỏi',
  vocab_topic: 'Từ vựng',
};

const API_BASE = '';

/**
 * Fullscreen lesson study modal rendering comprehensive grammar theory, mindmaps, worked examples, and quick-check quizzes.
 */
export const LessonModal: React.FC<LessonModalProps> = ({ topicId, onClose }) => {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/curriculum/lessons/${topicId}`)
      .then((response) => response.json())
      .then((data) => {
        setLesson(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [topicId]);

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    setQuizAnswers((previousQuizAnswers) => ({
      ...previousQuizAnswers,
      [questionId]: optionLetter,
    }));
  };

  const handleQuizSubmit = () => {
    setIsQuizSubmitted(true);
  };

  if (isLoading || !lesson) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-theme-primary text-sm font-semibold bg-theme-surface px-6 py-4 rounded-xl border border-theme shadow-2xl flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-theme-accent" />
          <span>Đang tải bài giảng...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-3 sm:p-6"
      onClick={(clickEvent) => {
        if (clickEvent.target === clickEvent.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-theme-surface rounded-2xl p-5 sm:p-8 max-w-4xl w-full border border-theme shadow-2xl mt-4 mb-12 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary mb-2">
              {lesson.canonical_name}
            </h2>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded-md px-3 py-1 text-xs font-bold">
                {CAT_LABELS[lesson.category] || lesson.category}
              </span>
              <span className="bg-theme-surface-2 text-theme-secondary border border-theme rounded-md px-2.5 py-1 text-xs font-semibold">
                Trình độ: {lesson.level.toUpperCase()}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md px-2.5 py-1 text-xs font-semibold">
                Part {lesson.parts.join(', ')}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="bg-theme-surface-2 hover:bg-theme-surface-3 border border-theme text-theme-secondary hover:text-theme-primary rounded-xl w-9 h-9 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mastery status badge */}
        <div className="bg-gradient-to-r from-theme-surface-2 to-theme-base rounded-xl p-3.5 sm:p-4 mb-5 flex justify-between items-center border border-theme">
          <span className="text-theme-secondary text-xs sm:text-sm font-medium">Trạng thái của bạn:</span>
          <span className="font-extrabold text-sm text-theme-accent">
            {STATUS_LABELS[lesson.mastery.status]}
            {lesson.mastery.total_count > 0 && ` (${lesson.mastery.mastery_pct}%)`}
          </span>
        </div>

        {/* Lesson content */}
        <div className="bg-theme-base rounded-2xl p-5 sm:p-7 text-theme-primary leading-relaxed text-sm sm:text-base mb-6 border border-theme max-h-[68vh] overflow-y-auto shadow-inner">
          <LessonMarkdownRenderer content={lesson.content_markdown} onImageClick={(url) => setZoomImage(url)} />
        </div>

        {/* Quick check */}
        {lesson.quick_check && lesson.quick_check.length > 0 && (
          <LessonQuickCheckSection
            quickCheck={lesson.quick_check}
            quizAnswers={quizAnswers}
            isQuizSubmitted={isQuizSubmitted}
            onSelectOption={handleSelectOption}
            onSubmitQuiz={handleQuizSubmit}
          />
        )}

        {/* Lightbox Image Zoom Modal */}
        {zoomImage && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-4 cursor-zoom-out"
            onClick={() => setZoomImage(null)}
          >
            <div className="relative max-w-5xl max-h-[92vh] flex items-center justify-center">
              <img 
                src={zoomImage} 
                alt="Zoomed Visual Guide" 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
              <button 
                onClick={() => setZoomImage(null)}
                className="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold border-2 border-white shadow-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
