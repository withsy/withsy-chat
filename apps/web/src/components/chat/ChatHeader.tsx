import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Bookmark, FolderGit2, PenLine, TableProperties } from "lucide-react";
import { useRouter } from "next/router";
import { CollapseButton } from "../CollapseButton";
import HoverSwitchIcon from "../HoverSwitchIcon";
import { IconWithLabel } from "../IconWithLabel";
import { getChatTypeIcon } from "./ChatTypeIcon";

export default function ChatHeader({
  chatTitle,
  chatType,
}: {
  chatTitle: string | undefined;
  chatType: ChatType | undefined;
}) {
  const router = useRouter();
  const { collapsed } = useSidebarStore();
  const { openDrawer, setOpenDrawer } = useDrawerStore();
  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  const handleClick = (id: string) => {
    setOpenDrawer(openDrawer === id ? null : id);
  };

  const buttons = chatTitle
    ? [
        {
          label: "Prompt",
          id: "prompt",
          icon: (
            <HoverSwitchIcon
              DefaultIcon={TableProperties}
              HoverIcon={TableProperties}
              fill={`rgb(${themeColor})`}
              isActive={openDrawer == "prompt"}
            />
          ),
        },
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
        ...(chatType === "chat" || chatType === "branch"
          ? [
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
            ]
          : []),
      ]
    : [];

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  const buttonClassName =
    "group flex items-center gap-1 rounded-md px-2 py-2 hover:bg-white hover:font-semibold active:bg-white active:font-semibold transition-colors";
  const handleLinkClick = () => {
    router.push(`/chat`);
  };

  return (
    <div
      className="absolute top-0 left-0 flex h-[50px] w-full items-center justify-between px-4"
      style={headerStyle}
    >
      {collapsed && (
        <div className="flex min-w-0 items-center gap-5">
          <CollapseButton />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleLinkClick} className={buttonClassName}>
                  <IconWithLabel icon={PenLine} fill={true} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Start New Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {collapsed ? (
        <div className="flex items-center truncate px-2 text-center font-semibold select-none">
          {chatType && getChatTypeIcon(chatType, "")}
          <span className="ml-2">{chatTitle}</span>
        </div>
      ) : (
        <div className="flex items-center truncate text-left font-semibold select-none">
          {chatType && getChatTypeIcon(chatType, "")}
          <span className="ml-2">{chatTitle}</span>
        </div>
      )}
      <div className="flex gap-5">
        {buttons.map(({ label, id, icon }) => (
          <TooltipProvider key={id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`${buttonClassName} ${
                    openDrawer === id ? "font-semibold" : ""
                  }`}
                  onClick={() => handleClick(id)}
                >
                  {icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
