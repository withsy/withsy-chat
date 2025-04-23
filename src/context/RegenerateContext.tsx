import type { ChatMessage } from "@/types/chat";
import { createContext, useContext } from "react";

interface RegenerateContextType {
  onRegenerateSuccess: (newMessage: ChatMessage) => void;
}

const RegenerateContext = createContext<RegenerateContextType | null>(null);

export const RegenerateProvider = ({
  children,
  onRegenerateSuccess,
}: {
  children: React.ReactNode;
  onRegenerateSuccess: (newMessages: ChatMessage) => void;
}) => (
  <RegenerateContext.Provider value={{ onRegenerateSuccess }}>
    {children}
  </RegenerateContext.Provider>
);

export const useRegenerate = () => {
  const context = useContext(RegenerateContext);
  if (!context) {
    throw new Error("useRegenerate must be used within a RegenerateProvider");
  }
  return context;
};
