import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import SidebarChatList from "./SidebarChatList";

export default function Sidebar() {
  const { isMobile, collapsed, userPrefs } = useSidebar();
  const { largeText, themeColor, themeOpacity } = userPrefs;

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out h-screen pt-16 fixed top-0 left-0 z-100 flex flex-col",
        largeText ? "text-lg" : "text-base",
        collapsed && "w-0 overflow-hidden",
        !collapsed && isMobile && "w-[100vw]  px-4",
        !collapsed && !isMobile && "w-[240px] px-4"
      )}
      style={{
        backgroundColor: "white",
        backgroundImage: `linear-gradient(rgba(${themeColor}, ${themeOpacity}), rgba(${themeColor}, ${themeOpacity}))`,
        backgroundBlendMode: "multiply",
      }}
    >
      <div
        className={cn(
          "transition-opacity duration-500 delay-200 flex-1 flex flex-col min-h-0 pb-4 relative",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {!collapsed && (
          <>
            <div className="flex-1 overflow-y-auto">
              <SidebarChatList />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
