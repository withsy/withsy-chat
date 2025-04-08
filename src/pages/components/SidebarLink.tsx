import Link from "next/link";
import { Bookmark, LucideIcon, Search, MessageSquarePlus } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  fill?: boolean;
}

function SidebarLink({ href, icon: Icon, label, fill }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-2 text-sm font-medium no-underline hover:bg-gray-300 px-2 py-2 rounded-md transition-colors"
    >
      <Icon
        size={16}
        className="text-muted-foreground group-hover:text-primary transition-colors"
        fill="none"
      />
      {fill && (
        <Icon
          size={16}
          className="absolute opacity-0 group-hover:opacity-100 text-primary transition-all"
          fill="currentColor"
        />
      )}
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

function SidebarBookmark() {
  return (
    <SidebarLink
      href="/bookmarks"
      icon={Bookmark}
      label="Bookmarks"
      fill={true}
    />
  );
}

function SidebarNewChat() {
  return (
    <SidebarLink href="/new-chat" icon={MessageSquarePlus} label="New Chat" />
  );
}
function SidebarSearch() {
  return <SidebarLink href="/search" icon={Search} label="Search" />;
}

export function SidebarLinkGroup() {
  return (
    <>
      <SidebarSearch />
      <SidebarNewChat />
      <SidebarBookmark />
    </>
  );
}
