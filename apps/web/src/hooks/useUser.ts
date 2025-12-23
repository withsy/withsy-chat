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
      const { id, rawPreferences } = authSession.user;

      useUserSessionStorageStore.getState().setPreferences(rawPreferences);
      useUserStore.setState((state) => ({
        ...state,
        id,
      }));
    }
  }, [session.data]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      useUserSessionStorageStore.getState().clear();
      useUserStore.setState(() => ({}));
    }
  }, [session.status]);
}
