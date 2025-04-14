import { IconWithLabel } from "@/components/IconWithLabel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/context/SidebarContext";
import {
  PanelRightClose,
  PanelRightOpen,
  SquarePen,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/router";

const datas = [
  {
    id: "chat",
    icon: SquarePen,
    label: "New Chat",
    fill: false,
  },
];

interface SidebarTooltipProps {
  id: string;
  icon: LucideIcon;
  label: string;
  fill?: boolean;
  size?: number;
}

export function SidebarTooltip({
  id,
  icon: Icon,
  label,
  fill,
  size = 24,
}: SidebarTooltipProps) {
  const { isMobile, collapsed, setCollapsed } = useSidebar();
  const router = useRouter();

  const className = `
              group flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors w-full 
              hover:bg-white cursor-pointer
            `;
  const handleLinkClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
    router.push(`/${id}`);
  };

  return (
    <button className={className} onClick={handleLinkClick}>
      <IconWithLabel
        icon={Icon}
        label={label}
        collapsed={collapsed}
        fill={fill}
        size={size}
      />
    </button>
  );
}

export function SidebarTooltipGroup() {
  const { collapsed, toggle } = useSidebar();
  const iconSize = 20;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggle}
              className="cursor-pointer rounded-md group w-9 h-9 flex items-center justify-center hover:bg-white"
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
          <TooltipContent side="bottom" sideOffset={8}>
            <p>{collapsed ? "Expand Sidebar" : "Collapse Sidebar"}</p>
          </TooltipContent>
        </Tooltip>
        {datas.map((data) => (
          <SidebarTooltip
            key={data.id}
            id={data.id}
            icon={data.icon}
            label={data.label}
            fill={data.fill}
            size={iconSize}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}
