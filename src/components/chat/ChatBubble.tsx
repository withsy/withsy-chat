import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { useState } from "react";
import { CollapseToggle } from "../CollapseToggle";
import { MarkdownBox } from "../MarkdownBox";
import { ModelAvatar } from "../ModelAvatar";

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const { role, text: rawText } = message;

  const text = rawText ?? "";
  const isLongMessage = text.length > 300;
  const [collapsed, setCollapsed] = useState(role === "user" && isLongMessage);
  const displayedText = collapsed ? text.slice(0, 300) + "..." : text;

  const username = "Jenn";
  const fallbackName = role === "model" ? "AI" : username;
  return (
    <div
      className={cn(
        "flex w-full gap-3 items-start px-4",
        role === "model" ? "items-start" : "items-end",
        "flex-col gap-2"
      )}
    >
      <ModelAvatar name={fallbackName} />

      <div className="flex flex-col items-start flex-1">
        <div
          className={cn(
            "text-muted-foreground text-sm mb-1",
            role === "model" ? "text-left" : "text-right",
            role === "user" && "self-end"
          )}
        >
          {role === "model" ? message.model?.toUpperCase() : "You"} ·{" "}
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>

        <div
          className={cn(
            "inline-block rounded-md mx-4 py-2 px-2 whitespace-pre-wrap break-words",
            role === "user" ? "self-end bg-muted " : "self-start"
          )}
        >
          <MarkdownBox content={displayedText} />
        </div>
      </div>
      <CollapseToggle
        show={isLongMessage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    </div>
  );
}
