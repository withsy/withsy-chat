import { PartialError } from "@/components/Error";
import { PartialLoading } from "@/components/Loading";
import { formatDateLabel, toNewest } from "@/lib/date-utils";
import { useTRPC } from "@/lib/trpc";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SidebarChatItem } from "./SidebarChatItem";

export default function SidebarChatList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const session = useSession();

  const { data: chatListOutput } = useInfiniteQuery(
    trpc.chat.list.infiniteQueryOptions(
      {},
      {
        enabled: !!session,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        select: (data) => {
          // TODO: flatten chats
          return {
            ...data,
          };
        },
      },
    ),
  );

  const updateChatMut = useMutation(trpc.chat.update.mutationOptions());
  const [starredOpen, setStarredOpen] = useState(true);

  const updateChat = (updatedChat: ChatData) => {
    const prev = chats;

    setChats((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)),
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
      },
    );
  };

  if (listChats.isLoading) return <PartialLoading />;
  if (listChats.isError) return <PartialError message="loading chat list" />;
  if (!listChats.data) return <></>;

  const starred: ChatData[] = [];
  const nonStarredMap: Map<string, ChatData[]> = new Map();
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
    chats.sort((a, b) => toNewest(a.updatedAt, b.updatedAt)),
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
            className="mb-1 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-semibold select-none hover:bg-white active:bg-white"
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
            <div className="mt-1 space-y-1">
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
        <div className="mt-1 space-y-4">
          {orderedEntries.map(([date, chats]) => {
            if (chats.length === 0) return null;

            return (
              <div key={date}>
                <div className="mb-1 px-2 py-1 text-sm font-semibold select-none">
                  {date}
                </div>
                <div className="mt-1 space-y-1">
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
