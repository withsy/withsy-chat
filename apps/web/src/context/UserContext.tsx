import { AuthSession } from "@/common/schemas";
import { useUserPreferencesStore } from "@/stores/useUserPreferencesStore";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

interface UserContext {
  id: AuthSession["user"]["id"];
  preferencesRaw: AuthSession["user"]["preferencesRaw"];
  preferenceIsFetchingSet: Set<string>;
}

const UserContext = createContext<UserContext | null | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const { set: setUserPreferences, reset: resetUserPreferences } =
    useUserPreferencesStore();

  const context: UserContext | null = useMemo(() => {
    if (!session) {
      return null;
    }

    const authSession = AuthSession.parse(session);
    const { id, preferencesRaw } = authSession.user;

    return {
      id,
      preferencesRaw,
      preferenceIsFetchingSet: new Set(),
    };
  }, [session]);

  useEffect(() => {
    if (context) {
      setUserPreferences(context.preferencesRaw);
    }
  }, [context, setUserPreferences]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      resetUserPreferences();
    }
  }, [sessionStatus, resetUserPreferences]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserContext | null {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserContext.");
  }

  return context;
}
