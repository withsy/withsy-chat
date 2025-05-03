import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserAiProfile } from "@/types";

type State = {
  profiles: Record<string, UserAiProfile.Data>;
  isLoading: boolean;
  setProfiles: (profiles: Record<string, UserAiProfile.Data>) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (model: string, profile: UserAiProfile.Data) => void;
};

export const useAiProfileStore = create<State>()(
  persist(
    (set, get) => ({
      profiles: {},
      isLoading: true,
      setProfiles: (newProfiles) => {
        const current = get().profiles;
        const same = JSON.stringify(current) === JSON.stringify(newProfiles);
        if (!same) {
          set({ profiles: newProfiles, isLoading: false });
        }
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setProfile: (model, profile) =>
        set((state) => ({
          profiles: { ...state.profiles, [model]: profile },
        })),
    }),
    {
      name: "ai-profiles", // localStorage key
    }
  )
);
