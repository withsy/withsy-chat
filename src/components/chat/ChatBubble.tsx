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
        "flex gap-3 items-start",
        role === "model" ? "flex-row" : "flex-row-reverse"
      )}
    >
      <ModelAvatar name={fallbackName} />

      <div className="flex flex-col">
        <div className="text-muted-foreground text-sm mb-1">
          {role === "model" ? message.model?.toUpperCase() : "You"} ·{" "}
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>

        <div className={cn("flex", role === "user" && "justify-end")}>
          <div className="inline-block max-w-full bg-muted rounded-md px-4 py-2 whitespace-pre-wrap break-words">
            <MarkdownBox content={message.text ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
