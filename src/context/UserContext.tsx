import { trpc } from "@/lib/trpc";
import type { User } from "@/types/user";
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
  user: User | null;
  userSession: UserSession | null;
  userPrefs: UserPreferences;
  setUserPrefAndSave: SetUserPrefAndSave;
  userPrefLoadings: UserPrefLoadings;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userPrefs, setUserPrefs] = useState(UserPreferences.parse({}));
  const [userPrefLoadings, setUserPrefLoadings] = useState<UserPrefLoadings>(
    {}
  );

  const userMe = trpc.user.me.useQuery(userSession ? undefined : skipToken);
  const updateUserPrefs = trpc.user.updatePrefs.useMutation();

  useEffect(() => {
    if (!session) return;
    const userSession = UserSession.parse(session);
    if (!userSession.user?.id) return;
    setUserSession(userSession);
  }, [session]);

  useEffect(() => {
    if (!userMe.data) return;
    setUser(userMe.data);
    setUserPrefs(userMe.data.preferences);
  }, [userMe]);

  const setUserPrefAndSave: SetUserPrefAndSave = (key, value) => {
    const prevValue = userPrefs[key];

    setUserPrefs((prev) => ({ ...prev, [key]: value }));
    setUserPrefLoadings((prev) => ({ ...prev, [key]: true }));

    updateUserPrefs.mutate(
      { [key]: value },
      {
        onSettled: () => {
          setUserPrefLoadings((prev) => ({ ...prev, [key]: false }));
        },
        onError: () => {
          setUserPrefs((prev) => ({ ...prev, [key]: prevValue }));
        },
      }
    );
  };

  return (
    <UserContext.Provider
      value={{
        user,
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
