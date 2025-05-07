import { useTRPC } from "@/lib/trpc";
import { UserPrefs, type UserData, type UserUpdatePrefs } from "@/types/user";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
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
  user: UserData | null;
  setUser: (user: UserData) => void;
  setUserPrefsAndSave: SetUserPrefsAndSave;
  userPrefLoadings: UserPrefLoadings;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const [userPrefLoadings, setUserPrefLoadings] = useState<UserPrefLoadings>(
    {}
  );
  const [user, setUser] = useState<UserData | null>(null);
  const userGet = useQuery(
    trpc.user.get.queryOptions(session ? undefined : skipToken)
  );

  const updateUserPrefs = useMutation(
    trpc.user.updatePrefs.mutationOptions({
      onMutate: async (input: UserUpdatePrefs) => {
        if (!user) throw new Error("User is not set.");
        const previous = UserPrefs.parse(
          JSON.parse(JSON.stringify(user.preferences))
        );

        const inputs = Object.entries(input).filter(
          ([_, v]) => v !== undefined
        );
        inputs.forEach(([k, v]) => Reflect.set(user.preferences, k, v));

        const loadings = inputs.map(([k, _]) => [k, true]);
        setUserPrefLoadings((p) => ({
          ...p,
          ...Object.fromEntries(loadings),
        }));
        return { previous, loadings };
      },
      onSettled(data, error, ___, ctx) {
        if (!user) return;

        if (data)
          setUser({
            ...user,
            preferences: data.preferences,
          });

        if (error && ctx?.previous) {
          setUser({
            ...user,
            preferences: ctx.previous,
          });
        }

        if (ctx?.loadings) {
          setUserPrefLoadings((p) => ({
            ...p,
            ...Object.fromEntries(ctx.loadings.map(([k, _]) => [k, false])),
          }));
        }
      },
    })
  );

  useEffect(() => {
    if (!userGet.data) return;
    setUser(userGet.data);
  }, [userGet.data]);

  const setUserPrefsAndSave: SetUserPrefsAndSave = (input) => {
    updateUserPrefs.mutate(input);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
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
