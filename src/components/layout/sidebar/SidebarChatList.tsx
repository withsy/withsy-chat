import { PartialError } from "@/components/Error";
import { PartialLoading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { formatDateLabel, toNewest } from "@/lib/date-utils";
import { trpc } from "@/lib/trpc";
import type { Chat } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import {
  Archive,
  Bookmark,
  MoreHorizontal,
  Pencil,
  SquareMenu,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SidebarTooltip } from "./SidebarTooltip";

export default function SidebarChatList() {
  const { userSession } = useUser();
  const utils = trpc.useUtils();
  const listChats = trpc.chat.list.useQuery(
    userSession ? undefined : skipToken
  );
  const updateChatMut = trpc.chat.update.useMutation();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!listChats.data) return;
    setChats(listChats.data);
  }, [listChats]);

  const updateChat = <K extends keyof Chat>(
    chatId: string,
    key: K,
    value: Chat[K]
  ) => {
    const prev = chats;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, [key]: value } : chat
      )
    );

    updateChatMut.mutate(
      { chatId, [key]: value },
      {
        onError: () => setChats(prev),
        onSuccess: () => utils.chat.list.invalidate(),
      }
    );
  };

  const toggleStar = (chat: Chat) => {
    updateChat(chat.id, "isStarred", !chat.isStarred);
  };

  if (listChats.isLoading) return <PartialLoading />;
  if (listChats.isError) return <PartialError message="loading chat list" />;
  if (!listChats.data) return <></>;

  const starred: Chat[] = [];
  const nonStarredMap: Map<string, Chat[]> = new Map();
  listChats.data.forEach((chat) => {
    if (chat.isStarred) {
      starred.push(chat);
    } else {
      const dateLabel = formatDateLabel(chat.updatedAt);
      if (!nonStarredMap.has(dateLabel)) nonStarredMap.set(dateLabel, []);
      nonStarredMap.get(dateLabel)?.push(chat);
    }
  });
  starred.sort((a, b) => toNewest(a.updatedAt, b.updatedAt));
  nonStarredMap.forEach((chats) =>
    chats.sort((a, b) => toNewest(a.updatedAt, b.updatedAt))
  );
  const orderedEntries = [...nonStarredMap.entries()].sort(([a], [b]) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return b === "Today" ? 1 : -1;
    if (b === "Yesterday") return a === "Today" ? -1 : 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="mt-4 space-y-2 ">
      <SidebarTooltip
        id={"saved"}
        icon={Bookmark}
        fill={true}
        label={"All Saved"}
        size={16}
      />
      <SidebarTooltip
        id={"archive"}
        icon={Archive}
        fill={true}
        label={"Archived"}
        size={16}
      />
      {starred.length > 0 && (
        <div>
          <div className="py-1 px-2 mb-1 text-sm font-semibold">Starred</div>
          <div className="space-y-1 mt-1">
            {starred.map((chat) => (
              <SidebarChatItem
                key={chat.id}
                chat={chat}
                isStarred
                onToggleStar={toggleStar}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="space-y-4 mt-1">
          {orderedEntries.map(([date, chats]) => {
            if (chats.length === 0) return null;

            return (
              <div key={date}>
                <div className="py-1 px-2 mb-1 text-sm font-semibold">
                  {date}
                </div>
                {chats.map((chat) => (
                  <SidebarChatItem
                    key={chat.id}
                    chat={chat}
                    isStarred={false}
                    onToggleStar={toggleStar}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SidebarChatItem({
  chat,
  isStarred,
  onToggleStar,
}: {
  chat: Chat;
  isStarred: boolean;
  onToggleStar: (chat: Chat) => void;
}) {
  const { isMobile, setCollapsed } = useSidebar();
  const { userPrefs } = useUser();
  const router = useRouter();
  const isActive = router.asPath === `/chat/${chat.id}`;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLinkClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
    router.push(`/chat/${chat.id}`);
  };

  const isHoveredOrDropdown = `${
    isDropdownOpen || isActive ? "font-bold" : ""
  }`;

  return (
    <div
      className={`group relative flex items-center gap-2 no-underline px-2.5 py-2 rounded-md transition-colors hover:bg-white cursor-pointer ${isHoveredOrDropdown}`}
    >
      <div
        className="flex items-center gap-2 flex-1 group-hover:font-bold"
        onClick={handleLinkClick}
      >
        <div className="w-5 h-5 flex items-center justify-center relative">
          <SquareMenu
            size={16}
            className={`opacity-100 transition-opacity ${
              isDropdownOpen ? "opacity-0" : "group-hover:opacity-0"
            }`}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(chat);
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Star
              size={16}
              className="transition-colors"
              style={
                isStarred
                  ? {
                      fill: `rgb(${userPrefs.themeColor})`,
                    }
                  : {}
              }
            />
          </button>
        </div>

        <span className="text-foreground truncate ">{chat.title}</span>
      </div>

      <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 p-0 transition-opacity bg-transparent hover:bg-transparent ${
              isDropdownOpen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="z-[9999]">
          <DropdownMenuItem onClick={() => onToggleStar(chat)}>
            {isStarred ? (
              <>
                <StarOff size={14} className="mr-2" />
                StarOff
              </>
            ) : (
              <>
                <Star size={14} className="mr-2" />
                Star
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil size={14} className="mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-500">
            <Trash2 size={14} className="mr-2 text-red-500" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
