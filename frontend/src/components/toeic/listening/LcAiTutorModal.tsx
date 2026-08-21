import React, { useState } from 'react';
import { X, Bot, AlertTriangle, ArrowRightLeft, Send } from 'lucide-react';
import { getLcTrapLabelVi } from '../../../utils/lcScoreCalculator';

interface LcAiTutorModalProps {
  questionNumber: number;
  part: 1 | 2 | 3 | 4;
  questionStem: string;
  transcriptExcerpt?: string;
  trapType?: string;
  paraphraseText?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AI Tutor Assistant Modal for TOEIC Listening questions.
 * Generates instant breakdowns of traps, paraphrase pairs, and answering strategies.
 */
export const LcAiTutorModal: React.FC<LcAiTutorModalProps> = ({
  questionNumber,
  part,
  questionStem,
  transcriptExcerpt,
  trapType,
  paraphraseText,
  isOpen,
  onClose,
}) => {
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([]);

  if (!isOpen) {
    return null;
  }

  const trapInfo = trapType ? getLcTrapLabelVi(trapType as any) : null;

  const handleSendPrompt = (prompt: string) => {
    if (!prompt.trim()) {
      return;
    }
    const newMsg = { role: 'user' as const, text: prompt };
    setChatMessages((prev) => [...prev, newMsg]);
    setCustomQuestion('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `[Gia Sư AI LC]: Đối với câu #${questionNumber} (Part ${part}), bí quyết quan trọng nhất là loại trừ các đáp án lặp lại từ hoặc có âm tương tự. Hãy tập trung nghe trọng âm và danh từ/động từ chính của câu thay vì cố dịch từng từ một.`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-theme/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-theme-accent/15 text-theme-accent flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-primary flex items-center gap-1.5">
                <span>AI Tutor LC</span>
                <span className="text-xs text-theme-secondary font-normal">&bull; Câu #{questionNumber} (Part {part})</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Question context card */}
          <div className="p-3.5 rounded-2xl bg-theme-surface-2 border border-theme space-y-1.5">
            <span className="text-[10px] font-bold text-theme-secondary uppercase">Nội dung câu hỏi:</span>
            <p className="font-bold text-theme-primary">{questionStem}</p>
            {transcriptExcerpt && (
              <p className="text-[11px] text-theme-secondary italic border-t border-theme/40 pt-1">
                Transcript: "{transcriptExcerpt}"
              </p>
            )}
          </div>

          {/* Trap breakdown if any */}
          {trapInfo && (
            <div className="p-3.5 rounded-xl alert-warning border border-theme-warning/30 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-theme-warning">
                <AlertTriangle className="w-4 h-4" />
                <span>{trapInfo.label}</span>
              </div>
              <p className="text-theme-primary/90 leading-relaxed text-[11px]">{trapInfo.advice}</p>
            </div>
          )}

          {/* Paraphrase insight if any */}
          {paraphraseText && (
            <div className="p-3.5 rounded-xl bg-theme-accent/10 border border-theme-accent/30 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-theme-accent">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Cặp từ Paraphrase cốt lõi:</span>
              </div>
              <p className="text-theme-primary font-medium">{paraphraseText}</p>
            </div>
          )}

          {/* Quick preset question buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-theme-secondary">Hỏi nhanh AI:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSendPrompt('Tại sao đáp án này đúng và các câu khác bị bẫy?')}
                className="px-2.5 py-1.5 rounded-lg bg-theme-surface-2 border border-theme hover:border-theme-accent text-theme-primary text-[11px] font-medium"
              >
                ❓ Phân tích tại sao đáp án này đúng?
              </button>
              <button
                onClick={() => handleSendPrompt('Chỉ ra các từ nối âm (linking sounds) trong câu này.')}
                className="px-2.5 py-1.5 rounded-lg bg-theme-surface-2 border border-theme hover:border-theme-accent text-theme-primary text-[11px] font-medium"
              >
                🔊 Chỉ ra các từ nối âm trong câu?
              </button>
            </div>
          </div>

          {/* Chat Messages stream */}
          {chatMessages.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-theme/40">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-theme-accent text-white ml-6 text-right'
                      : 'bg-theme-surface-2 border border-theme text-theme-primary mr-6'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="pt-2 border-t border-theme flex items-center gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(event) => setCustomQuestion(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSendPrompt(customQuestion)}
            placeholder="Hỏi AI thêm về câu hỏi này..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-theme-surface-2 border border-theme text-xs text-theme-primary focus:outline-none focus:border-theme-accent"
          />
          <button
            onClick={() => handleSendPrompt(customQuestion)}
            className="p-2.5 rounded-xl bg-theme-accent text-white shadow-sm hover:brightness-110 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
