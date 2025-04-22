// stores/useSelectedModelStore.ts
import { Model } from "@/types/model";
import { create } from "zustand";

const STORAGE_KEY = "selectedChatModel";

type SelectedModelState = {
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
};

export const useSelectedModelStore = create<SelectedModelState>((set) => ({
  selectedModel: "gemini-2.0-flash",
  setSelectedModel: (model) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, model);
    }
    set({ selectedModel: model });
  },
}));

// Only run in browser
if (typeof window !== "undefined") {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      useSelectedModelStore.setState({ selectedModel: Model.parse(stored) });
    } catch (e) {
      console.warn("Failed to parse stored model:", e);
    }
  }
}
