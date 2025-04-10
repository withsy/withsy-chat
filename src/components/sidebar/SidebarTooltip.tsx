import Link from "next/link";
import { Bookmark, Search, NotebookPen, type LucideIcon } from "lucide-react";
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
  id: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  fill?: boolean;
}

function SidebarTooltip({
  id,
  icon: Icon,
  label,
  collapsed,
  fill,
}: SidebarTooltipProps) {
  const className =
    "group relative flex items-center gap-2 text-sm font-medium no-underline hover:bg-gray-300 px-2.5 py-2.5 rounded-md transition-colors";
  const IconComponenet = (
    <>
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
    </>
  );
  if (id == "search") {
    return <div className={className}>{IconComponenet}</div>;
  }

  const href = `/${id}`;
  return (
    <Link href={href} className={className}>
      {IconComponenet}
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
        <SearchModal onClose={() => setSearchModalOpen(false)} />
      )}
    </>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded">
        <h2>Search</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
