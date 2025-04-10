export type ChatMessage = {
  id: string;
  chatId: string;
  userId?: string;
  isAI: boolean;
  model?: string;
  content: string;
  createdAt: string;
  parentId?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};
