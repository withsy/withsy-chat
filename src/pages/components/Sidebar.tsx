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
} from "@radix-ui/react-tooltip"; // Make sure this path is correct
import { cn } from "@/lib/utils";
import SidebarChatList from "./SidebarChatList";

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

  return (
    <>
      <div className="fixed top-4 left-2 z-50">
        <Button variant="outline" size="icon" onClick={toggle}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
        {collapsed && (
          <TooltipProvider>
            <div className="flex flex-col items-center gap-2 mt-4">
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
          "transition-[width] duration-500 ease-in-out bg-gray-100 border-r h-screen pt-16 relative flex flex-col",
          collapsed ? "w-[60px] items-center px-0" : "w-[240px] px-4"
        )}
      >
        <div
          className={cn(
            "transition-opacity duration-500 delay-200 flex-1 flex flex-col min-h-0 relative",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          {!collapsed && (
            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              <SidebarChatList />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
