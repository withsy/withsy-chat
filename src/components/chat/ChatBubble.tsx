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
  const fallbackName = role === "model" ? "AI" : username;

  return (
    <div
      className={cn(
        "flex w-full gap-3 items-start",
        role === "model" ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* <ModelAvatar name={fallbackName} /> */}

      <div className="flex flex-col items-start flex-1">
        <div
          className={cn(
            "text-muted-foreground text-sm mb-1 px-4",
            role === "model" ? "text-left" : "text-right",
            role === "user" && "self-end"
          )}
        >
          {role === "model" ? message.model?.toUpperCase() : "You"} ·{" "}
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>

        <div
          className={cn(
            "inline-block rounded-md mx-4 px-4 py-2 whitespace-pre-wrap break-words",
            role === "user" ? "self-end bg-muted max-w-[80%]" : "self-start"
          )}
        >
          <MarkdownBox content={message.text ? message.text : ""} />
        </div>
      </div>
    </div>
  );
}
