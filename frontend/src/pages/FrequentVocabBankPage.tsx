import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Volume2,
  Plus,
  Check,
  BookMarked,
  ArrowRightLeft,
} from 'lucide-react';
import { FREQUENT_HIGH_YIELD_VOCABULARY } from '../data/frequentVocabData';
import type { FrequentVocabItem } from '../data/frequentVocabData';
import type { VocabularyItem } from '../api/vocabulary';

interface FrequentVocabBankPageProps {
  onSaveFlashcard?: (item: VocabularyItem) => void;
  onNavigateFlashcards?: () => void;
}

/**
 * Frequent High-Yield TOEIC Vocabulary Bank (600+ Top Exam Words).
 * Features frequency level indicators, collocations, real test examples, and 1-click Flashcard SRS saving.
 */
export const FrequentVocabBankPage: React.FC<FrequentVocabBankPageProps> = ({
  onSaveFlashcard,
  onNavigateFlashcards,
}) => {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedWordIds, setSavedWordIds] = useState<Record<string, boolean>>({});

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveToFlashcard = (item: FrequentVocabItem) => {
    if (onSaveFlashcard) {
      const vocabObject: VocabularyItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        word: item.word,
        ipa: item.ipa,
        part_of_speech: item.partOfSpeech,
        meaning_vi: item.meaningVi,
        example_sentence: item.exampleSentenceEn,
        source_document_id: null,
        appears_in_part: item.appearsInParts.join(', '),
        topic_category: item.topicCategory,
        frequency_count: item.frequencyScore,
        srs_level: 1,
        next_review_at: new Date().toISOString(),
        in_flashcard: true,
      };
      onSaveFlashcard(vocabObject);
    }
    setSavedWordIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const filteredWords = FREQUENT_HIGH_YIELD_VOCABULARY.filter((item) => {
    if (selectedLevelFilter !== 'ALL' && item.frequencyLevel !== selectedLevelFilter) {
      return false;
    }
    if (selectedTopic !== 'ALL' && item.topicCategory !== selectedTopic) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchWord = item.word.toLowerCase().includes(q);
      const matchMeaning = item.meaningVi.toLowerCase().includes(q);

      return matchWord || matchMeaning;
    }

    return true;
  });

  const allTopics = Array.from(
    new Set(FREQUENT_HIGH_YIELD_VOCABULARY.map((item) => item.topicCategory))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-theme-primary">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-theme/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/15 text-theme-accent text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Từ Vựng Tần Suất Cao Trong Đề Thi Thật (Frequent High-Yield Vocab)</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Từ Vựng Xuất Hiện Nhiều Nhất Trong Đề Thi TOEIC (LC &amp; RC)
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Được thống kê từ 157 bài test LC và kho tài liệu RC. Nắm chắc nhóm từ này giúp bạn hiểu 90% nội dung bài thi.
          </p>
        </div>

        {/* Quick Flashcard Review Link */}
        {onNavigateFlashcards && (
          <button
            type="button"
            onClick={onNavigateFlashcards}
            className="px-5 py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all"
          >
            <BookMarked className="w-4 h-4" />
            <span>Mở Kho Flashcard (SRS)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-theme-surface border border-theme shadow-2xs space-y-3.5">
        {/* Frequency Levels */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-theme-secondary shrink-0 mr-1">Tần suất:</span>
          {[
            { id: 'ALL', label: 'Tất Cả Mức Độ' },
            { id: 'LEVEL_1_ULTRA', label: '🔥 Level 1 (Cực Cao 90%+)', isFlame: true },
            { id: 'LEVEL_2_HIGH', label: '⭐ Level 2 (Cao 75%+)' },
            { id: 'LEVEL_3_FREQUENT', label: '📌 Level 3 (Thường Gặp 50%+)' },
          ].map((levelOption) => (
            <button
              key={levelOption.id}
              type="button"
              onClick={() => setSelectedLevelFilter(levelOption.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedLevelFilter === levelOption.id
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
              }`}
            >
              {levelOption.label}
            </button>
          ))}
        </div>

        {/* Search & Topic Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-theme/40">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-theme-secondary">Chủ đề:</span>
            <select
              value={selectedTopic}
              onChange={(event) => setSelectedTopic(event.target.value)}
              className="px-3 py-1.5 rounded-xl bg-theme-surface-2 text-theme-primary border border-theme text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả chủ đề thương mại</option>
              {allTopics.map((topicName) => (
                <option key={topicName} value={topicName}>
                  {topicName}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-theme-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm từ vựng tiếng Anh hoặc nghĩa..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-theme-surface-2 border border-theme text-xs text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-1 focus:ring-theme-accent"
            />
          </div>
        </div>
      </div>

      {/* Vocabulary Cards Grid or Empty Updating State */}
      {filteredWords.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-surface border border-theme max-w-xl mx-auto space-y-4 shadow-xs animate-fade-in my-8">
          <div className="w-16 h-16 rounded-3xl bg-theme-accent/15 text-theme-accent flex items-center justify-center mx-auto shadow-inner">
            <BookMarked className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-theme-warning/15 text-theme-warning border border-theme-warning/30">
              Dữ Liệu Đang Được Cập Nhật
            </span>
            <h3 className="text-xl font-extrabold text-theme-primary">
              Kho Từ Vựng Tần Suất Cao
            </h3>
            <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed max-w-md mx-auto">
              Dữ liệu từ vựng tần suất cao đang chờ bạn cập nhật từ các bộ đề thi thật. Giao diện và hệ thống Flashcard SRS đã sẵn sàng tiếp nhận!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => {
            const isSaved = Boolean(savedWordIds[item.id]);

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-theme-surface border border-theme shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-theme-accent/50 transition-all group"
              >
                <div className="space-y-2">
                  {/* Header: Word + IPA + Audio */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-black text-theme-primary tracking-tight group-hover:text-theme-accent transition-colors">
                          {item.word}
                        </h3>
                        <span className="text-xs font-mono text-theme-secondary">
                          {item.ipa}
                        </span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-theme-surface-2 border border-theme text-theme-secondary uppercase mt-1">
                        {item.partOfSpeech}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpeak(item.word)}
                      aria-label={`Phát âm từ ${item.word}`}
                      className="p-2 rounded-xl bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meaning */}
                  <p className="text-xs font-bold text-theme-primary leading-snug">
                    {item.meaningVi}
                  </p>

                  {/* Collocations & Parts */}
                  {item.collocations.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-theme-surface-2 border border-theme/60 space-y-1">
                      <span className="text-[10px] font-extrabold text-theme-secondary uppercase tracking-wider block">
                        Cụm từ đi kèm (Collocations):
                      </span>
                      <p className="text-xs text-theme-primary font-medium leading-relaxed">
                        {item.collocations.join(' • ')}
                      </p>
                    </div>
                  )}

                  {/* Paraphrase synonyms */}
                  {item.paraphrasePairs.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-theme-secondary">
                      <ArrowRightLeft className="w-3 h-3 text-theme-accent" />
                      <span>Đồng nghĩa: <strong className="text-theme-primary">{item.paraphrasePairs[0].synonym}</strong></span>
                    </div>
                  )}

                  {/* Real exam example */}
                  <div className="text-[11px] text-theme-secondary italic border-l-2 border-theme-accent/50 pl-2.5 pt-0.5">
                    &ldquo;{item.exampleSentenceEn}&rdquo;
                  </div>
                </div>

                {/* Action Button: Save to Flashcard */}
                <div className="pt-2 border-t border-theme/40 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-theme-secondary">
                    Tần suất: {item.frequencyScore}/100
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSaveToFlashcard(item)}
                    disabled={isSaved}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-theme-success/20 text-theme-success border border-theme-success/30'
                        : 'bg-theme-accent text-white shadow-xs hover:brightness-110'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Lưu</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Vào Flashcard</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
