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
      {messages.map((msg) =>
        msg.role == "system" ? (
          <div key={msg.id} className="flex justify-center my-4 py-4">
            <span className="text-muted-foreground italic">{msg.text}</span>
          </div>
        ) : (
          <ChatBubble key={msg.id} message={msg} />
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
}
