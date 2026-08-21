import React, { useState } from 'react';
import { BookOpen, VolumeX } from 'lucide-react';
import type { LCTranscriptWord, Part3ConversationData, Part4TalkData } from '../../../types/toeicListening';
import { MOCK_LC_EXAM_ETS2024_01 } from '../../../data/sampleLcData';
import { TranscriptWordPopupModal } from './TranscriptWordPopupModal';
import { TranscriptLineCard } from './TranscriptLineCard';
import { LcFeatureUpdatingCard } from './LcFeatureUpdatingCard';

interface TranscriptSmartViewProps {
  onSelectWord?: (word: LCTranscriptWord) => void;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
}

/**
 * Smart Transcript Explorer for interactive reading, line-by-line audio seeking, and instant dictionary lookup.
 */
export const TranscriptSmartView: React.FC<TranscriptSmartViewProps> = ({
  onNavigateHome,
  onNavigateCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'PART3' | 'PART4'>('PART3');
  const [selectedWord, setSelectedWord] = useState<LCTranscriptWord | null>(null);
  const [isShowVietnamese, setIsShowVietnamese] = useState<boolean>(true);
  const [currentlyPlayingLineId, setCurrentlyPlayingLineId] = useState<string | null>(null);

  const part3Conversations: Part3ConversationData[] = MOCK_LC_EXAM_ETS2024_01.parts?.part3?.conversations || [];
  const part4Talks: Part4TalkData[] = MOCK_LC_EXAM_ETS2024_01.parts?.part4?.talks || [];

  const handleSpeakLine = (lineId: string, text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCurrentlyPlayingLineId(lineId);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = 'en-US';
      utterance.onend = () => setCurrentlyPlayingLineId(null);
      utterance.onerror = () => setCurrentlyPlayingLineId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setCurrentlyPlayingLineId(null);
    }
  };

  if (part3Conversations.length === 0 && part4Talks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-theme-accent" />
              <span>Kho Transcript Thông Minh</span>
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1">
              Khám phá đoạn thoại bài nghe, tra cứu nghĩa từ vựng và nghe từng câu độc lập.
            </p>
          </div>
        </div>

        <LcFeatureUpdatingCard
          title="Kho Transcript Thông Minh & Từ Vựng"
          description="Dữ liệu transcript chi tiết (kèm lời dịch tiếng Việt và bộ từ vựng trọng tâm) đang được cập nhật từ các đề thi ETS, Hacker và YBM."
          badge="Tính Năng Đang Cập Nhật Dữ Liệu"
          onNavigateHome={onNavigateHome}
          onNavigateCatalog={onNavigateCatalog}
        />
      </div>
    );
  }

  return (
    <div className="bg-theme-surface border border-theme rounded-2xl p-5 sm:p-7 shadow-sm transition-colors space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-theme/50 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-theme-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-theme-accent" />
            <span>Kho Transcript Thông Minh &amp; Tra Từ Vựng Trực Tiếp</span>
          </h3>
          <p className="text-xs text-theme-secondary mt-0.5">
            Nhấp từng câu để nghe giọng đọc bản xứ &bull; Tra từ vựng và cụm collocations tương đương
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShowVietnamese(!isShowVietnamese)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isShowVietnamese
                ? 'bg-theme-accent text-white border-theme-accent'
                : 'bg-theme-surface border-theme text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {isShowVietnamese ? 'Ẩn Dịch Tiếng Việt' : 'Hiện Lời Dịch'}
          </button>

          {currentlyPlayingLineId && (
            <button
              onClick={handleStopAudio}
              className="px-3 py-1.5 rounded-xl bg-theme-error text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Dừng Âm Thanh</span>
            </button>
          )}
        </div>
      </div>

      {/* Part 3 / Part 4 Tab Selector */}
      <div className="flex items-center gap-2 border-b border-theme/40 pb-2">
        <button
          onClick={() => setActiveTab('PART3')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PART3'
              ? 'bg-theme-accent text-white shadow-xs'
              : 'text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Hội Thoại Part 3 ({part3Conversations.length} Bài)
        </button>

        <button
          onClick={() => setActiveTab('PART4')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PART4'
              ? 'bg-theme-accent text-white shadow-xs'
              : 'text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Bài Nói Ngắn Part 4 ({part4Talks.length} Bài)
        </button>
      </div>

      {/* Conversations / Talks List */}
      <div className="space-y-6">
        {activeTab === 'PART3' &&
          part3Conversations.map((conv: Part3ConversationData, index: number) => (
            <div
              key={conv.id}
              className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-4"
            >
              <div className="flex items-center justify-between border-b border-theme/50 pb-2">
                <span className="font-bold text-xs text-theme-accent uppercase">
                  Đoạn #{index + 1} &bull; Câu {conv.questions[0]?.questionNumber} - {conv.questions[conv.questions.length - 1]?.questionNumber}
                </span>
                <span className="text-[11px] text-theme-secondary">
                  Nhân vật: {conv.speakers.map((speakerItem) => (typeof speakerItem === 'string' ? speakerItem : `${speakerItem.name} (${speakerItem.role})`)).join(', ')}
                </span>
              </div>

              {/* Transcript Lines */}
              <div className="space-y-2.5">
                {conv.transcript.map((line) => (
                  <TranscriptLineCard
                    key={line.id}
                    line={line}
                    speakerLabel={line.speaker}
                    speakerEmoji={line.speakerAvatar}
                    isPlaying={currentlyPlayingLineId === line.id}
                    isShowVietnamese={isShowVietnamese}
                    vocabularyList={conv.vocabularyList}
                    onSpeakLine={handleSpeakLine}
                    onSelectWord={(word) => setSelectedWord(word)}
                  />
                ))}
              </div>
            </div>
          ))}

        {activeTab === 'PART4' &&
          part4Talks.map((talk: Part4TalkData, index: number) => (
            <div
              key={talk.id}
              className="p-5 rounded-2xl bg-theme-surface-2 border border-theme space-y-4"
            >
              <div className="flex items-center justify-between border-b border-theme/50 pb-2">
                <span className="font-bold text-xs text-theme-accent uppercase">
                  Bài Nói #{index + 1} &bull; Câu {talk.questions[0]?.questionNumber} - {talk.questions[talk.questions.length - 1]?.questionNumber}
                </span>
                <span className="text-[11px] text-theme-secondary">
                  Thể loại: {talk.talkType}
                </span>
              </div>

              {/* Transcript Lines */}
              <div className="space-y-2.5">
                {talk.transcript.map((line) => (
                  <TranscriptLineCard
                    key={line.id}
                    line={line}
                    speakerLabel={talk.talkType}
                    isPlaying={currentlyPlayingLineId === line.id}
                    isShowVietnamese={isShowVietnamese}
                    vocabularyList={talk.vocabularyList}
                    onSpeakLine={handleSpeakLine}
                    onSelectWord={(word) => setSelectedWord(word)}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Floating Word Lookup Card */}
      <TranscriptWordPopupModal
        selectedWord={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
};
