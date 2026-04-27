export interface ChatbotConfig {
  title: string;
  subtitle: string;
  welcomeMessage: string;
  greetingResponse: string;
  fallbackResponse: string;
  knowledgeBase: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export type UseChatlResult = {
  messages: ChatMessage[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
};
