import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Volume2, Search, Filter, RotateCw, CheckCircle2, XCircle, 
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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, partFilter, selectedTopic]);

  const currentVocab = vocabList[cardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setTypingInput('');
    setTypingStatus('idle');
    if (cardIndex < vocabList.length - 1) {
      setCardIndex(prev => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  const handleCheckTyping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVocab) return;

    const userWord = typingInput.trim().toLowerCase();
    const correctWord = currentVocab.word.trim().toLowerCase();

    if (userWord === correctWord) {
      setTypingStatus('correct');
      speakText(currentVocab.word);
    } else {
      setTypingStatus('incorrect');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/60 to-indigo-950/40 p-8 border border-purple-500/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              Module 3, 6, 8 & 11 — Album Từ Vựng Theo Chủ Đề & SRS
            </span>
            <h1 className="text-3xl font-extrabold text-white">Học Từ Vựng & Album Chủ Đề</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Khám phá album từ vựng phân loại theo chủ đề ngữ pháp & tình huống thương mại TOEIC, lật thẻ Flashcard SRS và luyện gõ chính tả!
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg self-start sm:self-auto flex-wrap gap-1">
            <button
              onClick={() => setViewMode('albums')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'albums' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span>Album Chủ Đề</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'cards' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Flashcard SRS</span>
            </button>

            <button
              onClick={() => setViewMode('typing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'typing' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Luyện Gõ Từ</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'grid' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Tất Cả Từ ({vocabList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-200 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Part Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Tất cả các Part</option>
              <option value="Part 5">Part 5 — Ngữ pháp ngắn</option>
              <option value="Part 6">Part 6 — Điền đoạn văn</option>
              <option value="Part 7">Part 7 — Đọc hiểu thương mại</option>
              <option value="Part 1">Part 1-4 — Từ vựng Nghe</option>
            </select>
          </div>

          {/* Topic Album Filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTopic || ''}
              onChange={(e) => setSelectedTopic(e.target.value || null)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Tất cả Album chủ đề</option>
              {topicAlbums.map((alb) => (
                <option key={alb.topic_category} value={alb.topic_category}>
                  {alb.topic_category} ({alb.total_words} từ)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTopic && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
            <span className="text-purple-300 font-semibold">
              Đang lọc theo Album: <span className="underline font-bold">{selectedTopic}</span>
            </span>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-slate-400 hover:text-white underline font-medium"
            >
              Bỏ lọc album
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2 text-slate-400">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          <p className="text-sm font-medium">Đang tải danh sách từ vựng & album chủ đề...</p>
        </div>
      ) : (
        <>
          {/* MODULE 11: TOPIC ALBUMS MODE */}
          {viewMode === 'albums' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderHeart className="w-5 h-5 text-purple-400" />
                  <span>Danh Sách Album Từ Vựng Theo Chủ Đề ({topicAlbums.length} album)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {topicAlbums.map((alb) => (
                  <div
                    key={alb.topic_category}
                    onClick={() => {
                      setSelectedTopic(alb.topic_category);
                      setViewMode('cards');
                    }}
                    className="group bg-slate-800/80 hover:bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-xl cursor-pointer transition-all duration-300 hover:border-purple-500/60 hover:scale-[1.02] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold capitalize">
                          {alb.topic_category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {alb.learned_words} / {alb.total_words} thuộc
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition capitalize">
                        {alb.topic_category}
                      </h4>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                          style={{
                            width: `${alb.total_words > 0 ? Math.round((alb.learned_words / alb.total_words) * 100) : 0}%`
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 text-right">
                        Thực hành Album này &rarr;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FLASHCARD MODE */}
          {viewMode === 'cards' && (
            vocabList.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-slate-800/30 border border-dashed border-slate-700/60 space-y-3">
                <BookOpen className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-slate-300 font-medium text-base">Chưa có từ vựng nào trong Album này</p>
                <p className="text-xs text-slate-500">Hãy upload tài liệu đề thi PDF để AI tự động phân loại từ vựng vào album!</p>
              </div>
            ) : currentVocab && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
                  <span>Thẻ {cardIndex + 1} / {vocabList.length}</span>
                  <span>SRS Level: {currentVocab.srs_level}</span>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="relative min-h-[320px] bg-slate-800/90 hover:bg-slate-800 rounded-3xl p-8 border border-slate-700/80 shadow-2xl cursor-pointer flex flex-col justify-between transition-all duration-300 hover:border-purple-500/50"
                >
                  {!isFlipped ? (
                    <div className="my-auto text-center space-y-4 animate-fade-in">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
                          {currentVocab.part_of_speech || 'word'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                          {currentVocab.topic_category}
                        </span>
                      </div>
                      <h2 className="text-4xl font-extrabold text-white capitalize tracking-tight">
                        {currentVocab.word}
                      </h2>
                      <p className="text-slate-400 font-mono text-base">{currentVocab.ipa}</p>

                      <button
                        onClick={(e) => { e.stopPropagation(); speakText(currentVocab.word); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition"
                      >
                        <Volume2 className="w-4 h-4" /> Phát âm
                      </button>
                      <p className="text-[11px] text-slate-500 pt-4">Click vào thẻ để xem nghĩa tiếng Việt &rarr;</p>
                    </div>
                  ) : (
                    <div className="my-auto space-y-4 animate-fade-in text-center">
                      <span className="text-xs font-semibold text-slate-400">Nghĩa tiếng Việt</span>
                      <h3 className="text-2xl font-bold text-emerald-300">{currentVocab.meaning_vi}</h3>

                      {currentVocab.example_sentence && (
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300 italic">
                          "{currentVocab.example_sentence}"
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); speakText(currentVocab.example_sentence || currentVocab.word); }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-700 text-slate-200 text-xs font-medium"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Nghe ví dụ
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleNextCard()}
                    className="py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Chưa nhớ (Reset SRS)
                  </button>
                  <button
                    onClick={() => handleNextCard()}
                    className="py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Đã thuộc (+SRS Level)
                  </button>
                </div>
              </div>
            )
          )}

          {/* TYPING PRACTICE MODE */}
          {viewMode === 'typing' && currentVocab && (
            <div className="max-w-xl mx-auto space-y-6 bg-slate-800/90 rounded-3xl p-8 border border-slate-700/80 shadow-2xl">
              <div className="text-center space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  Từ {cardIndex + 1} / {vocabList.length}
                </span>
                <h3 className="text-2xl font-bold text-emerald-300">{currentVocab.meaning_vi}</h3>
                <p className="text-xs text-slate-400 font-mono">Gõ lại từ tiếng Anh nguyên mẫu ({currentVocab.word.length} ký tự)</p>

                <button
                  onClick={() => speakText(currentVocab.word)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" /> Nghe gợi ý phát âm
                </button>
              </div>

              <form onSubmit={handleCheckTyping} className="space-y-4">
                <input
                  type="text"
                  value={typingInput}
                  onChange={(e) => { setTypingInput(e.target.value); setTypingStatus('idle'); }}
                  placeholder="Gõ từ tiếng Anh vào đây..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3 text-center text-lg font-bold text-white tracking-widest focus:border-purple-500 focus:outline-none"
                  autoFocus
                />

                {typingStatus === 'correct' && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Chính xác! "{currentVocab.word}"
                  </div>
                )}

                {typingStatus === 'incorrect' && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-center text-xs font-medium space-y-1">
                    <div className="flex items-center justify-center gap-1 font-bold">
                      <XCircle className="w-4 h-4" /> Chưa đúng
                    </div>
                    <p>Đáp án đúng: <span className="font-mono font-bold text-white capitalize">{currentVocab.word}</span></p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30"
                  >
                    Kiểm tra đáp án
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNextCard()}
                    className="py-3 px-5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition"
                  >
                    Từ tiếp theo &rarr;
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GRID ALL VOCAB MODE */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocabList.map((item) => (
                <div key={item.id} className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 space-y-3 hover:border-purple-500/50 transition shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-extrabold text-white capitalize">{item.word}</h4>
                        <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {item.ipa}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                          {item.part_of_speech}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {item.topic_category}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-300 mt-1">{item.meaning_vi}</p>
                    </div>

                    <button
                      onClick={() => speakText(item.word)}
                      className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition shrink-0"
                      title="Nghe phát âm từ vựng"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.example_sentence && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1">
                      <p className="text-slate-300 italic">"{item.example_sentence}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                    <span>Xuất hiện: {item.appears_in_part}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-bold">
                      Tần suất: {item.frequency_count} lần
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};
