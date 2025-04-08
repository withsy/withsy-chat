import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import SidebarChatList from "./SidebarChatList";
import { useEffect, useState } from "react";
import { SidebarLinkGroup } from "./SidebarLink";

function SidebarIconButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-md">
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="bg-gray-800 text-white rounded-md p-2 text-sm font-medium"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
      <div className="fixed top-4 left-0 w-[60px] z-50 flex flex-col items-center">
        <Button variant="ghost" size="icon" onClick={toggle}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
        {collapsed && !isMobile && (
          <TooltipProvider>
            <div
              className={cn(
                "flex flex-col items-center gap-2 mt-4",
                "transition-all ease-in-out duration-500 delay-500 ",
                "opacity-100 translate-y-0"
              )}
            >
              <SidebarIconButton icon={<Search size={16} />} label="Search" />
              <SidebarIconButton icon={<Plus size={16} />} label="New Chat" />
              <Link href="/bookmarks">
                <SidebarIconButton
                  icon={<Bookmark size={16} />}
                  label="Bookmarks"
                />
              </Link>
            </div>
          </TooltipProvider>
        )}
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out bg-gray-100 border-r h-screen pt-16 fixed top-0 left-0 z-40 flex flex-col",
          collapsed && isMobile && "w-0 overflow-hidden",
          collapsed && !isMobile && "w-[60px] items-center px-0",
          !collapsed && isMobile && "w-[80vw] px-4",
          !collapsed && !isMobile && "w-[240px] px-4"
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
