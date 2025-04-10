import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { MarkdownBox } from "../MarkdownBox";
import { ModelAvatar } from "../ModelAvatar";

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const isAI = message.isAi;
  const model = message.model;
  if (model === "system") {
    return (
      <div className="flex justify-center my-4 py-4">
        <span className="text-xs text-muted-foreground italic">
          {message.content}
        </span>
      </div>
    );
  }

  const username = "Jenn";
  const fallbackName = isAI ? model ?? "AI" : username ?? "You";
  return (
    <div className={cn("flex gap-3", isAI ? "flex-row" : "flex-row-reverse")}>
      <ModelAvatar name={fallbackName} />

      <div className="max-w-[70%]">
        <div className="text-sm text-muted-foreground mb-1">
          {isAI ? message.model?.toUpperCase() : "You"} ·{" "}
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
        <div className="bg-muted rounded-md px-4 py-2 whitespace-pre-wrap text-sm">
          <MarkdownBox content={message.content} />
        </div>
      </div>
    </div>
  );
}
