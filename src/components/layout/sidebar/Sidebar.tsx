import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import SidebarChatList from "./SidebarChatList";
import { SidebarTooltipGroup } from "./SidebarTooltip";

export default function Sidebar() {
  const { isMobile, collapsed, toggle, userPrefs } = useSidebar();
  const { largeText, themeColor, themeOpacity } = userPrefs;

  return (
    <>
      <div className="fixed top-4 left-4 w-[60px] z-50 flex flex-row items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn("rounded-md group hover:bg-transparent")}
        >
          {collapsed ? (
            <PanelRightClose
              size={16}
              className="transition-colors group-hover:text-black text-gray-500"
            />
          ) : (
            <PanelRightOpen
              size={16}
              className="transition-colors group-hover:text-black text-gray-500"
            />
          )}
        </Button>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out h-screen pt-16 fixed top-0 left-0 z-40 flex flex-col",
          largeText ? "text-lg" : "text-base",
          collapsed && "w-0 overflow-hidden",
          !collapsed && isMobile && "z-20 w-[100vw]  px-4",
          !collapsed && !isMobile && "z-20 w-[240px] px-4"
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
              <SidebarTooltipGroup />
              <div className="flex-1 overflow-y-auto">
                <SidebarChatList />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
