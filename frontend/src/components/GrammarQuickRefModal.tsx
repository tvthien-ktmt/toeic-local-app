import React, { useEffect, useState } from 'react';
import { fetchGrammarReference, type GrammarReference } from '../api/grammar';
import { BookOpen, CheckCircle, Lightbulb, X, Sparkles, Loader2 } from 'lucide-react';

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2 text-amber-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-lg text-slate-100">Thẻ Ôn Nhanh Ngữ Pháp</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm text-slate-400">Đang nạp kiến thức ngữ pháp...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Topic Name & Formula */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-md">
                    Chủ điểm
                  </span>
                  <span className="font-bold text-base text-slate-100">{data.topic_name}</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-amber-500/20 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-medium text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CÔNG THỨC & CẤU TRÚC CHUẨN</span>
                  </div>
                  <p className="text-sm font-mono font-semibold text-amber-200 break-words">
                    {data.formula}
                  </p>
                </div>
              </div>

              {/* Key Rules */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Quy tắc quan trọng cần nhớ</span>
                </div>
                <ul className="space-y-2">
                  {data.key_rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                        {idx + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Sentences */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Ví dụ minh họa</span>
                </div>
                <div className="space-y-2">
                  {data.example_sentences.map((ex, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm italic text-slate-300">
                      "{ex}"
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                ⚡ Đã lưu vào bộ nhớ SQLite local — Các lần xem sau khởi động ngay tức thì (0 API tokens).
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
