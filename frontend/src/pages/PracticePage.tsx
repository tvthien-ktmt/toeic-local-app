import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';
import { fetchQuestions, fetchTopicsSummary, generateSimilarQuestion } from '../api/questions';
import type { QuestionItem } from '../api/questions';
import { GrammarQuickRefModal } from '../components/GrammarQuickRefModal';
import { TextHighlightPopup } from '../components/TextHighlightPopup';
import { PracticeFilterSection } from '../components/PracticeFilterSection';
import { PracticeQuestionCard } from '../components/PracticeQuestionCard';
import { PracticeMockSummaryBanner } from '../components/PracticeMockSummaryBanner';
import { Part7EvidenceCard } from '../components/Part7EvidenceCard';
import { Part6TrainingModes, type Part6DisplayMode } from '../components/Part6TrainingModes';
import { CoverageMatrixSection } from '../components/CoverageMatrixSection';
import { PracticeHeaderSection } from '../components/PracticeHeaderSection';
import { useStudySessionTracker } from '../hooks/useStudySessionTracker';
import axios from 'axios';

/**
 * Targeted practice questions page with filter tabs (Part 5/6/7, grammar topics), AI similar question generator, Part 7 Evidence mode, and Part 6 Context training.
 */
export const PracticePage: React.FC = () => {
  useStudySessionTracker('practice');

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [grammarTopics, setGrammarTopics] = useState<{ topic: string; count: number }[]>([]);
  const [topicTags, setTopicTags] = useState<{ tag: string; count: number }[]>([]);

  const [selectedPart, setSelectedPart] = useState<number | undefined>(undefined);
  const [selectedGrammar, setSelectedGrammar] = useState<string>('');
  const [selectedTopicTag, setSelectedTopicTag] = useState<string>('');
  const [part6Mode, setPart6Mode] = useState<Part6DisplayMode>('full_text');
  const [isShowCoverageMatrix, setIsShowCoverageMatrix] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const [practiceMode, setPracticeMode] = useState<'part_practice' | 'full_mock'>('part_practice');
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(true);
  const [isMockSubmitted, setIsMockSubmitted] = useState<boolean>(false);
  const [mockStartTime, setMockStartTime] = useState<number>(0);

  const questionStartTimeRef = useRef<Record<number, number>>({});
  const [activeGrammarTopic, setActiveGrammarTopic] = useState<string | null>(null);

  const handleGenerateSimilar = async (origQuestionId: number) => {
    setGeneratingId(origQuestionId);
    try {
      const newQ = await generateSimilarQuestion(origQuestionId);
      setQuestions((prev) => [newQ, ...prev]);
    } catch (err) {
      alert('Lỗi khi sinh câu hỏi tương tự.');
    } finally {
      setGeneratingId(null);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const questionResponse = await fetchQuestions({
        part: practiceMode === 'full_mock' ? undefined : selectedPart,
        grammar_topic: selectedGrammar || undefined,
        topic_tag: selectedTopicTag || undefined,
        limit: practiceMode === 'full_mock' ? 100 : 50,
      });
      setQuestions(questionResponse.items);

      const now = Date.now();
      const initTimes: Record<number, number> = {};
      questionResponse.items.forEach((questionItem) => {
        initTimes[questionItem.id] = now;
      });
      questionStartTimeRef.current = initTimes;

      const summaryResponse = await fetchTopicsSummary();
      setGrammarTopics(summaryResponse.grammar_topics);
      setTopicTags(summaryResponse.topic_tags);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setUserAnswers({});
    setScore({ correct: 0, total: 0 });
    setIsMockSubmitted(false);
    if (practiceMode === 'full_mock') {
      setMockStartTime(Date.now());
    }
  }, [selectedPart, selectedGrammar, selectedTopicTag, practiceMode]);

  const handleSelectOption = (questionItem: QuestionItem, optionLetter: string) => {
    if (userAnswers[questionItem.id] && practiceMode === 'part_practice') {
      return;
    }

    const now = Date.now();
    const startTime = questionStartTimeRef.current[questionItem.id] || now;
    const timeSpentSec = Math.round((now - startTime) / 1000);

    setUserAnswers((previousAnswers) => ({ ...previousAnswers, [questionItem.id]: optionLetter }));

    const isCorrect =
      questionItem.correct_answer &&
      optionLetter.toUpperCase() === questionItem.correct_answer.toUpperCase();

    if (practiceMode === 'part_practice') {
      if (isCorrect) {
        setScore((previousScore) => ({
          ...previousScore,
          correct: previousScore.correct + 1,
          total: previousScore.total + 1,
        }));
      } else {
        setScore((previousScore) => ({ ...previousScore, total: previousScore.total + 1 }));
      }
    }

    axios
      .post('/api/questions/attempt', {
        question_id: questionItem.id,
        is_correct: isCorrect,
        time_spent_seconds: timeSpentSec,
        part: questionItem.part,
      })
      .catch((error) => console.error('Failed to record attempt:', error));
  };

  const handleFinishMockTest = () => {
    const end = Date.now();
    setIsMockSubmitted(true);

    let correctCount = 0;
    questions.forEach((questionItem) => {
      const userChoice = userAnswers[questionItem.id];
      if (
        userChoice &&
        questionItem.correct_answer &&
        userChoice.toUpperCase() === questionItem.correct_answer.toUpperCase()
      ) {
        correctCount += 1;
      }
    });

    setScore({ correct: correctCount, total: questions.length });

    const totalDurationSec = Math.round((end - mockStartTime) / 1000);
    axios
      .post('/api/dashboard/study-session', {
        session_type: 'practice',
        duration_seconds: totalDurationSec,
      })
      .catch((error) => console.error('Failed to record study session:', error));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 relative">
      <TextHighlightPopup />

      <GrammarQuickRefModal
        topicName={activeGrammarTopic}
        onClose={() => setActiveGrammarTopic(null)}
      />

      {/* Header Banner */}
      <PracticeHeaderSection
        practiceMode={practiceMode}
        score={score}
        isMockSubmitted={isMockSubmitted}
        isShowCoverageMatrix={isShowCoverageMatrix}
        isGuidedMode={isGuidedMode}
        onToggleGuidedMode={() => setIsGuidedMode(!isGuidedMode)}
        onToggleCoverageMatrix={() => setIsShowCoverageMatrix(!isShowCoverageMatrix)}
        onChangePracticeMode={setPracticeMode}
        onFinishMockTest={handleFinishMockTest}
      />

      {/* Coverage Matrix Panel (Toggleable) */}
      {isShowCoverageMatrix && (
        <CoverageMatrixSection />
      )}

      {practiceMode === 'part_practice' && (
        <PracticeFilterSection
          selectedPart={selectedPart}
          selectedGrammar={selectedGrammar}
          selectedTopicTag={selectedTopicTag}
          grammarTopics={grammarTopics}
          topicTags={topicTags}
          onSelectPart={setSelectedPart}
          onSelectGrammar={setSelectedGrammar}
          onSelectTopicTag={setSelectedTopicTag}
        />
      )}

      {/* Part 6 Mode Selector when Part 6 is filtered */}
      {practiceMode === 'part_practice' && selectedPart === 6 && (
        <Part6TrainingModes
          activeMode={part6Mode}
          onChangeMode={setPart6Mode}
        />
      )}

      {practiceMode === 'full_mock' && isMockSubmitted && (
        <PracticeMockSummaryBanner
          score={score}
          questions={questions}
          userAnswers={userAnswers}
        />
      )}

      {isLoading ? (
        <div className="py-20 text-center space-y-2 text-theme-secondary">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-theme-accent" />
          <p className="text-sm font-medium">Đang tải câu hỏi luyện tập...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-theme-surface border border-dashed border-theme space-y-3">
          <HelpCircle className="w-12 h-12 mx-auto text-theme-secondary" />
          <p className="text-theme-primary font-medium text-base">Chưa có câu hỏi nào khớp bộ lọc này</p>
          <p className="text-xs text-theme-secondary">
            Hãy upload tài liệu đề thi PDF ở trang "Tài liệu & Upload" hoặc chọn bộ đề cố định!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((questionItem, index) => {
            if (questionItem.part === 7 && practiceMode === 'part_practice') {
              return (
                <Part7EvidenceCard
                  key={questionItem.id}
                  questionItem={questionItem}
                  index={index}
                  userChoice={userAnswers[questionItem.id]}
                  onSelectOption={handleSelectOption}
                  onOpenGrammarModal={setActiveGrammarTopic}
                />
              );
            }

            return (
              <PracticeQuestionCard
                key={questionItem.id}
                questionItem={questionItem}
                index={index}
                userChoice={userAnswers[questionItem.id]}
                practiceMode={practiceMode}
                isMockSubmitted={isMockSubmitted}
                isGuidedMode={isGuidedMode}
                generatingId={generatingId}
                onSelectOption={handleSelectOption}
                onOpenGrammarModal={setActiveGrammarTopic}
                onGenerateSimilar={handleGenerateSimilar}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
