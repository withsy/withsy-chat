import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  hydrated: boolean;
  isMobile: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
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
