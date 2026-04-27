import type { ChatbotConfig } from "../types/chat.types";

export const findAnswer = (
  question: string,
  config: ChatbotConfig
): string => {
  const q = question.toLowerCase();

  for (const [key, value] of Object.entries(config.knowledgeBase)) {
    if (q.includes(key.toLowerCase())) {
      return value;
    }
  }

  if (
    q.includes("xin chào") ||
    q.includes("hello") ||
    q.includes("chào")
  ) {
    return config.greetingResponse;
  }

  return config.fallbackResponse;
};

export const getVietnameseVoice = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("vi")) ??
    voices.find((voice) => /vietnam|viet/i.test(voice.name)) ??
    null
  );
};

export const speakText = (text: string): boolean => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const voice = getVietnameseVoice();
  if (!voice) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang || "vi-VN";
  utterance.rate = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return true;
};
