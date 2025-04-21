import { ChatModel } from "@/types/chat";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "selectedChatModel";

type SelectedModelContextType = {
  selectedModel: ChatModel;
  setSelectedModel: (model: ChatModel) => void;
};

const SelectedModelContext = createContext<
  SelectedModelContextType | undefined
>(undefined);

export const SelectedModelProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedModel, setSelectedModelState] =
    useState<ChatModel>("gemini-2.0-flash");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSelectedModelState(stored as ChatModel);
    }
  }, []);

  const setSelectedModel = (model: ChatModel) => {
    setSelectedModelState(model);
    localStorage.setItem(STORAGE_KEY, model);
  };

  return (
    <SelectedModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </SelectedModelContext.Provider>
  );
};

export const useSelectedModel = () => {
  const context = useContext(SelectedModelContext);
  if (!context) {
    throw new Error(
      "useSelectedModel must be used within a SelectedModelProvider"
    );
  }
  return context;
};
