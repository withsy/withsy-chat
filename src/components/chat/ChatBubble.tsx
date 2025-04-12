import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { MarkdownBox } from "../MarkdownBox";
import { ModelAvatar } from "../ModelAvatar";

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const { role } = message;
  if (role === "system") {
    return (
      <div className="flex justify-center my-4 py-4">
        <span className="text-muted-foreground italic">{message.text}</span>
      </div>
    );
  }

  const username = "Jenn";
  const fallbackName =
    role === "model" ? "AI" : role === "user" ? username : "You";
  return (
    <div
      className={cn(
        "flex gap-3",
        role === "model" ? "flex-row" : "flex-row-reverse"
      )}
    >
      <ModelAvatar name={fallbackName} />

      <div className="max-w-[90%]">
        <div className="text-muted-foreground mb-1">
          {role === "model" ? message.model?.toUpperCase() : "You"} ·{" "}
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
        <div className="bg-muted rounded-md px-4 py-2 whitespace-pre-wrap">
          <MarkdownBox content={message.text ?? ""} />
        </div>
      </div>
    </div>
  );
}
