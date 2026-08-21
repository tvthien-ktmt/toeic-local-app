import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { LCDictationItem } from '../../../types/toeicListening';

export interface DictationWordDiff {
  targetWord: string;
  userWord: string;
  isMatch: boolean;
}

export interface DictationEvaluationSummary {
  wordDiffs: DictationWordDiff[];
  matchCount: number;
  totalTargetWords: number;
  accuracyPercentage: number;
}

interface DictationEvaluationResultProps {
  evaluationResult: DictationEvaluationSummary;
  currentItem: LCDictationItem;
}

/**
 * Renders the word-by-word diff evaluation result for dictation practice.
 * Highlights correct vs mismatched words, accuracy percentage, and full translations.
 */
export const DictationEvaluationResult: React.FC<DictationEvaluationResultProps> = ({
  evaluationResult,
  currentItem,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-theme/50 pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-theme-success" />
          <span className="text-sm font-bold text-theme-primary">
            Độ chính xác: <strong className="text-theme-accent text-base">{evaluationResult.accuracyPercentage}%</strong>
          </span>
        </div>
        <span className="text-xs text-theme-secondary">
          Đúng {evaluationResult.matchCount}/{evaluationResult.totalTargetWords} từ
        </span>
      </div>

      {/* Word-by-word diff tags */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-theme-secondary uppercase">
          Chi tiết từng từ (Xanh = Đúng, Đỏ = Cần cải thiện):
        </span>
        <div className="flex flex-wrap gap-2">
          {evaluationResult.wordDiffs.map((diff, index) => (
            <span
              key={index}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                diff.isMatch
                  ? 'bg-theme-success/15 border-theme-success/40 text-theme-success'
                  : 'bg-theme-error/15 border-theme-error/40 text-theme-error'
              }`}
            >
              {diff.targetWord}
            </span>
          ))}
        </div>
      </div>

      {/* Target Sentence vs Translation */}
      <div className="pt-2 border-t border-theme/50 text-xs space-y-1">
        <p className="text-theme-primary font-bold">Câu chuẩn: "{currentItem.fullSentenceEn}"</p>
        <p className="text-theme-secondary italic">Nghĩa: {currentItem.vietnameseMeaning}</p>
      </div>
    </div>
  );
};
