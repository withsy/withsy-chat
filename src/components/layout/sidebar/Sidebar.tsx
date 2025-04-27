import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import SidebarChatList from "./SidebarChatList";
import SidebarTooltipList from "./SidebarTooltipList";

export default function Sidebar() {
  const { isMobile, collapsed } = useSidebarStore();
  const { user } = useUser();
  if (!user) return null;

  const { themeColor, themeOpacity } = user.preferences;

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
    <div
      className={cn(
        "transition-all duration-300 ease-in-out h-[100dvh] fixed top-0 left-0 z-40 flex flex-col",
        collapsed && "w-0 overflow-hidden",
        !collapsed && isMobile && "w-[100vw] px-4",
        !collapsed && !isMobile && "w-[240px] px-4",
        "relative"
      )}
      style={bgStyle()}
    >
      <div
        className={cn(
          "transition-opacity duration-500 delay-200 flex-1 flex flex-col min-h-0 pt-4 pb-4 relative space-y-4",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
          isMobile && "text-lg"
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
  );
}
