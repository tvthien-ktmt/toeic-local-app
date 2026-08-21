import React from 'react';
import { CheckCircle2, Lightbulb, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import type { KnowledgeLessonItem } from '../../data/rcKnowledgeLessonsData';

interface KnowledgeLessonDetailCardProps {
  lesson: KnowledgeLessonItem;
  onStartDrill?: (lessonPart: string) => void;
}

/**
 * Interactive detailed view for a single TOEIC knowledge & test-taking tactics lesson.
 */
export const KnowledgeLessonDetailCard: React.FC<KnowledgeLessonDetailCardProps> = ({
  lesson,
  onStartDrill,
}) => {
  return (
    <div className="bg-theme-surface border border-theme rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 animate-fade-in">
      {/* Lesson Header */}
      <div className="space-y-2 border-b border-theme/50 pb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-theme-accent text-white shadow-xs">
            {lesson.part}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-theme-surface-2 border border-theme text-theme-secondary">
            {lesson.category}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-theme-warning/15 text-theme-warning border border-theme-warning/30">
            {lesson.level}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-theme-primary tracking-tight">
          {lesson.title}
        </h2>
        <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
          {lesson.summaryVi}
        </p>
      </div>

      {/* Core Formula & Rule Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-theme-accent/10 via-indigo-500/10 to-purple-500/10 border border-theme-accent/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-theme-accent">
          <Lightbulb className="w-4 h-4" />
          <span>Quy Tắc Vàng &amp; Công Thức Nhận Diện:</span>
        </div>
        <div className="p-3 rounded-xl bg-theme-surface border border-theme text-xs sm:text-sm font-mono font-bold text-theme-primary leading-relaxed overflow-x-auto">
          {lesson.formulaOrRule}
        </div>
      </div>

      {/* 3-Step Strategy Tactics */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-theme-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Quy Trình 3 Bước Xử Lý Nhanh Câu Hỏi:</span>
        </h4>

        <div className="space-y-2">
          {lesson.tacticsSteps.map((stepText, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-theme-surface-2 border border-theme flex items-start gap-3 text-xs text-theme-primary"
            >
              <span className="w-6 h-6 rounded-lg bg-theme-accent/15 text-theme-accent font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="leading-relaxed font-medium">{stepText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Clues */}
      {lesson.keySignals.length > 0 && (
        <div className="p-4 rounded-2xl bg-theme-surface-2 border border-theme space-y-2">
          <span className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-theme-success" />
            <span>Dấu Hiệu Nhận Biết Trọng Tâm:</span>
          </span>
          <ul className="list-disc pl-5 space-y-1 text-xs text-theme-secondary leading-relaxed">
            {lesson.keySignals.map((signal, index) => (
              <li key={index}>{signal}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Real Exam Example with Walkthrough */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-theme-secondary uppercase tracking-wider">
          Ví Dụ Mẫu Trong Đề Thi Thực Tế:
        </h4>

        {lesson.examples.map((ex, index) => (
          <div
            key={index}
            className="p-4 sm:p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3.5"
          >
            <p className="text-xs sm:text-sm font-bold text-theme-primary leading-relaxed whitespace-pre-line">
              {ex.questionText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ex.options.map((opt) => (
                <div
                  key={opt.key}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    opt.isCorrect
                      ? 'border-theme-success bg-theme-success/15 text-theme-success font-bold'
                      : 'border-theme/60 bg-theme-surface text-theme-secondary'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md border font-bold text-[11px] flex items-center justify-center shrink-0">
                    {opt.key}
                  </span>
                  <span>{opt.text}</span>
                  {opt.isCorrect && <span className="ml-auto text-[10px] font-bold">(Đáp án đúng)</span>}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-theme-surface border border-theme text-xs text-theme-secondary leading-relaxed">
              <strong className="text-theme-primary">Giải thích chi tiết: </strong>
              {ex.explanationVi}
            </div>
          </div>
        ))}
      </div>

      {/* Common Traps & Distractors */}
      {lesson.commonTraps.length > 0 && (
        <div className="p-4 rounded-2xl bg-theme-error/10 border border-theme-error/30 space-y-2">
          <span className="text-xs font-bold text-theme-error flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Cạm Bẫy Đề Thi Cần Tránh:</span>
          </span>
          <ul className="list-disc pl-5 space-y-1 text-xs text-theme-primary leading-relaxed">
            {lesson.commonTraps.map((trap, index) => (
              <li key={index}>{trap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Practice Action Button */}
      {onStartDrill && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onStartDrill(lesson.part)}
            className="px-6 py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Luyện Tập Ngay Dạng Bài {lesson.part}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
