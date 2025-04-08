import Link from "next/link";
import { Bookmark, LucideIcon, Search, NotebookPen } from "lucide-react";

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

function SidebarBookmark({ collapsed = false }: Props) {
  return (
    <SidebarLink
      href="/bookmarks"
      icon={Bookmark}
      label="Bookmarks"
      fill={true}
      collapsed={collapsed}
    />
  );
}

function SidebarNewChat({ collapsed = false }: Props) {
  return (
    <SidebarLink
      href="/new-chat"
      icon={NotebookPen}
      label="New Chat"
      collapsed={collapsed}
    />
  );
}
function SidebarSearch({ collapsed = false }: Props) {
  return (
    <SidebarLink
      href="/search"
      icon={Search}
      label="Search"
      collapsed={collapsed}
    />
  );
}

interface Props {
  collapsed?: boolean;
}

export function SidebarLinkGroup({ collapsed = false }: Props) {
  return (
    <>
      <SidebarSearch collapsed={collapsed} />
      <SidebarNewChat collapsed={collapsed} />
      <SidebarBookmark collapsed={collapsed} />
    </>
  );
}
