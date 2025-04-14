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
import {
  formatDateLabel,
  toLocaleDateString,
  toNewest,
} from "@/lib/date-utils";
import { trpc } from "@/lib/trpc";
import type { Chat } from "@/types/chat";
import {
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
  const utils = trpc.useUtils();
  const chatsRes = trpc.chat.list.useQuery();
  const updateChatMut = trpc.chat.update.useMutation();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (chatsRes.data) setChats(chatsRes.data);
  }, [chatsRes]);

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

  if (chatsRes.isLoading) return <PartialLoading />;
  if (chatsRes.isError || !chatsRes.data)
    return <PartialError message="loading chat list" />;

  const starreds: Chat[] = [];
  const nonStarredMap: Map<string, Chat[]> = new Map();
  chatsRes.data.forEach((chat) => {
    if (chat.isStarred) {
      starreds.push(chat);
    } else {
      const localeDateString = toLocaleDateString(chat.updatedAt);
      if (!nonStarredMap.has(localeDateString)) {
        nonStarredMap.set(localeDateString, []);
      }
      nonStarredMap.get(localeDateString)?.push(chat);
    }
  });
  starreds.sort((a, b) => toNewest(a.updatedAt, b.updatedAt));
  nonStarredMap.forEach((chats) =>
    chats.sort((a, b) => toNewest(a.updatedAt, b.updatedAt))
  );

  return (
    <div className="mt-4 space-y-2 ">
      <SidebarTooltip
        id={"saved"}
        icon={Bookmark}
        fill={true}
        label={"All Saved"}
        size={16}
      />
      {starreds.length > 0 && (
        <div>
          <div className="py-1 px-2 mb-1 text-sm font-semibold">Starred</div>
          <div className="space-y-1 mt-1">
            {starreds.map((chat) => (
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
          {[...nonStarredMap.entries()].map(([date, chats]) => {
            if (chats.length === 0) return null;

            return (
              <div key={date}>
                <div className="py-1 px-2 mb-1 text-sm font-semibold">
                  {formatDateLabel(date)}
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
  const { isMobile, setCollapsed, userPrefs } = useSidebar();

  const router = useRouter();

  const handleLinkClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
    router.push(`/chat/${chat.id}`);
  };

  return (
    <div
      className="group relative flex items-center gap-2 no-underline px-2.5 py-2 rounded-md transition-colors hover:bg-white cursor-pointer"
      onClick={handleLinkClick}
    >
      <div className="flex items-center gap-2 flex-1">
        <div className="w-5 h-5 flex items-center justify-center relative">
          <SquareMenu
            size={16}
            className="opacity-100 group-hover:opacity-0 transition-opacity"
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
                      color: `rgb(${userPrefs.themeColor})`,
                    }
                  : { color: "#6b7280" }
              }
            />
          </button>
        </div>

        <span className="text-foreground truncate">{chat.title}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={() => onToggleStar(chat)}>
            {isStarred ? (
              <>
                <StarOff size={14} className="mr-2" />
                Unstar
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
