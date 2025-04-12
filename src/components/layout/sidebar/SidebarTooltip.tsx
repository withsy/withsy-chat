import { IconWithLabel } from "@/components/IconWithLabel";
import { SearchModal } from "@/components/search/SearchModal";
import { Bookmark, Search, SquarePen, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const datas = [
  {
    id: "search",
    icon: Search,
    label: "Search",
    fill: false,
  },
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
  const hoverClass = collapsed ? "hover:bg-gray-100" : "hover:bg-gray-300";
  const className = `group relative flex items-center gap-2 no-underline ${hoverClass} px-2.5 py-2.5 rounded-md transition-colors`;

  if (id == "search" && onClick) {
    return (
      <button className={className} onClick={() => onClick?.(id)}>
        <IconWithLabel
          icon={Icon}
          label={label}
          collapsed={collapsed}
          fill={fill}
        />
      </button>
    );
  }

  const href = `/${id}`;
  return (
    <Link href={href} className={className}>
      <IconWithLabel
        icon={Icon}
        label={label}
        collapsed={collapsed}
        fill={fill}
      />
    </Link>
  );
}

interface Props {
  collapsed?: boolean;
}

export function SidebarTooltipGroup({ collapsed = false }: Props) {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const handleItemClick = (id: string) => {
    if (id === "search") {
      setSearchModalOpen(true);
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
      {isSearchModalOpen && (
        <SearchModal
          open={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
        />
      )}
    </>
  );
}
