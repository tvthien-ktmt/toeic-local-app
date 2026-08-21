import { useState, useEffect } from 'react';
import type { QuestionItem } from '../utils/examGrouping';
import type { NormalizedParts } from '../types/toeicContent';

export interface ExamDocument {
  id: number;
  filename: string;
  category: string;
  series: string;
  test_number: number;
  markdown_content: string;
  is_builtin: boolean;
}

/**
 * Custom hook managing full TOEIC exam taking state, question navigation, timer countdown,
 * draft persistence, flagging, and submission processing.
 */
export function useExamTakingSession(docId: number, mode: 'full_exam' | 'practice') {
  const [document, setDocument] = useState<ExamDocument | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [parts, setParts] = useState<NormalizedParts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});

  const [timeLeft, setTimeLeft] = useState<number>(mode === 'full_exam' ? 4500 : 0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  const [isShowConfirmDialog, setIsShowConfirmDialog] = useState<boolean>(false);
  const [isShowResumeDialog, setIsShowResumeDialog] = useState<boolean>(false);
  const [pendingDraft, setPendingDraft] = useState<{
    answers: Record<number, string>;
    flags: Record<number, boolean>;
    timeLeft: number;
  } | null>(null);

  const [selectedAiQuestion, setSelectedAiQuestion] = useState<QuestionItem | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiExplanationData, setAiExplanationData] = useState<any | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [isShowResultModal, setIsShowResultModal] = useState<boolean>(false);

  const draftKey = `exam_draft_${docId}_${mode}`;

  const fetchExamData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/textbooks/exam/${docId}?mode=${mode}`);
      const data = await response.json();
      if (data.status === 'success') {
        setDocument(data.document);
        setQuestions(data.questions || []);
        if (data.parts) {
          setParts(data.parts);
        }

        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            const savedCount = Object.keys(parsed.answers || {}).length;
            if (savedCount > 0) {
              setPendingDraft(parsed);
              setIsShowResumeDialog(true);
            }
          } catch {
            localStorage.removeItem(draftKey);
          }
        }
      }
    } catch (error) {
      console.error('Error loading exam payload:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
  }, [docId]);

  const handleConfirmSubmit = async () => {
    setIsShowConfirmDialog(false);
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadAnswers: Record<string, string> = {};
      Object.entries(userAnswers).forEach(([questionId, answerLetter]) => {
        payloadAnswers[questionId] = answerLetter;
      });
      const timeSpent = mode === 'full_exam' ? 4500 - timeLeft : 0;
      const response = await fetch('/api/textbooks/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: docId,
          mode,
          time_spent_seconds: timeSpent,
          answers: payloadAnswers,
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        localStorage.removeItem(draftKey);
        setExamResult(data);
        setIsShowResultModal(true);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Lỗi nộp bài thi. Vui lòng kiểm tra lại server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (mode !== 'full_exam' || examResult || isLoading) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTimeLeft) => {
        if (previousTimeLeft <= 1) {
          clearInterval(timer);
          handleConfirmSubmit();

          return 0;
        }

        return previousTimeLeft - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, examResult, isLoading]);

  useEffect(() => {
    if (isLoading || examResult || questions.length === 0) {
      return;
    }

    const draft = {
      answers: userAnswers,
      flags: flaggedQuestions,
      timeLeft,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [userAnswers, flaggedQuestions, timeLeft, isLoading, examResult, questions.length]);

  const handleResumeDraft = () => {
    if (pendingDraft) {
      setUserAnswers(pendingDraft.answers || {});
      setFlaggedQuestions(pendingDraft.flags || {});
      if (mode === 'full_exam' && pendingDraft.timeLeft > 0) {
        setTimeLeft(pendingDraft.timeLeft);
      }
    }
    setIsShowResumeDialog(false);
    setPendingDraft(null);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(draftKey);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeLeft(mode === 'full_exam' ? 4500 : 0);
    setIsShowResumeDialog(false);
    setPendingDraft(null);
  };

  const handleSelectAnswer = (questionId: number, optionChar: string) => {
    setUserAnswers((previousAnswers) => ({ ...previousAnswers, [questionId]: optionChar }));
  };

  const handleToggleFlag = (questionId: number) => {
    setFlaggedQuestions((previousFlags) => ({
      ...previousFlags,
      [questionId]: !previousFlags[questionId],
    }));
  };

  const handleToggleExplanation = (questionId: number) => {
    setRevealedExplanations((previousExplanations) => ({
      ...previousExplanations,
      [questionId]: !previousExplanations[questionId],
    }));
  };

  const handleFetchAiExplanation = async (questionItem: QuestionItem) => {
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
          user_answer: userAnswers[questionItem.id] || null,
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
      console.error('Error fetching AI explanation:', error);
      setAiErrorMsg(
        'Không thể kết nối với server phân tích AI. Vui lòng kiểm tra lại kết nối mạng hoặc server backend.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRetake = () => {
    setExamResult(null);
    setIsShowResultModal(false);
    setUserAnswers({});
    setFlaggedQuestions({});
    setRevealedExplanations({});
    setTimeLeft(mode === 'full_exam' ? 4500 : 0);
  };

  return {
    document,
    questions,
    parts,
    isLoading,
    userAnswers,
    flaggedQuestions,
    revealedExplanations,
    timeLeft,
    isSubmitting,
    examResult,
    isShowConfirmDialog,
    isShowResumeDialog,
    pendingDraft,
    selectedAiQuestion,
    isAiLoading,
    aiExplanationData,
    aiErrorMsg,
    isShowResultModal,
    setIsShowConfirmDialog,
    setIsShowResultModal,
    setSelectedAiQuestion,
    handleConfirmSubmit,
    handleResumeDraft,
    handleStartFresh,
    handleSelectAnswer,
    handleToggleFlag,
    handleToggleExplanation,
    handleFetchAiExplanation,
    handleRetake,
  };
}
