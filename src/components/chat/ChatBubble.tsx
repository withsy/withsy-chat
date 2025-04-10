import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils"; // optional: classnames helper
import { Avatar } from "@/components/ui/avatar"; // or just use lucide icon

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const isAI = message.isAI;

  return (
    <div className={cn("flex gap-3", isAI ? "flex-row" : "flex-row-reverse")}>
      <Avatar className="w-8 h-8 bg-muted">{isAI ? "🤖" : "🧑"}</Avatar>
      <div className="max-w-[70%]">
        <div className="text-sm text-muted-foreground mb-1">
          {isAI ? message.model?.toUpperCase() : "You"} ·{" "}
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
        <div className="bg-muted rounded-md px-4 py-2 whitespace-pre-wrap text-sm">
          {message.content}
        </div>
      </div>
    </div>
  );
}
