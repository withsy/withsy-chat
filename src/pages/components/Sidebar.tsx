import { ChevronLeft, ChevronRight, NotebookPen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import SidebarChatList from "./SidebarChatList";
import { SidebarLinkGroup } from "./SidebarLink";

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
        {collapsed && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md hover:bg-gray-100"
            >
              <Search size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md hover:text-orange-500 hover:bg-orange-50"
            >
              <NotebookPen size={16} />
            </Button>
          </>
        )}
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out bg-gray-100 border-r h-screen pt-16 fixed top-0 left-0 z-40 flex flex-col",
          collapsed && "w-0 overflow-hidden",
          !collapsed && isMobile && "z-10 w-[100vw]  px-4",
          !collapsed && !isMobile && "z-10 w-[240px] px-4"
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
              <SidebarLinkGroup />
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
