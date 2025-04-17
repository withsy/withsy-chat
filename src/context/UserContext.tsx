import { trpc } from "@/lib/trpc";
import {
  UserPreferences,
  UserSession,
  type UpdateUserPrefs,
} from "@/types/user";
import { skipToken } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type UserPrefLoadings = Partial<Record<keyof UpdateUserPrefs, boolean>>;
type SetUserPrefAndSave = <K extends keyof UpdateUserPrefs>(
  key: K,
  value: UpdateUserPrefs[K]
) => void;

type UserContextType = {
  userSession: UserSession | null;
  userPrefs: UserPreferences;
  setUserPrefAndSave: SetUserPrefAndSave;
  userPrefLoadings: UserPrefLoadings;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(
    UserPreferences.parse({})
  );
  const [userPrefLoadings, setUserPrefLoadings] = useState<UserPrefLoadings>(
    {}
  );

  const userPrefsQuery = trpc.user.prefs.useQuery(
    userSession ? undefined : skipToken
  );
  const updateUserPrefs = trpc.user.updatePrefs.useMutation();

  useEffect(() => {
    if (!session) return;
    const userSession = UserSession.parse(session);
    setUserSession(userSession);
  }, [session]);

  useEffect(() => {
    if (!userPrefsQuery.data) return;
    const prefs = UserPreferences.parse(userPrefsQuery.data);
    setUserPrefs(prefs);
  }, [userPrefsQuery.data]);

  const setUserPrefAndSave: SetUserPrefAndSave = (k, v) => {
    const prevValue = userPrefs[k];

    setUserPrefs((prev) => ({ ...prev, [k]: v }));
    setUserPrefLoadings((prev) => ({ ...prev, [k]: true }));

    updateUserPrefs.mutate(
      { [k]: v },
      {
        onSettled: () =>
          setUserPrefLoadings((prev) => ({ ...prev, [k]: false })),
        onError: () => setUserPrefs((prev) => ({ ...prev, [k]: prevValue })),
      }
    );
  };

  return (
    <UserContext.Provider
      value={{
        userSession,
        userPrefs,
        setUserPrefAndSave,
        userPrefLoadings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
