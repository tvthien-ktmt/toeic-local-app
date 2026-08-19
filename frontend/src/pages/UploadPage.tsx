import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Headphones, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadDocument, fetchDocuments, deleteDocument } from '../api/documents';
import type { DocumentSummary } from '../api/documents';
import { UploadHeaderBanner } from '../components/UploadHeaderBanner';
import { UploadDocumentCard } from '../components/UploadDocumentCard';

interface UploadPageProps {
  onSelectDocument: (docId: number) => void;
}

/**
 * Document upload and library management page for PDF/Markdown TOEIC exam papers and listening transcripts.
 */
export const UploadPage: React.FC<UploadPageProps> = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [docType, setDocType] = useState<'RC_EXAM' | 'LC_TRANSCRIPT'>('RC_EXAM');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadDocs = async (showLoading = true) => {
    if (showLoading) setIsLoadingList(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err: any) {
      setErrorMsg('Không thể tải danh sách tài liệu từ server backend.');
    } finally {
      if (showLoading) setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadDocs(true);
  }, []);

  // Poll every 2 seconds if any document is currently in 'processing' status
  useEffect(() => {
    const hasProcessingDoc = documents.some((docItem) => docItem.status === 'processing');
    if (!hasProcessingDoc) {
      return;
    }

    const interval = setInterval(() => {
      loadDocs(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [documents]);

  const handleFileUpload = async (file: File) => {
    if (!file) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      const result = await uploadDocument(file, docType);
      if (result.status === 'processing') {
        setSuccessMsg(`Tải lên thành công! Hệ thống đang xử lý OCR 2 cột & trích xuất ở nền (Processing in background)...`);
      } else {
        setSuccessMsg(`Tải lên & chuyển đổi thành công! Trích xuất ${result.markdown_content?.length.toLocaleString() || 0} ký tự Markdown.`);
      }
      await loadDocs(false);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || 'Có lỗi xảy ra khi tải lên hoặc chuyển đổi file PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (dragEvent: React.DragEvent) => {
    dragEvent.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (dropEvent: React.DragEvent) => {
    dropEvent.preventDefault();
    setIsDragging(false);
    if (dropEvent.dataTransfer.files && dropEvent.dataTransfer.files[0]) {
      handleFileUpload(dropEvent.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    if (changeEvent.target.files && changeEvent.target.files[0]) {
      handleFileUpload(changeEvent.target.files[0]);
    }
  };

  const handleDelete = async (clickEvent: React.MouseEvent, id: number) => {
    clickEvent.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi cơ sở dữ liệu?')) {
      return;
    }

    try {
      await deleteDocument(id);
      setDocuments(documents.filter((docItem) => docItem.id !== id));
      setSuccessMsg('Đã xóa tài liệu thành công.');
    } catch (error) {
      setErrorMsg('Không thể xóa tài liệu.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <UploadHeaderBanner />

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl alert-error flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 alert-error-icon shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline font-semibold opacity-90 hover:opacity-100">Đóng</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl alert-success flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 alert-success-icon shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline font-semibold opacity-90 hover:opacity-100">Đóng</button>
        </div>
      )}

      {/* Upload Zone & Config */}
      <div className="bg-theme-surface rounded-3xl p-6 sm:p-8 border border-theme shadow-xl space-y-6">
        {/* Document Type Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme">
          <div>
            <h2 className="text-lg font-bold text-theme-primary">1. Chọn loại tài liệu TOEIC</h2>
            <p className="text-xs text-theme-secondary">Định hình cấu trúc dữ liệu cho bước trích xuất AI tiếp theo</p>
          </div>

          <div className="flex items-center p-1 bg-theme-surface-2 rounded-xl border border-theme self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setDocType('RC_EXAM')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                docType === 'RC_EXAM'
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Đề Đọc (Part 5, 6, 7)</span>
            </button>

            <button
              type="button"
              onClick={() => setDocType('LC_TRANSCRIPT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                docType === 'LC_TRANSCRIPT'
                  ? 'bg-theme-accent text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Transcript Nghe (Part 1-4)</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-theme-accent bg-theme-accent/10 scale-[1.01]'
              : 'border-theme bg-theme-surface-2 hover:border-theme-accent'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-theme-accent/20 border border-theme-accent/30 flex items-center justify-center text-theme-accent shadow-inner">
              {isUploading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div>
              <p className="text-base font-bold text-theme-primary">
                {isUploading ? 'Đang gửi file sang tiến trình xử lý nền...' : 'Kéo thả file PDF đề thi vào đây, hoặc click để chọn file'}
              </p>
              <p className="text-xs text-theme-secondary mt-1">
                Hỗ trợ cả PDF Scan/Ảnh 2 cột. Hệ thống xử lý không gây giật lag máy!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-theme-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-theme-accent" />
              Danh sách tài liệu đã chuyển đổi ({documents.length})
            </h2>
            <p className="text-xs text-theme-secondary">Các file PDF đã convert sang Markdown sẵn sàng xem và luyện tập</p>
          </div>

          <button
            onClick={() => loadDocs(true)}
            className="p-2 rounded-lg bg-theme-surface-2 hover:bg-theme-surface text-theme-primary border border-theme transition"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingList ? (
          <div className="py-12 text-center text-theme-secondary space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-theme-accent" />
            <p className="text-sm">Đang tải danh sách tài liệu...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-theme-surface-2 border border-dashed border-theme space-y-3">
            <FileText className="w-10 h-10 mx-auto text-theme-secondary" />
            <p className="text-theme-primary font-medium text-sm">Chưa có tài liệu nào trong hệ thống</p>
            <p className="text-xs text-theme-secondary">Hãy upload file PDF đầu tiên của bạn ở trên để bắt đầu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((docItem) => (
              <UploadDocumentCard
                key={docItem.id}
                doc={docItem}
                onSelect={onSelectDocument}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
