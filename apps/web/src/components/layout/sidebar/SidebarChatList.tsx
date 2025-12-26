import type { ChatData } from "@/common-schemas";
import { PartialError } from "@/components/Error";
import { PartialLoading } from "@/components/Loading";
import { useChatList } from "@/hooks/useChat";
import { formatDateLabel, toNewest } from "@/lib/date-utils";
import { useUserStore } from "@/stores/useUserStore";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SidebarChatItem } from "./SidebarChatItem";

export default function SidebarChatList() {
  const chatList = useChatList();

  useEffect(() => {
    if (chatList.data) {
      const chats = chatList.data.pages.flatMap((page) => page.items);
      useUserStore.setState((state) => {
        chats.forEach((chat) => state.chatMap.set(chat.id, chat));
      });
    }
  }, [chatList.data]);

  const [starredOpen, setStarredOpen] = useState(true);

  const chatMap = useUserStore((s) => s.chatMap);

  const { starred, orderedEntries } = useMemo(() => {
    const starred: ChatData[] = [];
    const nonStarredMap = new Map<string, ChatData[]>();

    chatMap.forEach((chat) => {
      if (chat.isStarred) {
        starred.push(chat);
      } else {
        const dateLabel = formatDateLabel(new Date(chat.updatedAt));
        if (!nonStarredMap.has(dateLabel)) nonStarredMap.set(dateLabel, []);
        nonStarredMap.get(dateLabel)?.push(chat);
      }
    });
    starred.sort((a, b) =>
      toNewest(new Date(a.updatedAt), new Date(b.updatedAt)),
    );
    nonStarredMap.forEach((chats) =>
      chats.sort((a, b) =>
        toNewest(new Date(a.updatedAt), new Date(b.updatedAt)),
      ),
    );
    const orderedEntries = [...nonStarredMap.entries()].sort(([a], [b]) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Yesterday") return b === "Today" ? 1 : -1;
      if (b === "Yesterday") return a === "Today" ? -1 : 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return {
      starred,
      orderedEntries,
    };
  }, [chatMap]);

  if (chatList.isPending) {
    return <PartialLoading />;
  }

  if (chatList.error) {
    return <PartialError message="loading chat list" />;
  }

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
                <SidebarChatItem key={chat.id} chat={chat} isSidebar={true} />
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
