import React, { useState } from 'react';
import { Volume2, Plus, Check, X, BookMarked, Sparkles } from 'lucide-react';
import type { VocabularyItem } from '../../api/vocabulary';

interface DictionaryResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definitionVi: string;
  exampleEn: string;
  exampleVi: string;
}

interface InPassageDictionaryModalProps {
  selectedText: string;
  position?: { x: number; y: number } | null;
  onClose: () => void;
  onSaveToFlashcard?: (item: VocabularyItem) => void;
}

/**
 * Built-in lookup map for high-frequency TOEIC business & workplace vocabulary.
 */
const BUILT_IN_TOEIC_DICT: Record<string, DictionaryResult> = {
  postpone: {
    word: 'postpone',
    phonetic: '/poʊstˈpoʊn/',
    partOfSpeech: 'verb',
    definitionVi: 'Trì hoãn, hoãn lại (= delay, put off)',
    exampleEn: 'The board meeting has been postponed until next Friday.',
    exampleVi: 'Cuộc họp hội đồng quản trị đã bị hoãn lại cho đến thứ Sáu tuần sau.',
  },
  delay: {
    word: 'delay',
    phonetic: '/dɪˈleɪ/',
    partOfSpeech: 'verb / noun',
    definitionVi: 'Làm chậm trễ, hoãn lại (= postpone)',
    exampleEn: 'Flight 204 was delayed due to severe weather conditions.',
    exampleVi: 'Chuyến bay 204 đã bị hoãn do điều kiện thời tiết xấu.',
  },
  renovation: {
    word: 'renovation',
    phonetic: '/ˌren.əˈveɪ.ʃən/',
    partOfSpeech: 'noun',
    definitionVi: 'Sự nâng cấp, cải tạo, tân trang lại',
    exampleEn: 'The hotel is undergoing extensive renovations this month.',
    exampleVi: 'Khách sạn đang trải qua đợt cải tạo lớn trong tháng này.',
  },
  maintenance: {
    word: 'maintenance',
    phonetic: '/ˈmeɪn.tən.əns/',
    partOfSpeech: 'noun',
    definitionVi: 'Sự bảo trì, bảo dưỡng định kỳ',
    exampleEn: 'The maintenance team will inspect the heating system tomorrow.',
    exampleVi: 'Đội bảo trì sẽ kiểm tra hệ thống sưởi vào ngày mai.',
  },
  reimburse: {
    word: 'reimburse',
    phonetic: '/ˌriː.ɪmˈbɜːrs/',
    partOfSpeech: 'verb',
    definitionVi: 'Hoàn trả lại chi phí đã chi trả trước (= refund, repay)',
    exampleEn: 'Travel expenses will be reimbursed within two weeks.',
    exampleVi: 'Chi phí đi lại sẽ được hoàn trả trong vòng hai tuần.',
  },
  brochure: {
    word: 'brochure',
    phonetic: '/broʊˈʃʊr/',
    partOfSpeech: 'noun',
    definitionVi: 'Tờ rơi quảng cáo, sách hướng dẫn thông tin sản phẩm',
    exampleEn: 'Please review our latest product brochure for pricing details.',
    exampleVi: 'Vui lòng xem tập sách thông tin sản phẩm mới nhất để biết chi tiết giá.',
  },
  itinerary: {
    word: 'itinerary',
    phonetic: '/aɪˈtɪn.ə.rer.i/',
    partOfSpeech: 'noun',
    definitionVi: 'Lịch trình chuyến đi, hành trình chi tiết',
    exampleEn: 'The conference itinerary includes three keynote speeches.',
    exampleVi: 'Lịch trình hội nghị bao gồm ba bài phát biểu chính.',
  },
  complimentary: {
    word: 'complimentary',
    phonetic: '/ˌkɑːm.pləˈmen.tər.i/',
    partOfSpeech: 'adjective',
    definitionVi: 'Miễn phí, kèm theo tặng kèm (= free of charge)',
    exampleEn: 'Guests can enjoy a complimentary breakfast at the cafeteria.',
    exampleVi: 'Khách có thể thưởng thức bữa sáng miễn phí tại căng tin.',
  },
  accommodate: {
    word: 'accommodate',
    phonetic: '/əˈkɑː.mə.deɪt/',
    partOfSpeech: 'verb',
    definitionVi: 'Cung cấp chỗ ở, đáp ứng yêu cầu, chứa được',
    exampleEn: 'The conference hall can accommodate up to 500 attendees.',
    exampleVi: 'Hội trường hội nghị có thể chứa tới 500 người tham dự.',
  },
  warranty: {
    word: 'warranty',
    phonetic: '/ˈwɔːr.ən.ti/',
    partOfSpeech: 'noun',
    definitionVi: 'Phiếu bảo hành, cam kết bảo hành',
    exampleEn: 'The electronic equipment comes with a two-year manufacturer warranty.',
    exampleVi: 'Thiết bị điện tử đi kèm với bảo hành hai năm từ nhà sản xuất.',
  },
  invoice: {
    word: 'invoice',
    phonetic: '/ˈɪn.vɔɪs/',
    partOfSpeech: 'noun / verb',
    definitionVi: 'Hóa đơn thanh toán / Xuất hóa đơn',
    exampleEn: 'An itemized invoice will be sent to your billing address.',
    exampleVi: 'Hóa đơn chi tiết từng mục sẽ được gửi đến địa chỉ thanh toán của bạn.',
  },
  colleague: {
    word: 'colleague',
    phonetic: '/ˈkɑː.liːɡ/',
    partOfSpeech: 'noun',
    definitionVi: 'Đồng nghiệp cùng cơ quan (= coworker)',
    exampleEn: 'She consulted with her senior colleagues before making the final decision.',
    exampleVi: 'Cô ấy đã tham khảo ý kiến các đồng nghiệp cấp cao trước khi đưa ra quyết định cuối cùng.',
  },
};

