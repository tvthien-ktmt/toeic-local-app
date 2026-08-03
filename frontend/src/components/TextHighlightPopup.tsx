import React, { useEffect, useState, useRef } from 'react';
import { lookupVocabularyWord, suggestRelatedVocabulary, type VocabularyLookupResult, type SuggestedVocabResult } from '../api/vocabulary';
import axios from 'axios';
import { Plus, Check, Sparkles, X, Volume2, Loader2, BookMarked } from 'lucide-react';

interface TextHighlightPopupProps {
  documentId?: number;
}

export const TextHighlightPopup: React.FC<TextHighlightPopupProps> = ({ documentId }) => {
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<VocabularyLookupResult | null>(null);
  const [inFlashcard, setInFlashcard] = useState<boolean>(false);
  const [suggestedTerms, setSuggestedTerms] = useState<SuggestedVocabResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Don't trigger if click inside popup itself
      if (popupRef.current && popupRef.current.contains(e.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const text = selection.toString().trim();
      // Valid word selection: between 2 and 40 chars, single word or short phrase
      if (text.length >= 2 && text.length <= 40 && !text.includes('\n')) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Get surrounding text for context
        const anchorNode = selection.anchorNode;
        const parentText = anchorNode?.parentElement?.textContent || text;

        setSelectedWord(text);
        setPopupPos({
          top: Math.max(10, rect.top + window.scrollY - 10),
          left: Math.min(window.innerWidth - 340, Math.max(10, rect.left + window.scrollX))
        });

        // Trigger lookup
        setLoading(true);
        setData(null);
        setSuggestedTerms([]);
        setShowSuggestions(false);

        lookupVocabularyWord({
          word: text,
          context_sentence: parentText,
          document_id: documentId
        })
          .then((res) => {
            setData(res);
            setInFlashcard(res.in_flashcard);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Highlight lookup error:', err);
            setLoading(false);
          });
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [documentId]);

  const handleClose = () => {
    setPopupPos(null);
    setSelectedWord('');
    setData(null);
  };

  const handleToggleFlashcard = async () => {
    if (!data) return;
    try {
      if (inFlashcard) {
        setInFlashcard(false);
      } else {
        await axios.post('/api/flashcards', { vocabulary_id: data.id });
        setInFlashcard(true);
      }
    } catch (err) {
      console.error('Failed to toggle flashcard:', err);
    }
  };

  const handleFetchSuggestions = async () => {
    if (!data) return;
    setShowSuggestions(true);
    setLoadingSuggestions(true);
    try {
      const res = await suggestRelatedVocabulary({
        word: data.word,
        topic_category: data.topic_category
      });
      setSuggestedTerms(res);
      setLoadingSuggestions(false);
    } catch (err) {
      console.error('Failed to fetch related suggestions:', err);
      setLoadingSuggestions(false);
    }
  };

  const handleAddSuggestedToFlashcard = async (vocabId: number) => {
    try {
      await axios.post('/api/flashcards', { vocabulary_id: vocabId });
      setSuggestedTerms((prev) =>
        prev.map((t) => (t.id === vocabId ? { ...t, in_flashcard: true } : t))
      );
    } catch (err) {
      console.error('Failed to add suggested term to flashcard:', err);
    }
  };

  if (!popupPos || !selectedWord) return null;

  return (
    <div
      ref={popupRef}
      style={{ top: `${popupPos.top}px`, left: `${popupPos.left}px` }}
      className="absolute z-50 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 text-sm animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
          <BookMarked className="w-4 h-4" />
          <span>TRA NGHĨA THEO NGỮ CẢNH</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6 space-x-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span className="text-xs">Đang tra nghĩa từ '{selectedWord}'...</span>
          </div>
        ) : data ? (
          <>
            {/* Word Header */}
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-lg text-amber-300">{data.word}</span>
                <span className="text-xs text-slate-400 italic">({data.part_of_speech})</span>
              </div>
              {data.ipa && (
                <div className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{data.ipa}</span>
                </div>
              )}
            </div>

            {/* Meaning */}
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <p className="font-medium text-slate-100 text-sm">{data.meaning_vi}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleToggleFlashcard}
                className={`flex-1 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border ${
                  inFlashcard
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20'
                }`}
              >
                {inFlashcard ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã ở Flashcard</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Flashcard</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFetchSuggestions}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-medium text-xs flex items-center space-x-1 transition-colors"
                title="Gợi ý từ vựng liên quan chủ đề"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Từ liên quan</span>
              </button>
            </div>

            {/* Suggested Related Vocab Section */}
            {showSuggestions && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center space-x-1 text-xs font-semibold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GỢI Ý TỪ THEO CHỦ ĐỀ ({data.topic_category})</span>
                </div>

                {loadingSuggestions ? (
                  <div className="flex items-center justify-center py-4 space-x-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Đang tìm từ vựng thương mại liên quan...</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {suggestedTerms.map((term) => (
                      <div
                        key={term.id}
                        className="flex items-center justify-between p-2 bg-slate-950/40 border border-slate-800/80 rounded-lg text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">{term.word}</span>
                          <span className="text-slate-400 ml-1">({term.part_of_speech})</span>
                          <p className="text-slate-400 text-[11px]">{term.meaning_vi}</p>
                        </div>
                        <button
                          onClick={() => handleAddSuggestedToFlashcard(term.id)}
                          disabled={term.in_flashcard}
                          className={`p-1 rounded-md border ${
                            term.in_flashcard
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                          }`}
                        >
                          {term.in_flashcard ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
