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
            console.error('Failed to lookup word context:', err);
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
    setSelectedWord('');
    setPopupPos(null);
    setData(null);
    setShowSuggestions(false);
  };

  const handleToggleFlashcard = async () => {
    if (!data) return;
    try {
      if (inFlashcard) {
        // Already in flashcards
      } else {
        await axios.post('/api/flashcards', { vocabulary_id: data.id });
        setInFlashcard(true);
      }
    } catch (err) {
      console.error('Failed to update flashcard state:', err);
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
      className="absolute z-50 w-80 bg-theme-surface border border-theme rounded-2xl shadow-2xl overflow-hidden text-theme-primary text-sm animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-theme-surface-2 border-b border-theme">
        <div className="flex items-center space-x-1.5 text-theme-accent font-semibold text-xs">
          <BookMarked className="w-4 h-4" />
          <span>TRA NGHĨA THEO NGỮ CẢNH</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 text-theme-secondary hover:text-theme-primary rounded-md hover:bg-theme-surface"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6 space-x-2 text-theme-secondary">
            <Loader2 className="w-5 h-5 animate-spin text-theme-accent" />
            <span className="text-xs">Đang tra nghĩa từ '{selectedWord}'...</span>
          </div>
        ) : data ? (
          <>
            {/* Word Header */}
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-lg text-theme-accent">{data.word}</span>
                <span className="text-xs text-theme-secondary italic">({data.part_of_speech})</span>
              </div>
              {data.ipa && (
                <div className="text-xs font-mono text-theme-secondary flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 text-theme-secondary" />
                  <span>{data.ipa}</span>
                </div>
              )}
            </div>

            {/* Meaning */}
            <div className="p-2.5 bg-theme-surface-2 border border-theme rounded-xl">
              <p className="font-medium text-theme-primary text-sm">{data.meaning_vi}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleToggleFlashcard}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  inFlashcard
                    ? 'alert-success border-theme-success font-bold'
                    : 'bg-theme-accent text-white hover:opacity-90'
                }`}
              >
                {inFlashcard ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã có Flashcard</span>
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
                className="py-1.5 px-3 rounded-xl bg-theme-surface-2 hover:bg-theme-surface border border-theme text-theme-accent text-xs font-bold transition flex items-center space-x-1"
                title="Gợi ý từ vựng liên quan"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Từ liên quan</span>
              </button>
            </div>

            {/* Suggested Terms Accordion */}
            {showSuggestions && (
              <div className="pt-2 border-t border-theme space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-theme-secondary">
                  Gợi ý từ vựng liên quan chủ đề
                </span>
                {loadingSuggestions ? (
                  <div className="py-3 text-center text-xs text-theme-secondary flex items-center justify-center space-x-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-theme-accent" />
                    <span>Gemini AI đang sinh 3-5 từ gợi ý...</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {suggestedTerms.map((st) => (
                      <div
                        key={st.id}
                        className="p-2 rounded-lg bg-theme-surface-2 border border-theme flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-theme-primary">{st.word}</span>{' '}
                          <span className="text-[11px] text-theme-secondary">({st.part_of_speech})</span>: {st.meaning_vi}
                        </div>
                        <button
                          onClick={() => handleAddSuggestedToFlashcard(st.id)}
                          disabled={st.in_flashcard}
                          className="ml-2 p-1 rounded-md text-theme-accent hover:bg-theme-surface transition shrink-0 disabled:opacity-50"
                        >
                          {st.in_flashcard ? <Check className="w-3.5 h-3.5 text-theme-success" /> : <Plus className="w-3.5 h-3.5" />}
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
