// src/components/layout/Sidebar.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
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
          "transition-all duration-300 ease-in-out bg-gray-100 border-r h-screen pt-16 relative",
          collapsed ? "w-[0px]" : "min-w-[240px] px-4"
        )}
      >
        {!collapsed && (
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
