import { AuthSession } from "@/common/schemas";
import { useUserPreferencesStore } from "@/stores/useUserPreferencesStore";
import { useSession } from "next-auth/react";
import { createContext, useContext, useMemo, type ReactNode } from "react";

interface UserContext {
  id: AuthSession["user"]["id"];
  preferencesRaw: AuthSession["user"]["preferencesRaw"];
  preferenceIsFetchingSet: Set<string>;
}

const UserContext = createContext<UserContext | null | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const value: UserContext | null = useMemo(() => {
    if (session) {
      const authSession = AuthSession.parse(session);
      const { id, preferencesRaw } = authSession.user;

      return {
        id,
        preferencesRaw,
        preferenceIsFetchingSet: new Set(),
      };
    } else {
      useUserPreferencesStore.getState().reset();
      return null;
    }
  }, [session]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContext | null {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserContext.");
  }

  return context;
}
