// Components - re-export from shared for now
export { default as ChatWidget } from "@/shared/components/Chatbot";
export { default as ChatPrompt } from "@/components/ChatPrompt";

// Hooks
export { useChat } from "./hooks/useChat";

// Services
export * as chatService from "./services/chat.service";

// Types
export type { ChatMessage, ChatbotConfig, UseChatlResult } from "./types/chat.types";
