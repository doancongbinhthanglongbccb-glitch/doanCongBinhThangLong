import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHAT_PROMPT = {
  showDelayMinMs: 4500,
  showDelayMaxMs: 6500,
  autoHideMs: 4500,
  positionClassName: "fixed bottom-24 right-5 z-40 max-w-[240px]",
  text: "Bạn có cần trợ giúp không?",
  ariaLabel: "Đóng lời nhắc",
  dismissTitle: "Đóng",
} as const;

const ThinkingDots = () => (
  <div className="flex gap-1 mb-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-slate-400 rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
      />
    ))}
  </div>
);

const ChatPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const delay =
      Math.random() * (CHAT_PROMPT.showDelayMaxMs - CHAT_PROMPT.showDelayMinMs) + CHAT_PROMPT.showDelayMinMs;

    let hideTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      setShowPrompt(true);

      hideTimer = window.setTimeout(() => {
        setShowPrompt(false);
      }, CHAT_PROMPT.autoHideMs);
    }, delay);

    return () => {
      window.clearTimeout(showTimer);
      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={CHAT_PROMPT.positionClassName}
        >
          <div className="mb-1 flex justify-end pr-2">
            <ThinkingDots />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 pr-8 shadow-lg">
              <span className="text-[13px] font-medium leading-5 text-slate-700">{CHAT_PROMPT.text}</span>
              <button
                onClick={handleDismiss}
                className="absolute right-1.5 top-1.5 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label={CHAT_PROMPT.ariaLabel}
                title={CHAT_PROMPT.dismissTitle}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute -bottom-1 right-5 h-3 w-3 rotate-45 border-b border-r border-slate-200 bg-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPrompt;
