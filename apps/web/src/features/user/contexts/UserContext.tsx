import { AuthSession } from "@/common-schemas";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  useUserPreferencesPending,
  type DispatchUserPreferencesPending,
  type UserPreferencesPending,
} from "../hooks/_useUserPreferencesPending";
import {
  useUserSessionStorage,
  type DispatchUserSessionStorage,
  type UserSessionStorage,
} from "../hooks/_useUserSessionStorage";

interface UserContext {
  userId: string;
  userSessionStorage: UserSessionStorage;
  dispatchUserSessionStorage: DispatchUserSessionStorage;
  userPreferencesPending: UserPreferencesPending;
  dispatchUserPreferencesPending: DispatchUserPreferencesPending;
}

const UserContext = createContext<UserContext | null>(null);

export function UserProvider({ children }: { children?: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [userSessionStorage, dispatchUserSessionStorage] =
    useUserSessionStorage();
  const [userPreferencesPending, dispatchUserPreferencesPending] =
    useUserPreferencesPending();

  let user = null;
  if (session) {
    const authSession = AuthSession.parse(session);
    user = authSession.user;
  }

  useEffect(() => {
    if (user) {
      dispatchUserSessionStorage({
        kind: "setPreferences",
        raw: user.preferences,
      });
    }
  }, [user, dispatchUserSessionStorage]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      dispatchUserSessionStorage({ kind: "clear" });
    }
  }, [sessionStatus, dispatchUserSessionStorage]);

  return (
    <UserContext.Provider
      value={{
        userId: user?.id ?? "",
        userSessionStorage,
        dispatchUserSessionStorage,
        userPreferencesPending,
        dispatchUserPreferencesPending,
      }}
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
