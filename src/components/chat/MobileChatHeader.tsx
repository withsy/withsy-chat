import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";
import { useDrawerStore } from "@/stores/useDrawerStore";
import type { Chat } from "@/types";
import { ChevronDown, PenLine } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { CollapseButton } from "../CollapseButton";
import { IconWithLabel } from "../IconWithLabel";
import { getChatTypeIcon } from "./ChatTypeIcon";

export default function MobileChatHeader({
  chatTitle,
  chatType,
}: {
  chatTitle: string | undefined;
  chatType: Chat.Type | undefined;
}) {
  const router = useRouter();
  const { openDrawer, setOpenDrawer } = useDrawerStore();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const { themeColor, themeOpacity } = user.preferences;

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
      className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between"
      style={headerStyle}
    >
      {/* Left: CollapseButton */}
      <div className="flex items-center">
        <CollapseButton />
      </div>

      {/* Center: Chat Title + Modal */}
      <div className="flex-1 flex justify-center">
        {chatTitle && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="max-w-[180px] flex items-center px-2 py-1 gap-3 rounded-md hover:bg-white active:bg-white select-none">
                {chatType && (
                  <span className="shrink-0">
                    {getChatTypeIcon(chatType, "")}
                  </span>
                )}

                <span className="truncate font-semibold">{chatTitle}</span>

                <ChevronDown size={16} className="shrink-0" />
              </button>
            </DialogTrigger>
            <DialogContent className="p-5 flex flex-col gap-2 w-64">
              <button
                onClick={() => handleSelectDrawer("prompt")}
                className="w-full text-left hover:bg-gray-100 active:bg-gray-100 px-2 py-2 rounded text-lg"
              >
                Prompt
              </button>
              <button
                onClick={() => handleSelectDrawer("saved")}
                className="w-full text-left hover:bg-gray-100 active:bg-gray-100 px-2 py-2 rounded text-lg"
              >
                Saved
              </button>
              {(chatType === "chat" || chatType === "branch") && (
                <button
                  onClick={() => handleSelectDrawer("branches")}
                  className="w-full text-left hover:bg-gray-100 active:bg-gray-100 px-2 py-2 rounded text-lg"
                >
                  Branches
                </button>
              )}
            </DialogContent>
          </Dialog>
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
