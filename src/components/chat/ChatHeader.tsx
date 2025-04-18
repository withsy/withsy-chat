import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import type { Chat } from "@/types/chat";
import {
  Archive,
  Bookmark,
  ChevronsLeftRight,
  ChevronsRightLeft,
  FolderGit2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import HoverSwitchIcon from "../HoverSwitchIcon";
import { SidebarChatItem } from "../layout/sidebar/SidebarChatList";

interface ChatHeaderProps {
  chat: Chat;
  setOpenDrawer: (id: string | null) => void;
  openDrawer: string | null;
}

export default function ChatHeader({
  chat,
  setOpenDrawer,
  openDrawer,
}: ChatHeaderProps) {
  const { isMobile } = useSidebar();
  const { userPrefs, setUserPrefsAndSave } = useUser();
  const { themeColor, themeOpacity } = userPrefs;

  const updateChatMut = trpc.chat.update.useMutation();
  const utils = trpc.useUtils();
  const [displayChat, setDisplayChat] = useState<Chat>(chat);
  const [hideLabels, setHideLabels] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setHideLabels(width < 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setDisplayChat(chat);
  }, [chat]);

  const handleClick = (id: string) => {
    setOpenDrawer(openDrawer === id ? null : id);
  };

  const updateChat = () => {
    const chatId = displayChat.id;
    const prev = { ...displayChat };

    const newChat = { ...displayChat, isStarred: !displayChat.isStarred };
    setDisplayChat(newChat);

    updateChatMut.mutate(
      { chatId, isStarred: newChat.isStarred },
      {
        onError: () => {
          setDisplayChat(prev);
        },
        onSuccess: () => {
          utils.chat.list.invalidate();
        },
      }
    );
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

  if (!isMobile) {
    headerStyle.borderTopLeftRadius = 30;
    if (!openDrawer) {
      headerStyle.borderTopRightRadius = 30;
    }
  }

  const buttonClassName =
    "group flex items-center gap-1 rounded-md px-1 py-2 hover:bg-white hover:font-bold transition-colors text-sm";
  return (
    <div
      className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between"
      style={headerStyle}
      ref={containerRef}
    >
      <SidebarChatItem chat={displayChat} onToggleStar={updateChat} />

      <div className="flex gap-5">
        {buttons.map(({ label, id, icon }) => (
          <button
            key={id}
            className={`${buttonClassName} ${
              openDrawer === id ? "font-bold" : ""
            }`}
            onClick={() => handleClick(id)}
          >
            {icon}
            {!hideLabels && <span>{label}</span>}
          </button>
        ))}
        <button className={buttonClassName} onClick={() => {}}>
          <HoverSwitchIcon
            DefaultIcon={Archive}
            HoverIcon={Archive}
            fill={`rgb(${themeColor})`}
          />
          {!hideLabels && <span>Archive</span>}
        </button>
        {!isMobile && (
          <button
            className={buttonClassName}
            onClick={() => {
              setUserPrefsAndSave({ wideView: !userPrefs.wideView });
            }}
          >
            {userPrefs.wideView ? (
              <>
                <ChevronsLeftRight size={16} />
                {!hideLabels && <span>Wide</span>}
              </>
            ) : (
              <>
                <ChevronsRightLeft size={16} />
                {!hideLabels && <span>Compact</span>}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
