import Link from "next/link";
import { Bookmark, Search, NotebookPen, type LucideIcon } from "lucide-react";

const datas = [
  {
    id: "search",
    icon: Search,
    label: "Search",
    fill: false,
  },
  {
    id: "chat",
    icon: NotebookPen,
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
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  fill?: boolean;
}

function SidebarTooltip({
  href,
  icon: Icon,
  label,
  collapsed,
  fill,
}: SidebarTooltipProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-2 text-sm font-medium no-underline hover:bg-gray-300 px-2.5 py-2.5 rounded-md transition-colors"
    >
      <Icon
        size={16}
        className="group-hover:text-primary transition-colors "
        fill="none"
      />
      {fill && (
        <Icon
          size={16}
          className="absolute opacity-0 group-hover:opacity-100 text-primary transition-all "
          fill="currentColor"
        />
      )}
      {!collapsed && <span className="relative z-10">{label}</span>}
    </Link>
  );
}

interface Props {
  collapsed?: boolean;
}

export function SidebarTooltipGroup({ collapsed = false }: Props) {
  return (
    <>
      {datas.map((data) => (
        <SidebarTooltip
          key={data.id}
          href={data.id}
          icon={data.icon}
          label={data.label}
          fill={data.fill}
          collapsed={collapsed}
        />
      ))}
    </>
  );
}
