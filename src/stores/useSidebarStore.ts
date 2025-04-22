import { create } from "zustand";

type SidebarState = {
  collapsed: boolean;
  hydrated: boolean;
  isMobile: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  setIsMobile: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: true,
  hydrated: false,
  isMobile: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (value) => set({ collapsed: value }),
  setIsMobile: (value) => set({ isMobile: value }),
  setHydrated: (value) => set({ hydrated: value }),
}));
