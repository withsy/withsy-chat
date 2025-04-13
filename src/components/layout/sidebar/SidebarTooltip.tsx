import { IconWithLabel } from "@/components/IconWithLabel";
import { useSidebar } from "@/context/SidebarContext";
import {
  Bookmark,
  PanelRightClose,
  PanelRightOpen,
  SquarePen,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/router";

export const datas = [
  {
    id: "chat",
    icon: SquarePen,
    label: "New Chat",
    fill: false,
  },
  {
    id: "bookmarks",
    icon: Bookmark,
    label: "Bookmarks",
    fill: true,
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
  const { isMobile, setCollapsed } = useSidebar();
  const router = useRouter();

  const className =
    "cursor-pointer rounded-md group w-9 h-9 flex items-center justify-center hover:bg-transparent";

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
        collapsed={true}
        fill={fill}
        size={size}
      />
    </button>
  );
}

export function SidebarTooltipGroup() {
  const { isMobile, collapsed, setCollapsed, toggle } = useSidebar();
  const iconSize = isMobile ? 28 : 24;

  const handleItemClick = (id: string) => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <div className="w-full z-50 flex flex-row justify-between items-center gap-2">
      <div className="flex-shrink-0">
        <div
          onClick={toggle}
          className="cursor-pointer rounded-md group w-9 h-9 flex items-center justify-center hover:bg-transparent"
        >
          {collapsed ? (
            <PanelRightClose
              size={iconSize}
              className="group-hover:text-black text-gray-500"
            />
          ) : (
            <PanelRightOpen
              size={iconSize}
              className="group-hover:text-black text-gray-500"
            />
          )}
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-row items-center gap-2">
          {datas.map((data) => (
            <SidebarTooltip
              id={data.id}
              key={data.id}
              icon={data.icon}
              label={data.label}
              fill={data.fill}
              size={iconSize}
            />
          ))}
        </div>
      )}
    </div>
  );
}
