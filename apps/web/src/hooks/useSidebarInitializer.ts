import { useSidebarStore } from "@/stores/useSidebarStore";
import { useEffect } from "react";

export const useSidebarInitializer = () => {
  const { setIsMobile, setCollapsed, setHydrated } = useSidebarStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile]);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
    setHydrated(true);
  }, [setCollapsed, setHydrated]);

  useEffect(() => {
    const unsub = useSidebarStore.subscribe(
      (state) => state.collapsed,
      (collapsed) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("sidebarCollapsed", String(collapsed));
        }
      }
    );
    return () => unsub();
  }, []);
};
