import { IconWithLabel } from "@/components/IconWithLabel";
import { useSidebar } from "@/context/SidebarContext";
import { Bookmark, SquarePen, type LucideIcon } from "lucide-react";
import { useRouter } from "next/router";

const datas = [
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
  collapsed?: boolean;
  fill?: boolean;
  onClick?: (id: string) => void;
}

function SidebarTooltip({
  id,
  icon: Icon,
  label,
  collapsed,
  fill,
  onClick,
}: SidebarTooltipProps) {
  const { isMobile, setCollapsed } = useSidebar();
  const router = useRouter();

  const className = `group relative flex items-center gap-2 no-underline px-2.5 py-2.5 rounded-md transition-colors hover:font-bold`;

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
      />
    </button>
  );
}

interface Props {
  collapsed?: boolean;
}

export function SidebarTooltipGroup({ collapsed = false }: Props) {
  const { isMobile, setCollapsed } = useSidebar();

  const handleItemClick = (id: string) => {
    console.log(isMobile, id, collapsed);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <>
      {datas.map((data) => (
        <SidebarTooltip
          id={data.id}
          key={data.id}
          icon={data.icon}
          label={data.label}
          fill={data.fill}
          collapsed={collapsed}
          onClick={handleItemClick}
        />
      ))}
    </>
  );
}
