import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
export function CollapseButton({
  hoverColor = "bg-white",
}: {
  hoverColor?: string;
}) {
  const { collapsed, toggle } = useSidebarStore();

  const iconSize = 16;

  const buttonClassName = `cursor-pointer rounded-md group w-8 h-8 flex items-center justify-center hover:${hoverColor} active:${hoverColor}`;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={toggle} className={buttonClassName}>
            {collapsed ? (
              <ChevronsRight
                size={iconSize}
                className="group-hover:text-black"
              />
            ) : (
              <ChevronsLeft
                size={iconSize}
                className="group-hover:text-black"
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Open Sidebar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
