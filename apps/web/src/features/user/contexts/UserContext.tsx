import { AuthSession } from "@/common-schemas";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useUserSessionStorage } from "../hooks/useUserSessionStorage";

interface UserContext {
  userSessionStorage: ReturnType<typeof useUserSessionStorage>[0];
}

const UserContext = createContext<UserContext | null>(null);

export function UserProvider({ children }: { children?: ReactNode }) {
  const session = useSession();
  const [userSessionStorage, dispatchUserSessionStorage] =
    useUserSessionStorage();

  const user = (() => {
    if (session.data) {
      const authSession = AuthSession.parse(session.data);
      const { user } = authSession;

      return user;
    }

    return null;
  })();

  useEffect(() => {
    if (user) {
      dispatchUserSessionStorage({
        type: "setPreferences",
        raw: user.preferences,
      });
    }
  }, [user, dispatchUserSessionStorage]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      dispatchUserSessionStorage({ type: "clear" });
    }
  }, [session.status, dispatchUserSessionStorage]);

  return (
    <UserContext.Provider
      value={{
        userSessionStorage,
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
