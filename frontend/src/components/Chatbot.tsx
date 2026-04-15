/* eslint-disable react-refresh/only-export-components */
export { default } from "@/shared/components/Chatbot";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SiteContent } from "@/types/site";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
  }
}

function findAnswer(question: string, chatbotContent: SiteContent["chatbot"]): string {
  const q = question.toLowerCase();
  for (const [key, value] of Object.entries(chatbotContent.knowledgeBase)) {
    if (q.includes(key)) return value;
  }
  if (q.includes("xin chào") || q.includes("hello") || q.includes("chào")) {
    return chatbotContent.greetingResponse;
  }
  return chatbotContent.fallbackResponse;
}

const Chatbot = ({
  chatbotContent,
  emblem,
}: {
  chatbotContent: SiteContent["chatbot"];
  emblem?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: chatbotContent.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    [],
  );

  const getVietnameseVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((voice) => voice.lang.toLowerCase().startsWith("vi")) ??
      voices.find((voice) => /vietnam|viet/i.test(voice.name)) ??
      null
    );
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const vietnameseVoice = getVietnameseVoice();

    if (!vietnameseVoice) {
      setVoiceError("Thiết bị chưa có giọng đọc tiếng Việt. Bot vẫn trả lời bằng văn bản.");
      return;
    }

    setVoiceError("");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = vietnameseVoice;
    utterance.lang = vietnameseVoice.lang || "vi-VN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    setVoiceError("");
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceError("Trình duyệt chưa hỗ trợ ghi âm giọng nói.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "vi-VN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onerror = () => {
      setVoiceError("Không thu được giọng nói. Bạn thử lại giúp mình.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(userMsg.content, chatbotContent);
      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", content: answer }]);
      speakText(answer);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-transparent text-white shadow-none transition-all hover:scale-[1.03]"
        aria-label="Mở chatbot"
      >
        {isOpen ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-topbar text-white shadow-lg">
            <X className="h-7 w-7" />
          </span>
        ) : emblem ? (
          <img src={emblem} alt="chatbot-icon" className="h-20 w-20 rounded-full object-cover shadow-xl" />
        ) : (
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-topbar shadow-xl">
            <Shield className="h-8 w-8" />
            <MessageCircle className="absolute -bottom-1 -right-1 h-4 w-4" />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-card rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col"
            style={{ height: "480px" }}
          >
            <div className="bg-topbar text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                {emblem ? (
                  <img src={emblem} alt="emblem" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="font-semibold text-sm">{chatbotContent.title}</div>
                <div className="text-xs opacity-80">{chatbotContent.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking && typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                    return;
                  }

                  const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant");
                  if (lastAssistant) {
                    speakText(lastAssistant.content);
                  }
                }}
                className="ml-auto rounded-md p-1.5 hover:bg-white/10 transition-colors"
                aria-label="Đọc phản hồi"
                title="Đọc phản hồi"
              >
                <Volume2 className={`h-4 w-4 ${isSpeaking ? "text-gold" : "text-white"}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm">
                    Đang trả lời...
                  </div>
                </div>
              )}
              {voiceError && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{voiceError}</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      recognitionRef.current?.stop();
                      setIsListening(false);
                    } else {
                      startVoiceInput();
                    }
                  }}
                  className={`w-9 h-9 rounded-lg border border-border flex items-center justify-center transition-colors ${
                    isListening ? "bg-red-100 text-red-600" : "bg-muted text-foreground"
                  }`}
                  title={isListening ? "Dừng ghi âm" : "Nhập bằng giọng nói"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
