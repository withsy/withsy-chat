import { AuthSession, type UserPreferenceKey } from "@/common-schemas";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useUserSessionStorage } from "../hooks/useUserSessionStorage";

type UserPreferencePending = {
  data: Set<UserPreferenceKey>;
};

interface UserContext {
  userId: string;
  sessionStorage: ReturnType<typeof useUserSessionStorage>;
  preferencePending: UserPreferencePending;
  SetPreferencePending: Dispatch<SetStateAction<UserPreferencePending>>;
}

const UserContext = createContext<UserContext | null>(null);

export function UserProvider({ children }: { children?: ReactNode }) {
  const session = useSession();
  const sessionStorage = useUserSessionStorage();
  const { setPreferences: setUserPreferences, clear: clearUserSessionStorage } =
    sessionStorage;
  const [preferencePending, SetPreferencePending] =
    useState<UserPreferencePending>({ data: new Set() });

  const user = useMemo(() => {
    if (session.data) {
      const authSession = AuthSession.parse(session.data);
      const { user } = authSession;

      return user;
    }

    return null;
  }, [session.data]);

  useEffect(() => {
    if (user) {
      setUserPreferences(user.preferences);
    }
  }, [user, setUserPreferences]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      clearUserSessionStorage();
    }
  }, [session.status, clearUserSessionStorage]);

  return (
    <UserContext.Provider
      value={useMemo(
        () => ({
          userId: user?.id ?? "",
          sessionStorage,
          preferencePending,
          SetPreferencePending,
        }),
        [user, sessionStorage, preferencePending],
      )}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext(): UserContext {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("Invalid UserContext.");
  }

  return context;
}
