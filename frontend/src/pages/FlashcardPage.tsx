import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Search, Filter, XCircle, 
  BookOpen, Keyboard, Layers, FolderHeart
} from 'lucide-react';
import { fetchVocabulary, fetchTopicAlbums } from '../api/vocabulary';
import type { VocabularyItem, TopicAlbum } from '../api/vocabulary';
import { useStudySessionTracker } from '../hooks/useStudySessionTracker';
import { FlashcardStudyCard } from '../components/FlashcardStudyCard';
import { FlashcardTypingView } from '../components/FlashcardTypingView';
import { FlashcardGridView } from '../components/FlashcardGridView';

/**
 * Spaced repetition (SRS) vocabulary practice page supporting Flip Card, Reverse Typing, and Album Grid study modes.
 */
export const FlashcardPage: React.FC = () => {
  // Track study session duration when practicing flashcards
  useStudySessionTracker('flashcard');

  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [topicAlbums, setTopicAlbums] = useState<TopicAlbum[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [partFilter, setPartFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Active View Mode: 'albums' | 'cards' | 'typing' | 'grid'
  const [viewMode, setViewMode] = useState<'albums' | 'cards' | 'typing' | 'grid'>('albums');

  // Flashcard Flip State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vocabRes, albumRes] = await Promise.all([
        fetchVocabulary({
          search: search || undefined,
          appears_in_part: partFilter || undefined,
          topic_category: selectedTopic || undefined,
          limit: 100
        }),
        fetchTopicAlbums()
      ]);

      setVocabList(vocabRes.items);
      setTopicAlbums(albumRes.albums);
      setCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error("Failed to load flashcard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, partFilter, selectedTopic]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % Math.max(1, vocabList.length));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + Math.max(1, vocabList.length)) % Math.max(1, vocabList.length));
  };

  const currentCard = vocabList[cardIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-theme-surface p-8 border border-theme shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-theme-accent/20 text-theme-accent border border-theme-accent/30 text-xs font-semibold">
              Module 3, 6, 8 & 11 — Album Từ Vựng Theo Chủ Đề & SRS
            </span>
            <h1 className="text-3xl font-extrabold text-theme-primary">Học Từ Vựng & Album Chủ Đề</h1>
            <p className="text-theme-secondary text-sm max-w-xl">
              Khám phá album từ vựng phân loại theo chủ đề ngữ pháp & tình huống thương mại TOEIC, lật thẻ Flashcard SRS và luyện gõ chính tả!
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1.5 bg-theme-surface-2 rounded-2xl border border-theme shadow-lg self-start sm:self-auto flex-wrap gap-1">
            <button
              onClick={() => setViewMode('albums')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'albums' ? 'bg-theme-accent text-white shadow-md' : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span>Album Chủ Đề</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'cards' ? 'bg-theme-accent text-white shadow-md' : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Flashcard SRS</span>
            </button>

            <button
              onClick={() => setViewMode('typing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'typing' ? 'bg-theme-accent text-white shadow-md' : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Luyện Gõ Từ</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'grid' ? 'bg-theme-accent text-white shadow-md' : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Tất Cả Từ ({vocabList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-theme-surface rounded-3xl p-6 border border-theme shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-theme-secondary absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
              className="w-full bg-theme-surface-2 border border-theme rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-theme-primary focus:border-theme-accent focus:outline-none placeholder:text-theme-secondary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-theme-secondary shrink-0" />
            <select
              value={partFilter}
              onChange={(event) => setPartFilter(event.target.value)}
              className="w-full bg-theme-surface-2 border border-theme rounded-xl px-3 py-2 text-xs font-medium text-theme-primary focus:border-theme-accent focus:outline-none"
            >
              <option value="">Tất cả các Part</option>
              <option value="Part 5">Part 5 — Ngữ pháp ngắn</option>
              <option value="Part 6">Part 6 — Điền đoạn văn</option>
              <option value="Part 7">Part 7 — Đọc hiểu thương mại</option>
              <option value="Part 1">Part 1-4 — Từ vựng Nghe</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-theme-surface-2 border border-theme rounded-xl px-3 py-2 text-xs">
            <span className="text-theme-secondary font-medium">Album lọc:</span>
            {selectedTopic ? (
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-2 py-0.5 rounded-lg bg-theme-accent/20 text-theme-accent font-bold hover:bg-theme-accent/30 transition capitalize flex items-center gap-1"
              >
                <span>{selectedTopic}</span>
                <XCircle className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-theme-primary font-bold">Tất cả Album</span>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: ALBUMS */}
      {viewMode === 'albums' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-theme-primary flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-theme-accent" />
            Bộ Album Từ Vựng Phân Loại Theo Chủ Đề ({topicAlbums.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topicAlbums.map((album, index) => {
              const isSelected = selectedTopic === album.topic_category;

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedTopic(album.topic_category);
                    setViewMode('cards');
                  }}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 shadow-lg ${
                    isSelected
                      ? 'bg-theme-accent/15 border-theme-accent shadow-theme-accent/10'
                      : 'bg-theme-surface border-theme hover:border-theme-accent hover:bg-theme-surface-2'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-theme-accent/20 border border-theme-accent/30 text-theme-accent">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-theme-surface-2 text-theme-primary font-mono text-xs font-bold border border-theme">
                      {album.total_words} từ vựng
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-theme-primary capitalize">
                      {album.topic_category}
                    </h3>
                    <p className="text-xs text-theme-secondary">
                      Bao gồm từ vựng chuyên ngành và các ví dụ câu TOEIC thực tế.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-theme flex items-center justify-between text-xs text-theme-accent font-bold">
                    <span>Mở Flashcard Album &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FLASHCARD SRS CARDS */}
      {viewMode === 'cards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <FlashcardStudyCard
            currentCard={currentCard}
            cardIndex={cardIndex}
            totalCards={vocabList.length}
            isFlipped={isFlipped}
            isLoading={isLoading}
            onFlip={() => setIsFlipped(!isFlipped)}
            onPrev={handlePrevCard}
            onNext={handleNextCard}
          />
        </div>
      )}

      {/* VIEW MODE 3: TYPING PRACTICE */}
      {viewMode === 'typing' && (
        <FlashcardTypingView
          currentCard={currentCard}
          cardIndex={cardIndex}
          totalCards={vocabList.length}
          onNext={handleNextCard}
        />
      )}

      {/* VIEW MODE 4: GRID LIST */}
      {viewMode === 'grid' && (
        <FlashcardGridView vocabList={vocabList} />
      )}
    </div>
  );
};
