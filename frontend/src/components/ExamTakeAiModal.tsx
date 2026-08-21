import React from 'react';
import { Sparkles, AlertTriangle, RefreshCw, X, Brain, ListChecks, BookOpen, Lightbulb, Languages, Zap } from 'lucide-react';

interface QuestionItem {
  id: number;
  q_num: number;
  part: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  option_explanations: Record<string, string>;
  translated_sentence: string;
  grammar_topic: string;
  common_trap?: string;
}

interface ExamTakeAiModalProps {
  selectedAiQuestion: QuestionItem | null;
  isAiLoading: boolean;
  aiExplanationData: any | null;
  aiErrorMsg: string | null;
  onClose: () => void;
  onRetry: (questionItem: QuestionItem) => void;
}

/**
 * Modal popup displayed during exam practice providing live AI explanation assistance for any question.
 */
export const ExamTakeAiModal: React.FC<ExamTakeAiModalProps> = ({
  selectedAiQuestion,
  isAiLoading,
  aiExplanationData,
  aiErrorMsg,
  onClose,
  onRetry,
}) => {
  if (!selectedAiQuestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
      <div className="bg-theme-surface border border-theme-accent/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-theme pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-theme-warning" />
            <h3 className="font-bold text-base text-theme-primary">
              AI Giải Thích & Nhắc Lại Kiến Thức — Câu #{selectedAiQuestion.q_num}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-theme-surface-2 hover:bg-theme-surface text-theme-secondary hover:text-theme-primary cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAiLoading ? (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-theme-warning animate-spin mx-auto" />
            <p className="text-sm font-semibold text-theme-secondary">AI đang phân tích câu hỏi...</p>
          </div>
        ) : aiErrorMsg ? (
          <div className="p-5 rounded-2xl alert-error border border-theme-error/30 text-theme-error space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-theme-error">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Chưa Thể Phân Tích AI Chi Tiết</span>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{aiErrorMsg}</p>
            <div className="pt-2 flex items-center justify-between border-t border-theme-error/20">
              <span className="text-[11px] text-theme-secondary">
                Hạn ngạch API Gemini Free Tier tự động reset sau vài phút / 24h.
              </span>
              <button
                onClick={() => onRetry(selectedAiQuestion)}
                className="px-3 py-1.5 rounded-xl alert-error hover:opacity-90 text-theme-error border border-theme-error/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Thử Lại Phân Tích Live
              </button>
            </div>
          </div>
        ) : aiExplanationData ? (
          <div className="space-y-4 text-xs animate-fade-in">
            {/* Meta Badge Bar */}
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-theme">
              <span className="px-2 py-0.5 rounded-full bg-theme-accent/15 text-theme-accent font-bold text-[11px]">
                {selectedAiQuestion.grammar_topic &&
                !selectedAiQuestion.grammar_topic.toLowerCase().startsWith(`part ${selectedAiQuestion.part}`)
                  ? `Part ${selectedAiQuestion.part} • ${selectedAiQuestion.grammar_topic}`
                  : `Part ${selectedAiQuestion.part}`}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-theme-success/15 text-theme-success font-bold text-[11px]">
                Đáp án đúng: ({selectedAiQuestion.correct_answer})
              </span>
              {aiExplanationData.source === 'db_cache' && (
                <span className="px-2 py-0.5 rounded-full alert-success border border-theme-success/20 text-theme-success text-[10px] font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Tức thì từ DB
                </span>
              )}
            </div>

            {/* Detailed Explanation */}
            <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-1.5">
              <h4 className="font-bold text-theme-accent flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                <span>Phân Tích Chi Tiết</span>
              </h4>
              <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">
                {aiExplanationData.detailed_explanation}
              </p>
            </div>

            {/* Option Explanations */}
            {aiExplanationData.option_explanations &&
              Object.keys(aiExplanationData.option_explanations).length > 0 && (
                <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-2">
                  <h4 className="font-bold text-theme-primary flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4" />
                    <span>Phân Tích Từng Đáp Án</span>
                  </h4>
                  {Object.entries(aiExplanationData.option_explanations).map(([opt, exp]) => (
                    <div
                      key={opt}
                      className={`flex gap-2 p-2 rounded-lg ${
                        opt === selectedAiQuestion.correct_answer
                          ? 'alert-success border border-theme-success/20'
                          : 'bg-theme-surface-2'
                      }`}
                    >
                      <span
                        className={`font-bold shrink-0 ${
                          opt === selectedAiQuestion.correct_answer
                            ? 'text-theme-success'
                            : 'text-theme-error'
                        }`}
                      >
                        ({opt})
                      </span>
                      <span className="text-theme-secondary leading-relaxed">{exp as string}</span>
                    </div>
                  ))}
                </div>
              )}

            {/* Common Trap */}
            {aiExplanationData.common_trap && (
              <div className="p-4 rounded-xl alert-error border border-theme-error/30 space-y-1.5">
                <h4 className="font-bold text-theme-error flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Bẫy Phổ Biến — Vì Sao Hay Nhầm?</span>
                </h4>
                <p className="text-theme-primary leading-relaxed">{aiExplanationData.common_trap}</p>
              </div>
            )}

            {/* Grammar Knowledge Recall */}
            <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-1.5">
              <h4 className="font-bold text-theme-accent flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Nhắc Lại Kiến Thức & Quy Tắc</span>
              </h4>
              <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">
                {aiExplanationData.grammar_recall}
              </p>
            </div>

            {/* Exam Tip */}
            {aiExplanationData.exam_tip && (
              <div className="p-4 rounded-xl alert-warning border border-theme-warning/30 space-y-1.5">
                <h4 className="font-bold text-theme-warning flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Mẹo Làm Bài Nhanh</span>
                </h4>
                <p className="text-theme-primary leading-relaxed">{aiExplanationData.exam_tip}</p>
              </div>
            )}

            {/* Translation */}
            {(aiExplanationData.sentence_translation || aiExplanationData.translated_sentence) && (
              <div className="p-4 rounded-xl alert-success border border-theme-success/30 space-y-1.5">
                <h4 className="font-bold text-theme-success flex items-center gap-1.5">
                  <Languages className="w-4 h-4" />
                  <span>Bản Dịch Tiếng Việt</span>
                </h4>
                <p className="text-theme-primary leading-relaxed">
                  {aiExplanationData.sentence_translation || aiExplanationData.translated_sentence}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-theme-error">
            Không thể nạp phần giải thích. Vui lòng thử lại.
          </div>
        )}
      </div>
    </div>
  );
};
