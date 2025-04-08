// "use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function SidebarBookmark() {
  return (
    <div>
      <Link
        href="/bookmarks"
        className="group flex items-center gap-2 text-sm font-medium no-underline hover:bg-gray-300 px-2 py-2 rounded-md transition-colors"
      >
        <Bookmark
          size={16}
          className="text-muted-foreground group-hover:text-primary transition-colors"
          fill="none"
        />
        <Bookmark
          size={16}
          className="absolute opacity-0 group-hover:opacity-100 text-primary transition-all"
          fill="currentColor"
        />
        <span className="relative z-10">Bookmarks</span>
      </Link>
    </div>
  );
}
