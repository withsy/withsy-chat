import type * as Message from "@/types/message";
import { createContext, useContext, useState } from "react";

interface ChatSessionContextType {
  status: MessageStatus | null;
  setStatus: (status: MessageStatus) => void;
  onRegenerateSuccess: (newMessage: MessageData) => void;
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
  onRegenerateSuccess: (newMessage: MessageData) => void;
}

export const ChatSessionProvider = ({
  children,
  onRegenerateSuccess,
}: ChatSessionProviderProps) => {
  const [status, setStatus] = useState<MessageStatus | null>(null);

  return (
    <ChatSessionContext.Provider
      value={{ status, setStatus, onRegenerateSuccess }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
};
