import type { Message } from "@/types/message";

export function filterMessages({
  messages,
  sortOrder,
}: {
  messages: Message[];
  sortOrder: "asc" | "desc";
}) {
  return messages.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });
}
