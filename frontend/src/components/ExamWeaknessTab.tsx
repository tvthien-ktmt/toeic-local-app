import React from 'react';
import { Target, ChevronDown, ChevronUp, AlertTriangle, Sparkles } from 'lucide-react';
import { MarkdownPassage } from './MarkdownPassage';
import type { DetailedQuestionResult } from '../types/examResults';

interface WeaknessGroup {
  topic: string;
  wrong: DetailedQuestionResult[];
  skipped: DetailedQuestionResult[];
}

interface ExamWeaknessTabProps {
  weaknessGroups: WeaknessGroup[];
  expandedTopic: string | null;
  onSetExpandedTopic: (topic: string | null) => void;
  onFetchAiExplanation: (questionItem: DetailedQuestionResult) => void;
}

/**
 * Tab component analyzing exam weaknesses grouped by grammar topic with expandable question review panels.
 */
export const ExamWeaknessTab: React.FC<ExamWeaknessTabProps> = ({
  weaknessGroups,
  expandedTopic,
  onSetExpandedTopic,
  onFetchAiExplanation,
}) => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-theme pb-3">
        <div>
          <h3 className="font-bold text-theme-primary flex items-center gap-2">
            <Target className="w-5 h-5 text-theme-accent" />
            Tổng Ôn Lỗi Sai & Chủ Điểm Cần Cải Thiện
          </h3>
          <p className="text-xs text-theme-secondary mt-0.5">
            Gom nhóm toàn bộ các câu sai và chưa làm theo từng chủ điểm ngữ pháp. Bấm vào từng chủ điểm để xem chi tiết bẫy và bản dịch.
          </p>
        </div>
      </div>

      {weaknessGroups.length === 0 ? (
        <div className="py-12 text-center text-xs text-theme-success font-bold flex items-center justify-center gap-2">
          <span>Tuyệt vời! Bạn không làm sai câu nào trong đề này!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {weaknessGroups.map((group) => {
            const isExpanded = expandedTopic === group.topic;
            const totalIssue = group.wrong.length + group.skipped.length;

            return (
              <div
                key={group.topic}
                className="bg-theme-surface rounded-2xl border border-theme overflow-hidden shadow-sm transition-all"
              >
                <div
                  onClick={() => onSetExpandedTopic(isExpanded ? null : group.topic)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-theme-surface-2 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-theme-error/15 border border-theme-error/30 text-theme-error font-black text-xs flex items-center justify-center">
                      {totalIssue}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-theme-primary">{group.topic}</h4>
                      <span className="text-[11px] text-theme-secondary">
                        {group.wrong.length > 0 && (
                          <span className="text-theme-error">{group.wrong.length} câu sai</span>
                        )}
                        {group.wrong.length > 0 && group.skipped.length > 0 && <span> • </span>}
                        {group.skipped.length > 0 && (
                          <span className="text-theme-warning">{group.skipped.length} câu bỏ trống</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-theme-accent">
                      {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-theme-secondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-theme-secondary" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3 border-t border-theme">
                    {[...group.wrong, ...group.skipped].map((questionItem) => (
                      <div
                        key={questionItem.id}
                        className="p-3.5 rounded-xl bg-theme-surface-2 border border-theme text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-theme-secondary">
                            Part {questionItem.part} • Câu hỏi
                          </span>
                          <button
                            onClick={() => onFetchAiExplanation(questionItem)}
                            className="flex items-center gap-1 text-[11px] text-theme-accent hover:underline font-bold cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> AI Phân Tích
                          </button>
                        </div>
                        <p className="font-medium text-theme-primary leading-relaxed">
                          {questionItem.part === 5 ? (
                            questionItem.question_text
                          ) : (
                            <MarkdownPassage text={questionItem.question_text} />
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="alert-success px-2 py-0.5 rounded font-bold text-theme-success">
                            Đáp án: ({questionItem.correct_answer})
                          </span>
                          {questionItem.user_answer ? (
                            <span className="alert-error px-2 py-0.5 rounded font-bold text-theme-error">
                              Bạn chọn: ({questionItem.user_answer})
                            </span>
                          ) : (
                            <span className="alert-warning px-2 py-0.5 rounded font-bold text-theme-warning">
                              Bỏ trống
                            </span>
                          )}
                        </div>
                        {questionItem.common_trap && (
                          <div className="p-2 rounded-lg alert-error border border-theme-error/20 flex gap-2 text-theme-error">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><strong>Bẫy:</strong> {questionItem.common_trap}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
