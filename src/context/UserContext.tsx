import { FullPageLoading } from "@/components/Loading";
import { trpc } from "@/lib/trpc";
import { User, UserPrefs, type UserUpdatePrefs } from "@/types/user";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type UserPrefLoadings = Partial<Record<keyof UserUpdatePrefs, boolean>>;
type SetUserPrefsAndSave = (input: UserUpdatePrefs) => void;

type UserContextType = {
  user: User | null;
  onSignOut: () => void;
  setUserPrefsAndSave: SetUserPrefsAndSave;
  userPrefLoadings: UserPrefLoadings;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [userPrefLoadings, setUserPrefLoadings] = useState<UserPrefLoadings>(
    {}
  );
  const [user, setUser] = useState<User | null>(null);

  const userEnsure = trpc.user.ensure.useMutation({
    onSuccess: (data) => setUser(data),
  });

  const updateUserPrefs = trpc.user.updatePrefs.useMutation({
    onMutate: async (input: UserUpdatePrefs) => {
      if (!user) throw new Error("User is not set.");
      const previous = UserPrefs.parse(
        JSON.parse(JSON.stringify(user.preferences))
      );

      const inputs = Object.entries(input).filter(([_, v]) => v !== undefined);
      inputs.forEach(([k, v]) => Reflect.set(user.preferences, k, v));

      const loadings = inputs.map(([k, _]) => [k, true]);
      setUserPrefLoadings((p) => ({
        ...p,
        ...Object.fromEntries(loadings),
      }));
      return { previous, loadings };
    },
    onError(_, __, ctx) {
      if (!user) throw new Error("User is not set.");

      if (ctx?.previous)
        setUser({
          ...user,
          preferences: ctx.previous,
        });
    },
    onSettled(data, __, ___, ctx) {
      if (!user) throw new Error("User is not set.");

      if (data)
        setUser({
          ...user,
          preferences: data.preferences,
        });

      if (ctx?.loadings) {
        setUserPrefLoadings((p) => ({
          ...p,
          ...Object.fromEntries(ctx.loadings.map(([k, _]) => [k, false])),
        }));
      }
    },
  });

  useEffect(() => {
    if (!session) return;

    let language: string | undefined = undefined;
    try {
      language = navigator.language;
    } catch (e) {
      void e;
    }

    let timezone: string | undefined = undefined;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      void e;
    }

    userEnsure.mutate({ language, timezone });
  }, [session]);

  const setUserPrefsAndSave: SetUserPrefsAndSave = (input) => {
    updateUserPrefs.mutate(input);
  };

  const isLoading = status === "loading" || userEnsure.isPending;
  if (isLoading) return <FullPageLoading />;

  return (
    <UserContext.Provider
      value={{
        user,
        onSignOut: () => setUser(null),
        setUserPrefsAndSave,
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
