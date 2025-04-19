import { trpc } from "@/lib/trpc";
import { UserPrefs, UserSession, type UpdateUserPrefs } from "@/types/user";
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
type SetUserPrefsAndSave = (input: UpdateUserPrefs) => void;

type UserContextType = {
  userSession: UserSession | null;
  userPrefs: UserPrefs;
  setUserPrefsAndSave: SetUserPrefsAndSave;
  userPrefLoadings: UserPrefLoadings;
};

const DEFAULT_USER_PREFS = UserPrefs.parse({});

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession({
    required: true
  });
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userPrefLoadings, setUserPrefLoadings] = useState<UserPrefLoadings>(
    {}
  );
  const utils = trpc.useUtils();
  const _userPrefsQuery = trpc.user.prefs.useQuery(
    userSession ? undefined : skipToken
  );
  const updateUserPrefs = trpc.user.updatePrefs.useMutation({
    onMutate: async (input: UpdateUserPrefs) => {
      const inputs = Object.entries(input).filter(([_, v]) => v !== undefined);
      await utils.user.prefs.cancel();
      const previous = utils.user.prefs.getData();
      utils.user.prefs.setData(undefined, (old) => {
        if (old) inputs.forEach(([k, v]) => Reflect.set(old, k, v));
        return old;
      });
      const loadingOns = inputs.map(([k, _]) => [k, true]);
      setUserPrefLoadings((p) => ({
        ...p,
        ...Object.fromEntries(loadingOns),
      }));
      return { previous, loadingOns };
    },
    onError(_, __, ctx) {
      if (ctx?.previous) utils.user.prefs.setData(undefined, ctx.previous);
    },
    onSettled(_, __, ___, ctx) {
      utils.user.prefs.invalidate();
      if (ctx?.loadingOns) {
        const loadingOffs = Object.fromEntries(
          ctx.loadingOns.map(([k, _]) => [k, false])
        );
        setUserPrefLoadings((p) => ({
          ...p,
          ...loadingOffs,
        }));
      }
    },
  });

  useEffect(() => {
    if (!session) return;
    const userSession = UserSession.parse(session);
    setUserSession(userSession);
  }, [session]);

  const setUserPrefsAndSave: SetUserPrefsAndSave = (input) => {
    updateUserPrefs.mutate(input);
  };

  const userPrefs = new Proxy(
    {},
    {
      get(_, p) {
        const previous = utils.user.prefs.getData();
        return Reflect.get(previous ?? DEFAULT_USER_PREFS, p);
      },
    }
  ) as UserPrefs;

  return (
    <UserContext.Provider
      value={{
        userSession,
        userPrefs,
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
