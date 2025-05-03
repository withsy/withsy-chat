import { create } from "zustand";
import type { UserAiProfile } from "@/types";

type State = {
  profiles: Record<string, UserAiProfile.Data>;
  isLoading: boolean;
  setProfiles: (profiles: Record<string, UserAiProfile.Data>) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (model: string, profile: UserAiProfile.Data) => void;
  resetProfiles: () => void;
};

export const useAiProfileStore = create<State>((set, get) => ({
  profiles: {},
  isLoading: true,
  setProfiles: (newProfiles) => {
    const current = get().profiles;
    const merged = { ...current, ...newProfiles };
    const same = JSON.stringify(current) === JSON.stringify(merged);
    if (!same) {
      set({ profiles: merged, isLoading: false });
    }
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setProfile: (model, profile) =>
    set((state) => ({
      profiles: { ...state.profiles, [model]: profile },
    })),
  resetProfiles: () => set({ profiles: {}, isLoading: false }),
}));
