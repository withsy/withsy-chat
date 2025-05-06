import { PartialError } from "@/components/Error";
import { PartialLoading } from "@/components/Loading";
import { formatDateLabel, toNewest } from "@/lib/date-utils";
import { useTRPC } from "@/lib/trpc";
import type * as Chat from "@/types/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarChatItem } from "./SidebarChatItem";

export default function SidebarChatList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const listChats = useQuery(trpc.chat.list.queryOptions());
  const updateChatMut = useMutation(trpc.chat.update.mutationOptions());
  const [chats, setChats] = useState<Chat.Data[]>([]);
  const [starredOpen, setStarredOpen] = useState(true);

  useEffect(() => {
    if (!listChats.data) return;
    setChats(listChats.data);
  }, [listChats.data]);

  const updateChat = (updatedChat: Chat.Data) => {
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
        onSuccess: () =>
          queryClient.invalidateQueries(trpc.chat.list.queryFilter()),
      }
    );
  };

  if (listChats.isLoading) return <PartialLoading />;
  if (listChats.isError) return <PartialError message="loading chat list" />;
  if (!listChats.data) return <></>;

  const starred: Chat.Data[] = [];
  const nonStarredMap: Map<string, Chat.Data[]> = new Map();
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
    <div className="space-y-4">
      {starred.length > 0 && (
        <div>
          <button
            onClick={() => setStarredOpen(!starredOpen)}
            className="w-full flex items-center justify-between py-2 px-2 mb-1 text-sm rounded-md font-semibold select-none hover:bg-white active:bg-white"
          >
            <span>Starred</span>
            <span>
              {starredOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          </button>
          {starredOpen && (
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
          )}
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
                <div className="space-y-1 mt-1">
                  {chats.map((chat) => (
                    <SidebarChatItem
                      key={chat.id}
                      chat={chat}
                      isSidebar={true}
                      onChatUpdate={updateChat}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
