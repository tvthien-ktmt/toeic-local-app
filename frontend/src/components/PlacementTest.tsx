import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

interface PlacementQuestion {
  question_id: number;
  topic_id: number;
  topic_name: string;
  topic_level: string;
  part: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
}

interface PlacementTestResult {
  overall_score?: number;
  strong_topics?: string[];
  weak_topics?: string[];
}

interface PlacementTestProps {
  onComplete: () => void;
}

const API_BASE = '';

/**
 * Quick 15-question diagnostic placement test evaluating baseline grammar proficiency and recommending starting roadmap level.
 */
export const PlacementTest: React.FC<PlacementTestProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<PlacementTestResult | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/curriculum/placement-test/start`, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSelect = (questionId: number, optionLetter: string) => {
    if (!isSubmitted) {
      setAnswers((previousAnswers) => ({ ...previousAnswers, [questionId]: optionLetter }));
    }
  };

  const handleSubmit = async () => {
    const questionTopicMap: Record<number, number> = {};
    questions.forEach((questionItem) => {
      questionTopicMap[questionItem.question_id] = questionItem.topic_id;
    });

    const response = await fetch(`${API_BASE}/api/curriculum/placement-test/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, question_topic_map: questionTopicMap }),
    });
    const data = await response.json();
    setResult(data);
    setIsSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-theme-secondary">
        Đang tải bài chẩn đoán...
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-extrabold text-theme-success mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 alert-success-icon" />
          <span>Chẩn đoán hoàn thành!</span>
        </h2>
        <div className="bg-theme-surface rounded-2xl p-6 mb-6 border border-theme shadow-xl">
          <p className="text-lg text-theme-primary mb-3">
            Điểm tổng: <strong className="text-theme-success">{result.overall_score || 0}%</strong>
          </p>
          <div className="flex gap-4 mb-4">
            <span className="text-sm text-theme-secondary">
              Mạnh: <strong className="text-theme-success">{result.strong_topics?.length || 0}</strong>
            </span>
            <span className="text-sm text-theme-secondary">
              Yếu: <strong className="text-theme-error">{result.weak_topics?.length || 0}</strong>
            </span>
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-theme-accent hover:bg-theme-accent-hover text-white py-3 rounded-xl font-bold transition shadow cursor-pointer"
          >
            Xem lộ trình cá nhân hóa &rarr;
          </button>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-theme-primary mb-1 flex items-center gap-2">
          <Target className="w-6 h-6 text-theme-accent" />
          <span>Bài Chẩn Đoán Đầu Vào (Diagnostic Test)</span>
        </h2>
        <p className="text-theme-secondary text-sm">
          {questions.length} câu hỏi quét toàn bộ ngữ pháp TOEIC. Hệ thống sẽ phát hiện ngay điểm mạnh / yếu của bạn.
        </p>
        <div className="mt-3 bg-theme-surface-2 rounded-full h-2 overflow-hidden border border-theme">
          <div
            className="bg-theme-accent h-full transition-all duration-300"
            style={{ width: `${(answered / Math.max(1, questions.length)) * 100}%` }}
          />
        </div>
        <span className="text-xs text-theme-secondary mt-1 block">
          Đã làm {answered}/{questions.length} câu
        </span>
      </div>

      {questions.map((questionItem, index) => (
        <div
          key={questionItem.question_id}
          className={`bg-theme-surface rounded-2xl p-5 mb-4 border ${
            answers[questionItem.question_id] ? 'border-theme-accent' : 'border-theme'
          } shadow-md`}
        >
          <div className="flex justify-between mb-2">
            <span className="text-xs text-theme-secondary font-medium">
              Q{index + 1} · Part {questionItem.part} · {questionItem.topic_name.substring(0, 30)}
            </span>
          </div>
          <p className="text-base text-theme-primary mb-4 leading-relaxed font-medium">
            {questionItem.question_text}
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(questionItem.options).map(([opt, text]) => {
              const isSelected = answers[questionItem.question_id] === opt;

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(questionItem.question_id, opt)}
                  className={`text-left p-3 rounded-xl text-sm transition-all border cursor-pointer ${
                    isSelected
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-semibold shadow'
                      : 'border-theme bg-theme-surface-2 text-theme-primary hover:border-theme-accent/50'
                  }`}
                >
                  <strong>({opt})</strong> {text as string}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={answered < Math.ceil(questions.length * 0.7)}
        className={`mt-4 w-full py-3.5 rounded-xl text-base font-bold transition shadow-lg ${
          answered >= Math.ceil(questions.length * 0.7)
            ? 'bg-theme-accent hover:bg-theme-accent-hover text-white cursor-pointer'
            : 'bg-theme-surface-2 text-theme-secondary border border-theme cursor-not-allowed'
        }`}
      >
        {answered < Math.ceil(questions.length * 0.7)
          ? `Cần trả lời thêm ${Math.ceil(questions.length * 0.7) - answered} câu`
          : 'Nộp Bài Chẩn Đoán'}
      </button>
    </div>
  );
};
