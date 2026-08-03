import React, { useEffect, useState } from 'react';
import { fetchGrammarReference, type GrammarReference } from '../api/grammar';
import { BookOpen, CheckCircle, Lightbulb, X, Loader2 } from 'lucide-react';

interface GrammarQuickRefModalProps {
  topicName: string | null;
  onClose: () => void;
}

export const GrammarQuickRefModal: React.FC<GrammarQuickRefModalProps> = ({ topicName, onClose }) => {
  const [data, setData] = useState<GrammarReference | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicName) return;

    setLoading(true);
    setError(null);
    fetchGrammarReference(topicName)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load grammar reference:', err);
        setError('Không thể tải thẻ ôn nhanh ngữ pháp.');
        setLoading(false);
      });
  }, [topicName]);

  if (!topicName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-theme-surface border border-theme rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-theme-primary relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-surface-2">
          <div className="flex items-center space-x-2 text-theme-accent">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-lg text-theme-primary">Thẻ Ôn Nhanh Ngữ Pháp</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-theme-secondary hover:text-theme-primary hover:bg-theme-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-theme-accent animate-spin" />
              <p className="text-sm text-theme-secondary">Đang nạp kiến thức ngữ pháp...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Topic Name */}
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-theme-secondary font-bold">Chủ điểm</span>
                <h4 className="text-xl font-extrabold text-theme-accent capitalize">{data.topic_name}</h4>
              </div>

              {/* Formula */}
              <div className="p-4 rounded-xl bg-theme-surface-2 border border-theme space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-theme-accent uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Công thức & Cấu trúc cốt lõi</span>
                </div>
                <p className="font-mono text-sm text-theme-primary font-bold pt-1 select-text">
                  {data.formula}
                </p>
              </div>

              {/* Key Rules */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-theme-secondary font-bold">Quy tắc cần nhớ</span>
                <ul className="space-y-2">
                  {data.key_rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-theme-primary leading-relaxed bg-theme-surface-2 p-3 rounded-xl border border-theme">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Sentences */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-theme-secondary font-bold">Ví dụ minh họa TOEIC</span>
                <div className="space-y-2">
                  {data.example_sentences.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-theme-surface-2 border border-theme text-xs sm:text-sm italic text-theme-primary border-l-4 border-l-theme-accent">
                      "{ex}"
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
