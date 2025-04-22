import { create } from "zustand";

type DrawerState = {
  openDrawer: string | null;
  setOpenDrawer: (value: string | null) => void;
};

export const useDrawerStore = create<DrawerState>((set) => ({
  openDrawer: null,
  setOpenDrawer: (value) => set({ openDrawer: value }),
}));
