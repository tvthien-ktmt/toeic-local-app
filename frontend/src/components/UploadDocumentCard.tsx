import React from 'react';
import { FileText, Headphones, Trash2, FileCode, Loader2, Eye } from 'lucide-react';
import type { DocumentSummary } from '../api/documents';

interface UploadDocumentCardProps {
  doc: DocumentSummary;
  onSelect: (docId: number) => void;
  onDelete: (clickEvent: React.MouseEvent, docId: number) => void;
}

/**
 * Document card in upload library showing filename, page count, upload date, and delete actions.
 */
export const UploadDocumentCard: React.FC<UploadDocumentCardProps> = ({
  doc,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(doc.id)}
      className="group relative bg-theme-surface hover:bg-theme-surface-2 rounded-2xl p-5 border border-theme hover:border-theme-accent shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-theme-accent/10 border-theme-accent/30 text-theme-accent">
              {doc.doc_type === 'RC_EXAM' ? <FileText className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-theme-primary group-hover:text-theme-accent transition truncate text-sm">
                {doc.filename}
              </h3>
              <span className="text-[10px] font-semibold text-theme-secondary uppercase tracking-wider">
                {doc.doc_type === 'RC_EXAM' ? 'Reading Exam (Part 5-7)' : 'Listening Transcript (Part 1-4)'}
              </span>
            </div>
          </div>

          <button
            onClick={(clickEvent) => onDelete(clickEvent, doc.id)}
            className="p-1.5 rounded-lg text-theme-secondary hover:text-theme-error hover:bg-theme-error/10 transition opacity-0 group-hover:opacity-100"
            title="Xóa tài liệu"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-theme-secondary pt-2 border-t border-theme">
          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
            <FileCode className="w-3.5 h-3.5 text-theme-accent" />
            {(doc.markdown_length / 1024).toFixed(1)} KB ({doc.markdown_length.toLocaleString()} chars)
          </span>
          <span>{new Date(doc.uploaded_at).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between border-t border-theme text-xs">
        {doc.status === 'processing' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full alert-warning border border-theme-warning/30 text-[11px] font-medium animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-theme-warning" />
            Đang OCR & trích xuất ở nền...
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full alert-success border border-theme-success/30 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-success" />
            {doc.status}
          </span>
        )}

        <span className="inline-flex items-center gap-1 text-theme-accent font-semibold group-hover:translate-x-1 transition-transform">
          <Eye className="w-3.5 h-3.5" /> Xem chi tiết &rarr;
        </span>
      </div>
    </div>
  );
};
