import { create } from "zustand";
import { devtools } from "zustand/middleware";

const STORE_NAME = "user";

// TODO: UserContext에서 상태와 훅 분리.
interface UserStore {}

export const useUserStore = create<UserStore>()(
  devtools((set, get) => ({}), {
    name: STORE_NAME,
  }),
);
