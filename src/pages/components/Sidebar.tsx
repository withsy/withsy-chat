import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SidebarChatList from "./SidebarChatList";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="fixed top-4 left-2 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <aside
        className={cn(
          "transition-all duration-300 ease-in-out bg-gray-100 border-r h-screen pt-16 relative flex flex-col",
          collapsed ? "w-[60px] items-center px-0" : "min-w-[240px] px-4"
        )}
      >
        {collapsed ? (
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
        ) : (
          <>
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button size="icon" variant="outline">
                <Search size={16} />
              </Button>
              <Button size="icon">
                <Plus size={16} />
              </Button>
            </div>
            <div className="h-full overflow-y-auto pr-2">
              <SidebarChatList />
            </div>
          </>
        )}
      </aside>
    </>
  );
}

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
