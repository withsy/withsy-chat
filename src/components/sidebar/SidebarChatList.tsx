import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatDateLabel,
  toLocaleDateString,
  toNewest,
} from "@/lib/date-utils";
import { trpc } from "@/lib/trpc";
import type { Chat } from "@/types/chat";
import {
  AlignJustify,
  MoreHorizontal,
  Pencil,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
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

  // TODO: Add loading and error page.
  if (chatsRes.isLoading) return <div>Loading...</div>;
  if (chatsRes.isError || !chatsRes.data) return <div>Error loading chats</div>;

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
      {starreds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold px-2 py-2 rounded-md">
            Starred
          </h3>
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
        <h3 className="text-sm font-semibold px-2 py-2 rounded-md">Chats</h3>
        <div className="space-y-4 mt-1">
          {[...nonStarredMap.entries()].map(([date, chats]) => {
            if (chats.length === 0) return null;

            return (
              <div key={date}>
                <div className="text-xs text-muted-foreground py-1 px-2 mb-1">
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
  return (
    <div className="group flex items-center px-2 py-2 rounded-md hover:bg-gray-300 transition-colors">
      <div className="relative w-5 h-5 mr-2">
        <AlignJustify
          size={16}
          className="absolute top-0 left-0  opacity-100 group-hover:opacity-0 transition-opacity"
        />
        <button
          onClick={() => onToggleStar(chat)}
          className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star
            size={16}
            className={`text-black${isStarred ? " fill-black" : ""}`}
          />
        </button>
      </div>

      <div className="flex justify-between items-center flex-1 pr-2">
        <span className="text-sm font-medium text-foreground">
          {chat.title}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
}
