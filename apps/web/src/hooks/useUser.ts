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
      const { preferences } = authSession.user;

      useUserSessionStorageStore.getState().setPreferences(preferences);
      useUserStore.getState().setId(id);
    }
  }, [session.data]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      useUserSessionStorageStore.getState().clear();
      useUserStore.getState().clear();
    }
  }, [session.status]);
}
