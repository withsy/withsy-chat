import { create } from "zustand";

interface UserContext {}

export const useUserStore = create<UserContext>((setState, getState) => ({}));
