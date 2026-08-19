import React from 'react';
import { ArrowLeft, BrainCircuit, CheckCircle2, Copy, Check, Eye, HelpCircle, BookOpen, RefreshCw } from 'lucide-react';
import type { DocumentDetail } from '../api/documents';

interface DocumentHeaderBannerProps {
  doc: DocumentDetail | null;
  docId: number;
  questionCount: number;
  vocabCount: number;
  isExtracting: boolean;
  isCopied: boolean;
  activeTab: 'preview' | 'questions' | 'vocab';
  onBack: () => void;
  onTriggerExtraction: () => void;
  onCopyMarkdown: () => void;
  onSetActiveTab: (tab: 'preview' | 'questions' | 'vocab') => void;
}

/**
 * Header banner for document detail view displaying filename, extraction status badges, tab navigation, and action buttons.
 */
export const DocumentHeaderBanner: React.FC<DocumentHeaderBannerProps> = ({
  doc,
  questionCount,
  vocabCount,
  isExtracting,
  isCopied,
  activeTab,
  onBack,
  onTriggerExtraction,
  onCopyMarkdown,
  onSetActiveTab,
}) => {
  const tokenEstimate = Math.round((doc?.markdown_content.length || 0) / 4);

  return (
    <div className="space-y-6">
      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition text-sm font-semibold w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tài liệu
        </button>

        <div className="flex items-center gap-3">
          {questionCount === 0 ? (
            <button
              onClick={onTriggerExtraction}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-accent text-white text-xs sm:text-sm font-bold shadow-lg transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isExtracting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BrainCircuit className="w-4 h-4" />
              )}
              <span>
                {isExtracting ? 'Đang trích xuất AI...' : 'Trích Xuất AI (Tự Động 0 Token Waste)'}
              </span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl alert-success text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 alert-success-icon" /> Đã trích xuất {questionCount} câu hỏi
            </span>
          )}

          <button
            onClick={onCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme text-xs font-semibold transition cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-theme-success" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Đã sao chép' : 'Sao chép Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Banner info */}
      <div className="bg-theme-surface rounded-3xl p-6 border border-theme space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-theme-accent/20 text-theme-accent border border-theme-accent/30">
                {doc?.doc_type === 'RC_EXAM' ? 'Reading Test (Part 5, 6, 7)' : 'Listening Transcript'}
              </span>
              <span className="text-theme-secondary text-xs font-mono">
                {doc?.markdown_content.length.toLocaleString()} ký tự (~{tokenEstimate.toLocaleString()} tokens)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-theme-primary">{doc?.filename}</h1>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-theme pb-2 flex-wrap">
          <button
            onClick={() => onSetActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-theme-accent text-white shadow-lg'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            <Eye className="w-4 h-4" /> Xem Bài Đọc & Đề Thi
          </button>

          <button
            onClick={() => onSetActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-theme-accent text-white shadow-lg'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Làm Bài Thi ({questionCount})
          </button>

          <button
            onClick={() => onSetActiveTab('vocab')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-theme-accent text-white shadow-lg'
                : 'bg-theme-surface-2 text-theme-secondary hover:text-theme-primary border border-theme'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Từ Vựng Trích Xuất ({vocabCount})
          </button>
        </div>
      </div>
    </div>
  );
};
