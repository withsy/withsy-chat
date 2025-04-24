import { PartialError } from "@/components/Error";
import { PartialLoading } from "@/components/Loading";
import { useUser } from "@/context/UserContext";
import { formatDateLabel, toNewest } from "@/lib/date-utils";
import { trpc } from "@/lib/trpc";
import type { Chat } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { Bookmark, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarChatItem } from "./SidebarChatItem";
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

  const updateChat = (updatedChat: Chat) => {
    const prev = chats;

    setChats((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );

    updateChatMut.mutate(
      {
        chatId: updatedChat.id,
        isStarred: updatedChat.isStarred,
        title: updatedChat.title,
      },
      {
        onError: () => setChats(prev),
        onSuccess: () => utils.chat.list.invalidate(),
      }
    );
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
        id={"friends"}
        icon={Heart}
        fill={true}
        label={"Friends"}
        size={16}
      />
      {starred.length > 0 && (
        <div>
          <div className="py-1 px-2 mb-1 text-sm font-semibold select-none">
            Starred
          </div>
          <div className="space-y-1 mt-1">
            {starred.map((chat) => (
              <SidebarChatItem
                key={chat.id}
                chat={chat}
                isSidebar={true}
                onChatUpdate={updateChat}
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
                <div className="py-1 px-2 mb-1 text-sm font-semibold select-none">
                  {date}
                </div>
                {chats.map((chat) => (
                  <SidebarChatItem
                    key={chat.id}
                    chat={chat}
                    isSidebar={true}
                    onChatUpdate={updateChat}
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
