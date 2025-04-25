import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { HeaderTooltipGroup } from "../HeaderTooltip";
import SidebarChatList from "./SidebarChatList";

export default function Sidebar({ isChatPage }: { isChatPage: boolean }) {
  const { isMobile, collapsed } = useSidebarStore();
  const { userPrefs } = useUser();
  const { themeColor, themeOpacity } = userPrefs;

  const bgStyle = () => {
    if (isChatPage) {
      if (themeColor == "30,30,30" && themeOpacity == 0) {
        return { backgroundColor: "rgb(248, 248, 247)" };
      }
      return {
        backgroundColor: "white",
        backgroundImage: `linear-gradient(rgba(${themeColor}, ${themeOpacity}), rgba(${themeColor}, ${themeOpacity}))`,
        backgroundBlendMode: "multiply",
      };
    } else {
      return { backgroundColor: "rgb(248, 248, 247)" };
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <HeaderTooltipGroup />
      </div>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out h-[100dvh] pt-16 fixed top-0 left-0 z-40 flex flex-col",
          collapsed && "w-0 overflow-hidden",
          !collapsed && isMobile && "w-[100vw] px-4",
          !collapsed && !isMobile && "w-[240px] px-4"
        )}
        style={bgStyle()}
      >
        <div
          className={cn(
            "transition-opacity duration-500 delay-200 flex-1 flex flex-col min-h-0 pb-4 relative",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
            isMobile && "text-lg"
          )}
        >
          {!collapsed && (
            <div className="flex-1 overflow-y-auto">
              <SidebarChatList />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
