import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { user } = useUser();
  const { collapsed, setCollapsed, isMobile } = useSidebarStore();
  const pathname = usePathname();
  const themeColor = user?.preferences.themeColor ?? "30,30,30";
  const themeOpacity = user?.preferences.themeOpacity ?? 0;
  const backgroundColor = `rgba(${themeColor}, ${themeOpacity})`;

  const isChatPage =
    pathname?.startsWith("/chat") || pathname?.startsWith("/saved");

  return (
    <div
      className="flex overflow-hidden h-[100dvh] relative"
      style={isChatPage ? { backgroundColor } : {}}
    >
      <Sidebar isChatPage={isChatPage} />

      {isMobile && !collapsed && (
        <div
          className={cn(
            "fixed inset-0 bg-black/30 z-30 transition-opacity duration-300",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className="flex flex-col flex-1 h-full z-20">
        <Main>{children}</Main>
      </div>
    </div>
  );
}
