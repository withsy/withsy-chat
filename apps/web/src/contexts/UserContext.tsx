import { AuthSession } from "@/common-schemas";
import { useUserSessionStore } from "@/stores/useUserSessionStore";
import { useUserStore } from "@/stores/useUserStore";
import { useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";

export function UserProvider({ children }: { children?: ReactNode }) {
  const session = useSession();

  useEffect(() => {
    if (session.data) {
      const authSession = AuthSession.parse(session.data);
      const { user } = authSession;

      useUserSessionStore.getState().setPreferences(user.preferences);
      useUserStore.setState((state) => {
        state.user = user;
      });
    }
  }, [session.data]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      useUserStore.getState().clear();
      useUserSessionStore.getState().clear();
    }
  }, [session.status]);

  return children;
}
