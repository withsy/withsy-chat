import { PartialError } from "@/components/Error";
import { useUserPreference } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import SidebarChatList from "./SidebarChatList";
import SidebarTooltipList from "./SidebarTooltipList";

export default function Sidebar() {
  const { isMobile, collapsed } = useSidebarStore();
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  const bgStyle = () => {
    if (themeColor == "30,30,30" && themeOpacity == 0) {
      return { backgroundColor: "rgb(248, 248, 247)" };
    }
    return {
      backgroundColor: "white",
      backgroundImage: `linear-gradient(rgba(${themeColor}, ${themeOpacity}), rgba(${themeColor}, ${themeOpacity}))`,
      backgroundBlendMode: "multiply",
    };
  };

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallbackRender={PartialError}>
          <div
            className={cn(
              "fixed top-0 left-0 z-40 flex h-[100dvh] flex-col transition-all duration-300 ease-in-out",
              collapsed && "w-0 overflow-hidden",
              !collapsed && isMobile && "w-[100vw] px-4",
              !collapsed && !isMobile && "w-[240px] flex-shrink-0 px-4",
              "relative",
            )}
            style={bgStyle()}
          >
            <div
              className={cn(
                "relative flex min-h-0 flex-1 flex-col space-y-4 pt-4 pb-4 transition-opacity delay-200 duration-500",
                collapsed ? "pointer-events-none opacity-0" : "opacity-100",
                isMobile && "text-lg",
              )}
            >
              {!collapsed && (
                <>
                  <SidebarTooltipList />
                  <div className="flex-1 overflow-y-auto">
                    <SidebarChatList />
                  </div>
                </>
              )}
            </div>
          </div>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
