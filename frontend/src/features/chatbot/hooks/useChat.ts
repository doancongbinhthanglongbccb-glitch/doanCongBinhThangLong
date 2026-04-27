import { useState, useCallback, useRef } from "react";
import { findAnswer } from "../services/chat.service";
import type { ChatMessage, ChatbotConfig } from "../types/chat.types";

type UseChatProps = {
  config: ChatbotConfig;
};

type UseChatlResult = {
  messages: ChatMessage[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
};

export const useChat = ({ config }: UseChatProps): UseChatlResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: config.welcomeMessage,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messageIdRef = useRef(0);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      setIsLoading(true);

      try {
        // Add user message
        const userMessageId = `msg-${++messageIdRef.current}`;
        setMessages((prev) => [
          ...prev,
          {
            id: userMessageId,
            role: "user",
            content: userMessage,
            timestamp: new Date().toISOString(),
          },
        ]);

        setInput("");

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Generate bot response
        const botResponse = findAnswer(userMessage, config);
        const botMessageId = `msg-${++messageIdRef.current}`;

        setMessages((prev) => [
          ...prev,
          {
            id: botMessageId,
            role: "assistant",
            content: botResponse,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: config.welcomeMessage,
      },
    ]);
  }, [config.welcomeMessage]);

  return {
    messages,
    isLoading,
    input,
    setInput,
    sendMessage,
    clearMessages,
  };
};
