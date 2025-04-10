import type { ChatMessage } from "@/types/chat";

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg1",
    chatId: "chat-001",
    userId: "user-001",
    isAI: false,
    content: "Can you explain the difference between GPT-3.5 and GPT-4?",
    createdAt: "2025-04-09T09:00:00Z",
  },
  {
    id: "msg2",
    chatId: "chat-001",
    isAI: true,
    model: "gpt-3.5",
    content:
      "Sure! GPT-4 generally has better reasoning, longer context support, and improved performance on many benchmarks compared to GPT-3.5.",
    createdAt: "2025-04-09T09:00:03Z",
    usage: {
      promptTokens: 21,
      completionTokens: 57,
      totalTokens: 78,
    },
  },

  {
    id: "msg3",
    chatId: "chat-001",
    userId: "user-001",
    isAI: false,
    content: "Can you give me an example answer using GPT-4 instead?",
    createdAt: "2025-04-09T09:01:15Z",
  },
  {
    id: "msg4",
    chatId: "chat-001",
    isAI: true,
    model: "gpt-4",
    content:
      "Of course! Here's an example:\n\n> GPT-4 is designed to handle more nuanced prompts and provide more accurate answers over longer text spans.",
    createdAt: "2025-04-09T09:01:18Z",
    usage: {
      promptTokens: 32,
      completionTokens: 85,
      totalTokens: 117,
    },
  },

  {
    id: "msg5",
    chatId: "chat-001",
    isAI: true,
    model: "system",
    content: "You switched to GPT-4 for this conversation.",
    createdAt: "2025-04-09T09:01:20Z",
  },

  {
    id: "msg6",
    chatId: "chat-001",
    userId: "user-001",
    isAI: false,
    content: "Can you break that down further?",
    createdAt: "2025-04-09T09:02:10Z",
    parentId: "msg4",
  },
  {
    id: "msg7",
    chatId: "chat-001",
    isAI: true,
    model: "gpt-4",
    content:
      "Sure! Here's a breakdown:\n\n- GPT-4 supports longer context windows\n- Handles ambiguous prompts better\n- Produces more structured outputs",
    createdAt: "2025-04-09T09:02:13Z",
    parentId: "msg6", // reply to reply (deep thread)
    usage: {
      promptTokens: 28,
      completionTokens: 62,
      totalTokens: 90,
    },
  },

  {
    id: "msg8",
    chatId: "chat-001",
    userId: "user-001",
    isAI: false,
    content: "Cool 😎 that helps a lot!",
    createdAt: "2025-04-09T09:03:00Z",
  },
  {
    id: "msg9",
    chatId: "chat-001",
    isAI: true,
    model: "gpt-4",
    content:
      "Glad to hear that! Let me know if you need help with anything else.",
    createdAt: "2025-04-09T09:03:04Z",
  },
];
