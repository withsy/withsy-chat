import {
  trpc,
  type UserMe,
  type UserPrefs,
  type UserUpdatePrefs,
} from "@/lib/trpc";
import { createContext, useContext, useEffect, useState } from "react";

type UserPrefLoadings = Partial<Record<keyof UserUpdatePrefs, boolean>>;
type SetUserPrefAndSave = <K extends keyof UserUpdatePrefs>(
  key: K,
  value: UserUpdatePrefs[K]
) => void;

type SidebarContextType = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  hydrated: boolean;

  isMobile: boolean;

  userPrefs: UserPrefs;
  setUserPrefAndSave: SetUserPrefAndSave;
  userPrefLoadings: UserPrefLoadings;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({
  userMe,
  children,
}: {
  userMe: UserMe;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const [userPrefs, setUserPrefs] = useState(userMe.preferences);
  const userPrefsMut = trpc.user.updatePrefs.useMutation();
  const [userPrefLoadings, setUserPrefLoadings] = useState<UserPrefLoadings>(
    {}
  );

  const setUserPrefAndSave: SetUserPrefAndSave = <
    K extends keyof UserUpdatePrefs
  >(
    key: K,
    value: UserUpdatePrefs[K]
  ) => {
    const prevValue = userPrefs[key];

    setUserPrefs((prev) => ({ ...prev, [key]: value }));
    setUserPrefLoadings((prev) => ({ ...prev, [key]: true }));

    userPrefsMut.mutate(
      { [key]: value },
      {
        onSettled: () =>
          setUserPrefLoadings((prev) => ({ ...prev, [key]: false })),
        onError: () => setUserPrefs((prev) => ({ ...prev, [key]: prevValue })),
      }
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("sidebarCollapsed", String(collapsed));
    }
  }, [collapsed, hydrated]);

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggle,
        setCollapsed,
        hydrated,
        isMobile,
        userPrefs,
        setUserPrefAndSave,
        userPrefLoadings,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}
