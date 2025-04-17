import type { ChatMessage } from "@/types/chat";

export function getFilteredBookmarks({
  messages,
  sortOrder,
}: {
  messages: ChatMessage[];
  sortOrder: "asc" | "desc";
}) {
  return messages.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });
}
