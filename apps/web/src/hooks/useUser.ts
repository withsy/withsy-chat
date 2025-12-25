import { AuthSession } from "@/common-schemas";
import { useUserSessionStorageStore } from "@/stores/useUserSessionStorageStore";
import { useUserStore } from "@/stores/useUserStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useUser() {
  const session = useSession();

  useEffect(() => {
    if (session.data) {
      const authSession = AuthSession.parse(session.data);
      const { user } = authSession;

      useUserSessionStorageStore.getState().setPreferences(user.preferences);
      useUserStore.setState((state) => {
        state.user = user;
      });
    }
  }, [session.data]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      useUserStore.getState().clear();
      useUserSessionStorageStore.getState().clear();
    }
  }, [session.status]);
}
