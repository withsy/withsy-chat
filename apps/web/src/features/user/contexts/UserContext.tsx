import { AuthSession } from "@/common-schemas";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useUserPreferencesPending,
  type UserPreferencesPending,
} from "../hooks/_useUserPreferencesPending";
import {
  useUserSessionStorage,
  type UserSessionStorage,
} from "../hooks/_useUserSessionStorage";

interface UserContext {
  userId: string;
  userSessionStorage: UserSessionStorage;
  userPreferencesPending: UserPreferencesPending;
}

const UserContext = createContext<UserContext | null>(null);

export function UserProvider({ children }: { children?: ReactNode }) {
  const session = useSession();
  const userSessionStorage = useUserSessionStorage();
  const userPreferencesPending = useUserPreferencesPending();

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
      userSessionStorage.dispatch({
        kind: "setPreferences",
        raw: user.preferences,
      });
    }
  }, [user, userSessionStorage]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      userSessionStorage.dispatch({ kind: "clear" });
    }
  }, [session.status, userSessionStorage]);

  return (
    <UserContext.Provider
      value={useMemo(() => {
        return {
          userId: user?.id ?? "",
          userSessionStorage,
          userPreferencesPending,
        };
      }, [user, userSessionStorage, userPreferencesPending])}
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
