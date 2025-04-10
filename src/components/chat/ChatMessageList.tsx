import type { ChatMessage } from "@/types/chat";
import { ChatBubble } from "./ChatBubble";

type Props = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: Props) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
