import { AuthSession, type ChatData } from "@/common-schemas";
import { useUserSessionStore } from "@/stores/useUserSessionStore";
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
  chatMap: Map<string, ChatData>;
}

const UserContext = createContext<UserContext | null | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const { setPreferences, clear } = useUserSessionStore();

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
      chatMap: new Map(),
    };
  }, [session]);

  useEffect(() => {
    if (context) {
      setPreferences(context.preferencesRaw);
    }
  }, [context, setPreferences]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      clear();
    }
  }, [sessionStatus, clear]);

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
