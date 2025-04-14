import { useSidebar } from "@/context/SidebarContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { PanelRightClose, PanelRightOpen, SquarePen } from "lucide-react";
import { useRouter } from "next/router";

export function HeaderTooltipGroup() {
  const { isMobile, setCollapsed, collapsed, toggle } = useSidebar();
  const router = useRouter();

  const iconSize = 20;
  const handleLinkClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
    router.push(`/chat`);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggle}
              className="cursor-pointer rounded-md group w-8 h-8 flex items-center justify-center hover:bg-white"
            >
              {collapsed ? (
                <PanelRightClose
                  size={iconSize}
                  className="group-hover:text-black"
                />
              ) : (
                <PanelRightOpen
                  size={iconSize}
                  className="group-hover:text-black"
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={8}
            className="bg-black text-white rounded-md px-2 py-1 shadow-md"
          >
            <p>{collapsed ? "Expand Sidebar" : "Collapse Sidebar"}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLinkClick}
              className="cursor-pointer rounded-md group w-8 h-8 flex items-center justify-center hover:bg-white"
            >
              <SquarePen size={iconSize} className="group-hover:text-black" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={8}
            className="bg-black text-white rounded-md px-2 py-1 shadow-md"
          >
            <p>New Chat</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
