import Link from "next/link";
import { Bookmark, Search, NotebookPen, type LucideIcon } from "lucide-react";

const sidebarLinks = [
  {
    href: "/search",
    icon: Search,
    label: "Search",
    fill: false,
  },
  {
    href: "/chat",
    icon: NotebookPen,
    label: "New Chat",
    fill: false,
  },
  {
    href: "/bookmarks",
    icon: Bookmark,
    label: "Bookmarks",
    fill: true,
  },
];

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  fill?: boolean;
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  collapsed,
  fill,
}: SidebarLinkProps) {
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

export function SidebarLinkGroup({ collapsed = false }: Props) {
  return (
    <>
      {sidebarLinks.map((link) => (
        <SidebarLink
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          fill={link.fill}
          collapsed={collapsed}
        />
      ))}
    </>
  );
}
