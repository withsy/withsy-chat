import { Model } from "@/types/model";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "selectedChatModel";

type SelectedModelContextType = {
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
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
    useState<Model>("gemini-2.0-flash");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSelectedModelState(Model.parse(stored));
    }
  }, []);

  const setSelectedModel = (model: Model) => {
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
