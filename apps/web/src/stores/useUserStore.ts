import { create } from "zustand";
import { devtools } from "zustand/middleware";

const STORE_NAME = "user";

interface UserStore {}

export const useUserStore = create<UserStore>()(
  devtools((set, get) => ({}), {
    name: STORE_NAME,
  }),
);
