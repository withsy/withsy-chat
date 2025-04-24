import { useUser } from "@/context/UserContext";
import { useDrawerStore } from "@/stores/useDrawerStore";
import type { Chat } from "@/types/chat";
import { Bookmark, FolderGit2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AccessibilityMenu } from "../AccessibilityMenu";
import HoverSwitchIcon from "../HoverSwitchIcon";
import { SidebarChatItem } from "../layout/sidebar/SidebarChatItem";

interface ChatHeaderProps {
  chat: Chat;
}

export default function ChatHeader({ chat }: ChatHeaderProps) {
  const { openDrawer, setOpenDrawer } = useDrawerStore();
  const { userPrefs } = useUser();
  const { themeColor, themeOpacity } = userPrefs;

  const [displayChat, setDisplayChat] = useState<Chat>(chat);
  const [hideLabels, setHideLabels] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setHideLabels(width < 640 || openDrawer != null);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [openDrawer]);

  useEffect(() => {
    setDisplayChat(chat);
  }, [chat]);

  const handleClick = (id: string) => {
    setOpenDrawer(openDrawer === id ? null : id);
  };

  const buttons = [
    {
      label: "Saved",
      id: "saved",
      icon: (
        <HoverSwitchIcon
          DefaultIcon={Bookmark}
          HoverIcon={Bookmark}
          fill={`rgb(${themeColor})`}
          isActive={openDrawer == "saved"}
        />
      ),
    },
    {
      label: "Branches",
      id: "branches",
      icon: (
        <HoverSwitchIcon
          DefaultIcon={FolderGit2}
          HoverIcon={FolderGit2}
          fill={`rgb(${themeColor})`}
          isActive={openDrawer == "branches"}
        />
      ),
    },
  ];

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity - 0.1})`,
  };

  const buttonClassName =
    "group flex items-center gap-1 rounded-md px-1 py-2 hover:bg-white hover:font-semibold active:bg-white active:font-semibold transition-colors";
  return (
    <div
      className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between"
      style={headerStyle}
      ref={containerRef}
    >
      <SidebarChatItem
        chat={displayChat}
        onChatUpdate={(updatedChat) => setDisplayChat(updatedChat)}
      />

      <div className="flex gap-5">
        <AccessibilityMenu hideLabels={hideLabels} />
        {buttons.map(({ label, id, icon }) => (
          <button
            key={id}
            className={`${buttonClassName} ${
              openDrawer === id ? "font-semibold" : ""
            }`}
            onClick={() => handleClick(id)}
          >
            {icon}
            {!hideLabels && <span>{label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
