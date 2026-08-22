/**
 * Pronounces a given English text using the browser's native Web Speech Synthesis API.
 * 
 * @param text - The English word or sentence to pronounce.
 * @param language - Speech synthesis language tag (default: 'en-US').
 * @returns Boolean indicating whether playback was initiated.
 */
export const speakText = (text: string, language: string = 'en-US'): boolean => {
  if (!('speechSynthesis' in window)) {
    console.warn('Trình duyệt của bạn không hỗ trợ Web Speech API để phát âm!');

    return false;
  }

  window.speechSynthesis.cancel(); // stop current utterance

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9; // slightly slower for standard clear listening

  // Select an English voice if available
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voiceItem) => voiceItem.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);

  return true;
};

