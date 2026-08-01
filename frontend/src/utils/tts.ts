export const speakText = (text: string, lang: string = 'en-US'): boolean => {
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ Web Speech API để phát âm!');
    return false;
  }

  window.speechSynthesis.cancel(); // stop current utterance

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // slightly slower for standard clear listening

  // Select an English voice if available
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
};
