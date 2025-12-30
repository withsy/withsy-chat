import type { ChatMessageData } from "@/common-schemas";

export function isLongChatMessage(text: string): boolean {
  return text.length > 150;
}

export function isChatMessageCompleted(
  status: ChatMessageData["status"],
): boolean {
  return status === "succeeded" || status === "failed";
}

export function isChatMessageReceivable(
  status: ChatMessageData["status"],
): boolean {
  return status === "pending" || status === "processing";
}
