import { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  hydrated: boolean;
  isMobile: boolean;
  tabEnabled: boolean;
  setTabEnabled: (value: boolean) => void;
  indexVisible: boolean;
  setIndexVisible: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [tabEnabled, setTabEnabled] = useState(true);
  const [indexVisible, setIndexVisible] = useState(true);

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
        tabEnabled,
        setTabEnabled,
        indexVisible,
        setIndexVisible,
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
