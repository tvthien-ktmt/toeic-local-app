import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Headphones, Trash2, Eye, ShieldCheck, Zap, AlertCircle, RefreshCw, FileCode, Loader2 } from 'lucide-react';
import { uploadDocument, fetchDocuments, deleteDocument } from '../api/documents';
import type { DocumentSummary } from '../api/documents';

interface UploadPageProps {
  onSelectDocument: (docId: number) => void;
}

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
    const hasProcessingDoc = documents.some(d => d.status === 'processing');
    if (!hasProcessingDoc) return;

    const interval = setInterval(() => {
      loadDocs(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [documents]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Có lỗi xảy ra khi tải lên hoặc chuyển đổi file PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi cơ sở dữ liệu?')) return;
    try {
      await deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
      setSuccessMsg('Đã xóa tài liệu thành công.');
    } catch (err) {
      setErrorMsg('Không thể xóa tài liệu.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-theme-surface p-8 border border-theme shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 border border-theme-accent/30 text-theme-accent text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" /> MarkItDown & Local 2-Column OCR Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-primary tracking-tight">
            Upload PDF & Chuyển Đổi Sang Markdown
          </h1>
          <p className="text-theme-secondary max-w-2xl text-sm sm:text-base leading-relaxed">
            Hỗ trợ cả PDF text thuần và <span className="text-theme-accent font-semibold">PDF Scan/Ảnh 2 cột (Local OCR 0 Token AI)</span>. Xử lý bất đồng bộ ở nền không gây treo giật máy!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-theme-surface-2 border border-theme">
              <ShieldCheck className="w-5 h-5 text-theme-accent shrink-0" />
              <div>
                <p className="text-xs font-semibold text-theme-primary">Local OCR 0 Token AI</p>
                <p className="text-[11px] text-theme-secondary">PyMuPDF + Tesseract 2 Cột</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-theme-surface-2 border border-theme">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-theme-primary">Async Background Worker</p>
                <p className="text-[11px] text-theme-secondary">Không freeze UI khi xử lý</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-theme-surface-2 border border-theme">
              <FileCode className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-theme-primary">Clean Markdown Output</p>
                <p className="text-[11px] text-theme-secondary">Tách đúng thứ tự Q101 &rarr; Q108</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large PDF Multi-Test Safety Warning Banner */}
      <div className="p-4 rounded-2xl alert-warning text-xs sm:text-sm flex items-start space-x-3 shadow-lg">
        <AlertCircle className="w-5 h-5 alert-warning-icon shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold alert-warning-title">Lưu ý quan trọng khi upload sách tổng hợp nhiều đề thi (450+ trang):</p>
          <p className="leading-relaxed">
            Hệ thống phân loại câu hỏi theo từng đề thi đơn lẻ (~25-30 trang/đề). Nếu bạn upload nguyên một cuốn sách 450+ trang chứa 10 đề thi gộp chung, câu hỏi giữa các đề thi khác nhau sẽ bị trộn lẫn vào nhau. 
            <strong className="alert-warning-highlight"> Khuyên dùng:</strong> Hãy dùng công cụ tách file PDF (như Smallpdf hoặc ILovePDF) tách cuốn sách thành từng file đề thi riêng lẻ trước khi upload!
          </p>
        </div>
      </div>

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
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
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
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="p-1.5 rounded-lg text-theme-secondary hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-medium animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                      Đang OCR & trích xuất ở nền...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {doc.status}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-theme-accent font-semibold group-hover:translate-x-1 transition-transform">
                    <Eye className="w-3.5 h-3.5" /> Xem chi tiết &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