/**
 * Interactive In-Passage Dictionary Popup.
 * Provides instant definition, IPA phonetics, audio pronunciation, and 1-click Flashcard saving.
 */
export const InPassageDictionaryModal: React.FC<InPassageDictionaryModalProps> = ({
  selectedText,
  onClose,
  onSaveToFlashcard,
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const cleanQuery = (selectedText || '').trim().toLowerCase().replace(/[^a-zA-Z]/g, '');

  const entry: DictionaryResult = BUILT_IN_TOEIC_DICT[cleanQuery] || {
    word: (selectedText || '').trim(),
    phonetic: '/ˈwɜːrd/',
    partOfSpeech: 'vocabulary',
    definitionVi: `Từ vựng thương mại TOEIC: "${selectedText}"`,
    exampleEn: `Please pay special attention to the word "${selectedText}" in the passage.`,
    exampleVi: `Hãy chú ý đến từ "${selectedText}" xuất hiện trong ngữ cảnh đoạn văn.`,
  };

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(entry.word);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveFlashcard = () => {
    if (onSaveToFlashcard) {
      const newCard: VocabularyItem = {
        id: Date.now(),
        word: entry.word,
        ipa: entry.phonetic,
        part_of_speech: entry.partOfSpeech,
        meaning_vi: entry.definitionVi,
        example_sentence: entry.exampleEn,
        source_document_id: null,
        appears_in_part: 'Part 7',
        topic_category: 'TOEIC In-Passage Vocabulary',
        frequency_count: 1,
        srs_level: 1,
        next_review_at: new Date().toISOString(),
        in_flashcard: true,
      };
      onSaveToFlashcard(newCard);
    }
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-theme-surface border border-theme rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-theme/50 pb-3">
          <div className="flex items-center gap-2 text-theme-accent font-bold text-xs">
            <BookMarked className="w-4 h-4" />
            <span>Từ Điển Nhanh Trong Bài (TOEIC Quick Dict)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng từ điển"
            className="p-1 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Word Info Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-black text-theme-primary tracking-tight">
                {entry.word}
              </h3>
              <span className="text-xs font-mono text-theme-secondary">
                {entry.phonetic}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSpeak}
              aria-label="Phát âm từ này"
              className="p-2 rounded-xl bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Phát âm</span>
            </button>
          </div>

          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-theme-surface-2 border border-theme text-theme-secondary uppercase">
            {entry.partOfSpeech}
          </span>
        </div>

        {/* Meaning and Example */}
        <div className="p-3.5 rounded-2xl bg-theme-surface-2 border border-theme space-y-2.5">
          <div>
            <span className="text-[11px] font-semibold text-theme-secondary">
              Định nghĩa &amp; Từ đồng nghĩa:
            </span>
            <p className="text-xs font-bold text-theme-primary mt-0.5">
              {entry.definitionVi}
            </p>
          </div>

          <div className="border-t border-theme/40 pt-2 space-y-1">
            <span className="text-[11px] font-semibold text-theme-secondary flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-theme-accent" />
              <span>Ví dụ trong đề thi:</span>
            </span>
            <p className="text-xs text-theme-primary italic">
              &ldquo;{entry.exampleEn}&rdquo;
            </p>
            <p className="text-[11px] text-theme-secondary">
              {entry.exampleVi}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveFlashcard}
            disabled={isSaved}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSaved
                ? 'bg-theme-success/20 text-theme-success border border-theme-success/30'
                : 'bg-theme-accent text-white shadow-md hover:brightness-110'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã Thêm Vào Flashcard (SRS)</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Lưu Từ Vào Flashcard Cá Nhân</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-theme text-xs font-semibold text-theme-secondary hover:bg-theme-surface-2 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
