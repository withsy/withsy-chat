// stores/useAvatarStyleStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  style: string;
  setStyle: (style: string) => void;
};

export const useAvatarStyleStore = create<State>()(
  persist(
    (set) => ({
      style: "thumbs",
      setStyle: (style) => set({ style }),
    }),
    {
      name: "avatar-style",
    }
  )
);
