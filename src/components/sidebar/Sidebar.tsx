import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import SidebarChatList from "@/components/sidebar/SidebarChatList";
import { SidebarTooltipGroup } from "@/components/sidebar/SidebarTooltip";

export default function Sidebar() {
  const { isMobile, collapsed, toggle } = useSidebar();

  return (
    <>
      <div className="fixed top-4 left-4 w-[60px] z-50 flex flex-row items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "rounded-md",
            collapsed ? "hover:bg-gray-100" : "hover:bg-gray-300"
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
        {collapsed && <SidebarTooltipGroup collapsed={collapsed} />}
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out bg-gray-100 border-r h-screen pt-16 fixed top-0 left-0 z-40 flex flex-col",
          collapsed && "w-0 overflow-hidden",
          !collapsed && isMobile && "z-20 w-[100vw]  px-4",
          !collapsed && !isMobile && "z-20 w-[240px] px-4"
        )}
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
