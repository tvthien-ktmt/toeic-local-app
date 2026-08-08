import React, { useState, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { 
  Sparkles, Volume2, Search, Filter, RotateCw, XCircle, 
  BookOpen, Keyboard, Layers, FolderHeart
} from 'lucide-react';
import { fetchVocabulary, fetchTopicAlbums } from '../api/vocabulary';
import type { VocabularyItem, TopicAlbum } from '../api/vocabulary';
import { speakText } from '../utils/tts';
import { useStudySessionTracker } from '../hooks/useStudySessionTracker';

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

  // Typing Practice State
  const [typingInput, setTypingInput] = useState('');
  const [typingStatus, setTypingStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

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

  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const handleCheckTyping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard) return;

    const isMatch = typingInput.trim().toLowerCase() === currentCard.word.toLowerCase();
    if (isMatch) {
      setTypingStatus('correct');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setTypingInput('');
        setTypingStatus('idle');
        handleNextCard();
      }, 1200);
    } else {
      setTypingStatus('incorrect');
    }
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
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-theme-secondary absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
              className="w-full bg-theme-surface-2 border border-theme rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-theme-primary focus:border-theme-accent focus:outline-none placeholder:text-theme-secondary"
            />
          </div>

          {/* Part Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-theme-secondary shrink-0" />
            <select
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value)}
              className="w-full bg-theme-surface-2 border border-theme rounded-xl px-3 py-2 text-xs font-medium text-theme-primary focus:border-theme-accent focus:outline-none"
            >
              <option value="">Tất cả các Part</option>
              <option value="Part 5">Part 5 — Ngữ pháp ngắn</option>
              <option value="Part 6">Part 6 — Điền đoạn văn</option>
              <option value="Part 7">Part 7 — Đọc hiểu thương mại</option>
              <option value="Part 1">Part 1-4 — Từ vựng Nghe</option>
            </select>
          </div>

          {/* Active Album Filter Badge */}
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
            {topicAlbums.map((album, idx) => {
              const isSelected = selectedTopic === album.topic_category;
              return (
                <div
                  key={idx}
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
          {isLoading ? (
            <div className="py-20 text-center text-theme-secondary space-y-2">
              <RotateCw className="w-8 h-8 animate-spin mx-auto text-theme-accent" />
              <p className="text-sm">Đang tải thẻ Flashcard...</p>
            </div>
          ) : !currentCard ? (
            <div className="p-16 text-center rounded-3xl bg-theme-surface border border-dashed border-theme space-y-3">
              <Sparkles className="w-12 h-12 mx-auto text-theme-secondary" />
              <p className="text-theme-primary font-bold text-base">Chưa có từ vựng nào trong danh sách</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[340px] p-8 sm:p-10 rounded-3xl bg-theme-surface border border-theme shadow-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-theme-accent relative overflow-hidden select-none"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-theme-surface-2 text-theme-secondary text-xs font-mono font-bold border border-theme">
                    Thẻ {cardIndex + 1} / {vocabList.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentCard.word);
                    }}
                    className="p-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-accent border border-theme transition"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Flip Content */}
                <div className="py-8 text-center space-y-4">
                  {!isFlipped ? (
                    <div className="space-y-3 animate-in fade-in">
                      <h2 className="text-4xl sm:text-5xl font-extrabold text-theme-accent tracking-wide select-text">
                        {currentCard.word}
                      </h2>
                      <p className="text-sm font-mono text-theme-secondary">
                        {currentCard.ipa} • {currentCard.part_of_speech}
                      </p>
                      <span className="text-xs text-theme-secondary block italic pt-4">
                        (Bấm để lật xem nghĩa & câu ví dụ)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-theme-success select-text">
                        {currentCard.meaning_vi}
                      </h3>
                      {currentCard.example_sentence && (
                        <p className="text-sm text-theme-primary italic max-w-md mx-auto leading-relaxed border-t border-theme pt-3 select-text">
                          "{currentCard.example_sentence}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Tag */}
                <div className="flex items-center justify-between text-xs text-theme-secondary border-t border-theme pt-3">
                  <span className="capitalize font-semibold text-theme-accent">Album: {currentCard.topic_category}</span>
                  <span>{currentCard.appears_in_part || 'TOEIC Overall'}</span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevCard}
                  className="flex-1 py-3 rounded-2xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-xs font-bold transition shadow-lg"
                >
                  &larr; Thẻ trước
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-6 py-3 rounded-2xl bg-theme-accent text-white font-bold text-xs shadow-lg transition"
                >
                  {isFlipped ? 'Xem từ gốc' : 'Lật thẻ'}
                </button>

                <button
                  onClick={handleNextCard}
                  className="flex-1 py-3 rounded-2xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-xs font-bold transition shadow-lg"
                >
                  Thẻ tiếp &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: TYPING PRACTICE */}
      {viewMode === 'typing' && (
        <div className="max-w-xl mx-auto space-y-6">
          {!currentCard ? (
            <div className="p-16 text-center rounded-3xl bg-theme-surface border border-dashed border-theme space-y-3">
              <Keyboard className="w-12 h-12 mx-auto text-theme-secondary" />
              <p className="text-theme-primary font-bold text-base">Chưa có từ vựng để luyện gõ</p>
            </div>
          ) : (
            <div className="bg-theme-surface rounded-3xl p-8 border border-theme shadow-2xl space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-theme-secondary">
                <span>Luyện gõ {cardIndex + 1} / {vocabList.length}</span>
                <button onClick={() => speakText(currentCard.word)} className="p-1.5 rounded-lg bg-theme-surface-2 text-theme-accent">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-2 py-4">
                <span className="text-xs text-theme-secondary uppercase font-bold tracking-wider">Gõ chính xác từ tiếng Anh cho nghĩa:</span>
                <h3 className="text-2xl font-extrabold text-theme-success">{currentCard.meaning_vi}</h3>
                <p className="text-xs text-theme-secondary italic font-mono">{currentCard.part_of_speech} • {currentCard.ipa}</p>
              </div>

              <form onSubmit={handleCheckTyping} className="space-y-4">
                <input
                  type="text"
                  value={typingInput}
                  onChange={(e) => setTypingInput(e.target.value)}
                  placeholder="Gõ từ tiếng Anh vào đây..."
                  autoFocus
                  className={`w-full p-4 rounded-2xl bg-theme-surface-2 border text-center font-bold text-lg text-theme-primary focus:outline-none transition ${
                    typingStatus === 'correct'
                      ? 'border-theme-success alert-success font-bold'
                      : typingStatus === 'incorrect'
                      ? 'border-theme-error alert-error font-bold'
                      : 'border-theme focus:border-theme-accent'
                  }`}
                />

                {typingStatus === 'incorrect' && (
                  <p className="text-xs font-bold text-theme-error text-center animate-bounce">
                    Chưa chính xác! Đáp án đúng: <span className="font-mono underline">{currentCard.word}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-theme-accent text-white font-bold text-sm shadow-lg transition"
                >
                  Kiểm tra kết quả
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 4: GRID LIST */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-theme-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-theme-accent" />
            Tất Cả Từ Vựng Trích Xuất ({vocabList.length})
          </h2>

          {vocabList.length > 100 ? (
            <List
              height={650}
              itemCount={vocabList.length}
              itemSize={160}
              width="100%"
            >
              {({ index, style }: { index: number; style: React.CSSProperties }) => {
                const v = vocabList[index];
                return (
                  <div style={style} className="pr-2 pb-3">
                    <div className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-2 shadow-lg h-full">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-theme-accent">{v.word}</span>
                        <button onClick={() => speakText(v.word)} className="p-1 text-theme-secondary hover:text-theme-accent transition">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-theme-secondary font-mono">{v.ipa} • {v.part_of_speech}</p>
                      <p className="text-sm font-semibold text-theme-success">{v.meaning_vi}</p>
                      {v.example_sentence && (
                        <p className="text-xs text-theme-primary italic border-l-2 border-theme-accent pl-2 truncate">"{v.example_sentence}"</p>
                      )}
                    </div>
                  </div>
                );
              }}
            </List>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabList.map((v) => (
                <div key={v.id} className="p-5 rounded-2xl bg-theme-surface border border-theme space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-theme-accent">{v.word}</span>
                    <button onClick={() => speakText(v.word)} className="p-1 text-theme-secondary hover:text-theme-accent transition">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-theme-secondary font-mono">{v.ipa} • {v.part_of_speech}</p>
                  <p className="text-sm font-semibold text-theme-success">{v.meaning_vi}</p>
                  {v.example_sentence && (
                    <p className="text-xs text-theme-primary italic border-l-2 border-theme-accent pl-2">"{v.example_sentence}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
