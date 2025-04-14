import { useSidebar } from "@/context/SidebarContext";
import { Bookmark, GitBranch, ListTree } from "lucide-react";

interface ChatHeaderProps {
  openDrawer: boolean;
}

export default function ChatHeader({ openDrawer }: ChatHeaderProps) {
  const { userPrefs, isMobile } = useSidebar();
  const { themeColor, themeOpacity } = userPrefs;

  const buttons = [
    {
      label: "Message Index",
      id: "message-index",
      icon: <ListTree size={16} />,
    },
    {
      label: "Saved Messages",
      id: "saved-messages",
      icon: <Bookmark size={16} />,
    },
    {
      label: "Message Branches",
      id: "message-branches",
      icon: <GitBranch size={16} />,
    },
  ];

  return (
    <div
      className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between"
      style={{
        backgroundColor: `rgba(${themeColor}, ${themeOpacity - 0.1})`,
        ...(isMobile
          ? {}
          : {
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            }),
      }}
    >
      <div className="flex gap-3">
        {buttons.map(({ label, id, icon }) => (
          <button
            key={id}
            className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-white transition text-sm font-medium"
            onClick={() => {
              console.log(`Toggle drawer: ${id}`);
            }}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
