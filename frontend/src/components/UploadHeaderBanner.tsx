import React from 'react';
import { ShieldCheck, Zap, FileCode, AlertCircle } from 'lucide-react';

/**
 * Header banner on upload page highlighting MarkItDown and Local 2-Column OCR features with multi-test upload guidance.
 */
export const UploadHeaderBanner: React.FC = () => {
  return (
    <div className="space-y-6">
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
              <Zap className="w-5 h-5 text-theme-warning shrink-0" />
              <div>
                <p className="text-xs font-semibold text-theme-primary">Async Background Worker</p>
                <p className="text-[11px] text-theme-secondary">Không freeze UI khi xử lý</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-theme-surface-2 border border-theme">
              <FileCode className="w-5 h-5 text-theme-accent shrink-0" />
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
    </div>
  );
};
