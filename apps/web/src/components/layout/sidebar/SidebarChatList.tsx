import type { ChatData } from "@/common-schemas";
import { useChatList } from "@/features/chat/hooks/useChatList";
import { desc, toLocaleDateString } from "@/lib/date-utils";
import { startOfDay, subDays } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { SidebarChatItem } from "./SidebarChatItem";

export default function SidebarChatList() {
  const chatList = useChatList();
  const chats = chatList.data.pages.flatMap((page) => page.items);

  const starredChats: ChatData[] = [];
  const labeledChatMap = new Map<string, ChatData[]>();

  chats.forEach((chat) => {
    if (chat.isStarred) {
      starredChats.push(chat);
    } else {
      const dateStr = toLocaleDateString(new Date(chat.updatedAt));
      if (!labeledChatMap.has(dateStr)) {
        labeledChatMap.set(dateStr, []);
      }

      labeledChatMap.get(dateStr)!.push(chat);
    }
  });

  starredChats.sort((a, b) =>
    desc(new Date(a.updatedAt), new Date(b.updatedAt)),
  );

  labeledChatMap.forEach((chats) => {
    chats.sort((a, b) => desc(new Date(a.updatedAt), new Date(b.updatedAt)));
  });

  const labeledChats = labeledChatMap
    .entries()
    .toArray()
    .toSorted(([a], [b]) => b.localeCompare(a));

  const [starredOpen, setStarredOpen] = useState(true);

  const today = startOfDay(new Date());
  const todayLabel = toLocaleDateString(today);
  const yesterday = subDays(today, 1);
  const yesterdayLabel = toLocaleDateString(yesterday);

  return (
    <div className="space-y-4">
      {starredChats.length > 0 && (
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
              {starredChats.map((chat) => (
                <SidebarChatItem key={chat.id} chat={chat} isSidebar={true} />
              ))}
            </div>
          )}
        </div>
      )}
      <div>
        <div className="mt-1 space-y-4">
          {labeledChats.map(([label, chats]) => {
            if (chats.length === 0) {
              return null;
            }

            let dateLabel = label;
            if (label === todayLabel) {
              dateLabel = "Today";
            } else if (label === yesterdayLabel) {
              dateLabel = "Yesterday";
            }

            return (
              <div key={dateLabel}>
                <div className="mb-1 px-2 py-1 text-sm font-semibold select-none">
                  {dateLabel}
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
