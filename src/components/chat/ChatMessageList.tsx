import type { ChatMessage } from "@/types/chat";
import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";

type Props = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div className="space-y-12 overflow-x-hidden">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
