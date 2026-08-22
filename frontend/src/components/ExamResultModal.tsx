import React, { useState, useMemo } from 'react';
import { RotateCcw, X, Trophy } from 'lucide-react';
import { ExamScoreTab } from './ExamScoreTab';
import { ExamWeaknessTab } from './ExamWeaknessTab';
import { ExamReviewTab } from './ExamReviewTab';
import { ExamHistoryTab } from './ExamHistoryTab';
import { ExamAiModal } from './ExamAiModal';
import type { ExamResultData, DetailedQuestionResult, AiExplanationResult } from '../types/examResults';

interface ExamResultModalProps {
  result: ExamResultData;
  onClose: () => void;
  onRetake: () => void;
}

/**
 * Comprehensive exam results dialog with Score Summary, Weakness Analysis, Question Review, and Historical Attempts tabs.
 */
export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  result,
  onClose,
  onRetake,
}) => {
  const [activeTab, setActiveTab] = useState<'score' | 'weakness' | 'review' | 'history'>('score');
  const [filterPart, setFilterPart] = useState<'ALL' | 'INCORRECT' | 'SKIPPED' | 'PART5' | 'PART6' | 'PART7'>('ALL');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // AI Modal
  const [selectedAiQuestion, setSelectedAiQuestion] = useState<DetailedQuestionResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiExplanationData, setAiExplanationData] = useState<AiExplanationResult | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  const fetchAiExplanation = async (questionItem: DetailedQuestionResult) => {
    setSelectedAiQuestion(questionItem);
    setIsAiLoading(true);
    setAiExplanationData(null);
    setAiErrorMsg(null);

    if (
      questionItem.common_trap &&
      questionItem.option_explanations &&
      Object.keys(questionItem.option_explanations).length > 0
    ) {
      setAiExplanationData({
        detailed_explanation: questionItem.explanation,
        grammar_recall: `Chủ điểm: **${questionItem.grammar_topic}**.`,
        grammar_topic: questionItem.grammar_topic,
        option_explanations: questionItem.option_explanations,
        common_trap: questionItem.common_trap,
        sentence_translation: questionItem.translated_sentence || '',
        exam_tip: null,
        key_vocabulary: [],
        source: 'db_cache',
      });
      setIsAiLoading(false);

      return;
    }

    try {
      const response = await fetch('/api/generate/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionItem.id,
          question_text: questionItem.question_text,
          options: questionItem.options,
          correct_answer: questionItem.correct_answer,
          user_answer: questionItem.user_answer,
          grammar_topic: questionItem.grammar_topic,
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setAiExplanationData(data.explanation);
      } else {
        const errorDetail =
          data.detail ||
          data.message ||
          'Hạn ngạch API Gemini hiện tại đang hết (Rate Limit / Quota 429).';
        setAiErrorMsg(`Câu này chưa có sẵn dữ liệu pre-gen trong CSDL. ${errorDetail}`);
      }
    } catch (error) {
      console.error('AI explanation error:', error);
      setAiErrorMsg(
        'Không thể kết nối với server phân tích AI. Vui lòng kiểm tra lại kết nối mạng hoặc server backend.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const weaknessGroups = useMemo(() => {
    const groups: Record<
      string,
      { topic: string; wrong: DetailedQuestionResult[]; skipped: DetailedQuestionResult[] }
    > = {};
    result.detailed_results.forEach((questionResult) => {
      if (questionResult.is_correct) {
        return;
      }
      const topic = questionResult.grammar_topic || `Part ${questionResult.part}`;
      if (!groups[topic]) {
        groups[topic] = { topic, wrong: [], skipped: [] };
      }
      if (!questionResult.user_answer) {
        groups[topic].skipped.push(questionResult);
      } else {
        groups[topic].wrong.push(questionResult);
      }
    });

    return Object.values(groups).sort(
      (firstGroup, secondGroup) =>
        secondGroup.wrong.length + secondGroup.skipped.length - (firstGroup.wrong.length + firstGroup.skipped.length)
    );
  }, [result.detailed_results]);

  const filteredQuestions = useMemo(() => {
    return result.detailed_results.filter((questionResult) => {
      if (filterPart === 'ALL') {
        return true;
      }
      if (filterPart === 'INCORRECT') {
        return !questionResult.is_correct && !!questionResult.user_answer;
      }
      if (filterPart === 'SKIPPED') {
        return !questionResult.user_answer;
      }
      if (filterPart === 'PART5') {
        return questionResult.part === 5;
      }
      if (filterPart === 'PART6') {
        return questionResult.part === 6;
      }
      if (filterPart === 'PART7') {
        return questionResult.part === 7;
      }

      return true;
    });
  }, [result.detailed_results, filterPart]);

  const wrongCount = result.detailed_results.filter((questionResult) => !questionResult.is_correct && !!questionResult.user_answer).length;
  const skippedCount = result.detailed_results.filter((questionResult) => !questionResult.user_answer).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-surface-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-accent text-white flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-theme-primary">
                Kết Quả Bài Thi TOEIC RC
              </h2>
              <p className="text-xs text-theme-secondary">
                {result.exam_title || `Đề thi #${result.document_id}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-theme-accent">
              {result.toeic_score} <span className="text-sm font-normal text-theme-secondary">/ 495</span>
            </div>
            <div className="text-xs text-theme-secondary">
              Đúng {result.raw_score}/{result.total_questions} câu
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-5 py-2 bg-theme-surface border-b border-theme shrink-0 overflow-x-auto">
          {(
            [
              { id: 'score', label: 'Điểm Số' },
              { id: 'weakness', label: `Tổng Ôn Lỗi Sai ${weaknessGroups.length > 0 ? `(${weaknessGroups.length} chủ điểm)` : ''}` },
              { id: 'review', label: 'Xem Lại 100 Câu' },
              { id: 'history', label: 'Lịch Sử Thi' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border-theme'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto shrink-0 flex gap-2">
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-xs font-semibold text-theme-primary border border-theme transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Làm Lại
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-secondary hover:text-theme-primary border border-theme transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto bg-theme-base">
          {activeTab === 'score' && (
            <ExamScoreTab
              result={result}
              wrongCount={wrongCount}
              skippedCount={skippedCount}
              onGoToWeaknessTab={() => setActiveTab('weakness')}
              onGoToReviewTab={() => setActiveTab('review')}
            />
          )}

          {activeTab === 'weakness' && (
            <ExamWeaknessTab
              weaknessGroups={weaknessGroups}
              expandedTopic={expandedTopic}
              onSetExpandedTopic={setExpandedTopic}
              onFetchAiExplanation={fetchAiExplanation}
            />
          )}

          {activeTab === 'review' && (
            <ExamReviewTab
              filteredQuestions={filteredQuestions}
              filterPart={filterPart}
              onSetFilterPart={setFilterPart}
              onFetchAiExplanation={fetchAiExplanation}
            />
          )}

          {activeTab === 'history' && (
            <ExamHistoryTab documentId={result.document_id} />
          )}
        </div>
      </div>

      <ExamAiModal
        selectedAiQuestion={selectedAiQuestion}
        isAiLoading={isAiLoading}
        aiExplanationData={aiExplanationData}
        aiErrorMsg={aiErrorMsg}
        onClose={() => setSelectedAiQuestion(null)}
        onRetry={fetchAiExplanation}
      />
    </div>
  );
};
