import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useDrawerStore } from "@/stores/useDrawerStore";
import {
  Bookmark,
  ChevronDown,
  FolderGit2,
  PenLine,
  TableProperties,
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { CollapseButton } from "../CollapseButton";
import HoverSwitchIcon from "../HoverSwitchIcon";
import { IconWithLabel } from "../IconWithLabel";
import { getChatTypeIcon } from "./ChatTypeIcon";

export default function MobileChatHeader({
  chatTitle,
  chatType,
}: {
  chatTitle: string | undefined;
  chatType: ChatType | undefined;
}) {
  const router = useRouter();
  const { openDrawer, setOpenDrawer } = useDrawerStore();
  const [open, setOpen] = useState(false);
  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  const handleNewChatClick = () => {
    router.push(`/chat`);
  };

  const handleSelectDrawer = (id: string) => {
    setOpen(false);
    setOpenDrawer(openDrawer === id ? null : id);
  };

  const buttonClassName =
    "group flex items-center gap-1 rounded-md px-2 py-2 hover:bg-gray-100 hover:font-semibold active:bg-gray-100 active:font-semibold transition-colors";

  return (
    <div
      className="absolute top-0 left-0 flex h-[50px] w-full items-center justify-between px-4"
      style={headerStyle}
    >
      {/* Left: CollapseButton */}
      <div className="flex items-center">
        <CollapseButton />
      </div>

      {/* Center: Chat Title + Drawer */}
      <div className="flex flex-1 justify-center">
        {chatTitle && (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <button className="flex max-w-[180px] items-center gap-3 rounded-md px-2 py-1 select-none hover:bg-white active:bg-white">
                {chatType && (
                  <span className="shrink-0">
                    {getChatTypeIcon(chatType, "")}
                  </span>
                )}
                <span className="truncate font-semibold">{chatTitle}</span>
                <ChevronDown size={16} className="shrink-0" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="p-5">
              <div className="mx-auto flex w-full max-w-sm flex-col gap-2 py-5">
                <h2 className="mb-2 text-xl font-semibold">Chat Options</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  View prompts, access your saved items, or browse branches
                  created in this chat.
                </p>
                {[
                  { label: "Prompt", id: "prompt", icon: TableProperties },
                  { label: "Saved", id: "saved", icon: Bookmark },
                  ...(chatType === "chat" || chatType === "branch"
                    ? [{ label: "Branches", id: "branches", icon: FolderGit2 }]
                    : []),
                ].map(({ label, id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleSelectDrawer(id)}
                    className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-lg hover:bg-gray-100 active:bg-gray-100"
                  >
                    <HoverSwitchIcon
                      DefaultIcon={Icon}
                      HoverIcon={Icon}
                      fill={`rgb(${themeColor})`}
                      isActive={openDrawer === id}
                    />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Right: New Chat */}
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleNewChatClick} className={buttonClassName}>
                <IconWithLabel icon={PenLine} fill={true} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Start New Chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
