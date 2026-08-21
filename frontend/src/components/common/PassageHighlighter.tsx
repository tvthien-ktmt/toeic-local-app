import React, { useState, useEffect } from 'react';
import { Highlighter, StickyNote, Trash2, Plus, Check } from 'lucide-react';

export interface PassageNoteItem {
  id: string;
  passageId: string;
  selectedText: string;
  noteText: string;
  color: 'yellow' | 'green' | 'blue';
  createdAt: number;
}

interface PassageHighlighterProps {
  passageId: string;
  onOpenDictionary?: (text: string) => void;
}

/**
 * Interactive Passage Highlighter and Note-taking toolbar for TOEIC Reading & Listening passages.
 * Persists highlights and sticky notes per passage in local storage.
 */
export const PassageHighlighter: React.FC<PassageHighlighterProps> = ({
  passageId,
  onOpenDictionary,
}) => {
  const [notes, setNotes] = useState<PassageNoteItem[]>([]);
  const [isNoteInputOpen, setIsNoteInputOpen] = useState<boolean>(false);
  const [currentSelectedText, setCurrentSelectedText] = useState<string>('');
  const [currentNoteContent, setCurrentNoteContent] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'green' | 'blue'>('yellow');

  // Load saved notes for this passage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`toeic_notes_${passageId}`);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch {
      setNotes([]);
    }
  }, [passageId]);

  // Save notes on update
  const saveNotes = (updatedNotes: PassageNoteItem[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem(`toeic_notes_${passageId}`, JSON.stringify(updatedNotes));
    } catch {
      // LocalStorage error handled gracefully
    }
  };

  const handleCreateNote = () => {
    if (!currentNoteContent.trim() && !currentSelectedText.trim()) {
      return;
    }

    const newNote: PassageNoteItem = {
      id: `note-${Date.now()}`,
      passageId,
      selectedText: currentSelectedText.trim() || 'Ghi chú chung cho bài đọc',
      noteText: currentNoteContent.trim(),
      color: selectedColor,
      createdAt: Date.now(),
    };

    saveNotes([newNote, ...notes]);
    setCurrentSelectedText('');
    setCurrentNoteContent('');
    setIsNoteInputOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    const remainingNotes = notes.filter((item) => item.id !== noteId);
    saveNotes(remainingNotes);
  };

  return (
    <div className="space-y-3">
      {/* Mini Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-2 rounded-xl bg-theme-surface border border-theme text-xs">
        <div className="flex items-center gap-1.5 text-theme-secondary font-medium">
          <Highlighter className="w-3.5 h-3.5 text-theme-accent" />
          <span>Công cụ Highlight &amp; Ghi chú</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Note Trigger */}
          <button
            type="button"
            onClick={() => setIsNoteInputOpen(!isNoteInputOpen)}
            className="px-2.5 py-1 rounded-lg bg-theme-surface-2 border border-theme text-theme-primary hover:text-theme-accent text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <StickyNote className="w-3 h-3" />
            <span>Thêm Ghi Chú ({notes.length})</span>
          </button>
        </div>
      </div>

      {/* Note Creation Form Drawer */}
      {isNoteInputOpen && (
        <div className="p-3.5 rounded-2xl bg-theme-surface-2 border border-theme space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-theme-accent" />
              <span>Thêm ghi chú cho đoạn văn này</span>
            </span>

            {/* Color Palette Selector */}
            <div className="flex items-center gap-1.5">
              {(['yellow', 'green', 'blue'] as const).map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setSelectedColor(colorOption)}
                  aria-label={`Chọn màu ${colorOption}`}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                    colorOption === 'yellow'
                      ? 'bg-amber-300 border-amber-400'
                      : colorOption === 'green'
                      ? 'bg-emerald-300 border-emerald-400'
                      : 'bg-sky-300 border-sky-400'
                  } ${selectedColor === colorOption ? 'ring-2 ring-theme-accent scale-110' : ''}`}
                />
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Đoạn trích dẫn hoặc từ khóa cần ghi nhớ..."
            value={currentSelectedText}
            onChange={(event) => setCurrentSelectedText(event.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-theme-surface border border-theme text-xs text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-1 focus:ring-theme-accent"
          />

          <textarea
            rows={2}
            placeholder="Nội dung ghi chú, cấu trúc ngữ pháp hoặc bẫy cần lưu ý..."
            value={currentNoteContent}
            onChange={(event) => setCurrentNoteContent(event.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-theme-surface border border-theme text-xs text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-1 focus:ring-theme-accent resize-none"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNoteInputOpen(false)}
              className="px-3 py-1.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreateNote}
              className="px-4 py-1.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow-xs hover:brightness-110 flex items-center gap-1 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu Ghi Chú</span>
            </button>
          </div>
        </div>
      )}

      {/* Existing Notes List */}
      {notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((noteItem) => (
            <div
              key={noteItem.id}
              className={`p-2.5 rounded-xl border transition-all ${
                noteItem.color === 'yellow'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : noteItem.color === 'green'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-sky-500/10 border-sky-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  {noteItem.selectedText && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-theme-primary bg-theme-surface px-1.5 py-0.5 rounded border border-theme">
                        Trích dẫn: {noteItem.selectedText}
                      </span>
                      {onOpenDictionary && (
                        <button
                          type="button"
                          onClick={() => onOpenDictionary(noteItem.selectedText)}
                          className="text-[10px] text-theme-accent underline hover:opacity-80 cursor-pointer"
                        >
                          Tra từ điển
                        </button>
                      )}
                    </div>
                  )}
                  {noteItem.noteText && (
                    <p className="text-xs text-theme-primary leading-relaxed font-medium">
                      {noteItem.noteText}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNote(noteItem.id)}
                  aria-label="Xóa ghi chú này"
                  className="p-1 rounded-md text-theme-secondary hover:text-theme-error hover:bg-theme-surface transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
