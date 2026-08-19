import React from 'react';
import { Filter } from 'lucide-react';

interface GrammarTopicOption {
  topic: string;
  count: number;
}

interface TopicTagOption {
  tag: string;
  count: number;
}

interface PracticeFilterSectionProps {
  selectedPart: number | undefined;
  selectedGrammar: string;
  selectedTopicTag: string;
  grammarTopics: GrammarTopicOption[];
  topicTags: TopicTagOption[];
  onSelectPart: (part: number | undefined) => void;
  onSelectGrammar: (grammar: string) => void;
  onSelectTopicTag: (tag: string) => void;
}

/**
 * Filter bar component for practice questions selecting Part 5/6/7, grammar topics, or passage content tags.
 */
export const PracticeFilterSection: React.FC<PracticeFilterSectionProps> = ({
  selectedPart,
  selectedGrammar,
  selectedTopicTag,
  grammarTopics,
  topicTags,
  onSelectPart,
  onSelectGrammar,
  onSelectTopicTag,
}) => {
  return (
    <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-theme-primary font-bold text-sm">
          <Filter className="w-4 h-4 text-theme-accent" />
          <span>Bộ Lọc Bài Luyện</span>
        </div>
        <div className="text-xs text-theme-secondary hidden sm:block">
          Mục tiêu tốc độ: Part 5 (20s/câu) • Part 6 (37s/câu) • Part 7 (60s/câu)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-theme-secondary font-semibold mb-1.5 block">
            Phần thi (Part)
          </label>
          <select
            value={selectedPart || ''}
            onChange={(changeEvent) =>
              onSelectPart(changeEvent.target.value ? Number(changeEvent.target.value) : undefined)
            }
            className="w-full bg-theme-surface-2 border border-theme rounded-xl px-3 py-2 text-xs font-medium text-theme-primary focus:border-theme-accent focus:outline-none"
          >
            <option value="">Tất cả các Part (5, 6, 7)</option>
            <option value="5">Part 5 — Điền câu ngắn (Mục tiêu 10-11 phút)</option>
            <option value="6">Part 6 — Điền đoạn văn (Mục tiêu 10 phút)</option>
            <option value="7">Part 7 — Đọc hiểu văn bản (Mục tiêu 54 phút)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-theme-secondary font-semibold mb-1.5 block">
            Chủ điểm ngữ pháp (Part 5)
          </label>
          <select
            value={selectedGrammar}
            onChange={(changeEvent) => onSelectGrammar(changeEvent.target.value)}
            className="w-full bg-theme-surface-2 border border-theme rounded-xl px-3 py-2 text-xs font-medium text-theme-primary focus:border-theme-accent focus:outline-none"
          >
            <option value="">Tất cả chủ điểm ngữ pháp</option>
            {grammarTopics.map((grammarTopicItem, index) => (
              <option key={index} value={grammarTopicItem.topic}>
                {grammarTopicItem.topic} ({grammarTopicItem.count} câu)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-theme-secondary font-semibold mb-1.5 block">
            Chủ đề văn bản (Part 6/7)
          </label>
          <select
            value={selectedTopicTag}
            onChange={(changeEvent) => onSelectTopicTag(changeEvent.target.value)}
            className="w-full bg-theme-surface-2 border border-theme rounded-xl px-3 py-2 text-xs font-medium text-theme-primary focus:border-theme-accent focus:outline-none"
          >
            <option value="">Tất cả chủ đề văn bản</option>
            {topicTags.map((topicTagItem, index) => (
              <option key={index} value={topicTagItem.tag}>
                {topicTagItem.tag} ({topicTagItem.count} bài)
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
