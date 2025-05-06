import type * as Message from "@/types/message";
import { createContext, useContext, useState } from "react";

interface ChatSessionContextType {
  status: Message.Status | null;
  setStatus: (status: Message.Status) => void;
  onRegenerateSuccess: (newMessage: Message.Data) => void;
}

const ChatSessionContext = createContext<ChatSessionContextType | null>(null);

export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error("useChatSession must be used within a ChatSessionProvider");
  }
  return context;
};

interface ChatSessionProviderProps {
  children: React.ReactNode;
  onRegenerateSuccess: (newMessage: Message.Data) => void;
}

export const ChatSessionProvider = ({
  children,
  onRegenerateSuccess,
}: ChatSessionProviderProps) => {
  const [status, setStatus] = useState<Message.Status | null>(null);

  return (
    <ChatSessionContext.Provider
      value={{ status, setStatus, onRegenerateSuccess }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
};
