import { useChatSession } from "@/context/ChatSessionContext";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";
import { CollapseToggle } from "../CollapseToggle";
import { MarkdownBox } from "../MarkdownBox";
import { ModelAvatar } from "../ModelAvatar";
import { ChatBubbleTooltips } from "./ChatBubbleTooltips";
import { StatusIndicator } from "./StatusIndicator";

type Props = {
  message: Message;
  onToggleSaved?: (id: string, newValue: boolean) => void;
};

const ChatBubbleComponent = ({ message, onToggleSaved }: Props) => {
  const { userSession } = useUser();
  const { setStatus } = useChatSession();

  const { role, text: rawText, status } = message;

  const text = rawText ?? "";
  const isLongMessage = text.length > 150;
  const [collapsed, setCollapsed] = useState(role === "user" && isLongMessage);
  const displayedText = collapsed
    ? text.split("\n").slice(0, 5).join("\n") + "..."
    : text;

  const name =
    role === "model"
      ? message.model
        ? message.model
        : "AI"
      : userSession?.user?.name ?? "username";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!", {
        description: "Message copied to clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed", {
        description: "Please try again or check clipboard permissions.",
      });
    }
  };

  const handleSave = () => {
    onToggleSaved?.(message.id, !message.isBookmarked);
  };

  useEffect(() => {
    if (role === "model") {
      setStatus(status);
    }
  }, [role, status]);
  return (
    <div
      className={cn(
        "flex w-full gap-3 items-start px-4",
        role === "model" ? "items-start" : "items-end",
        "flex-col gap-2"
      )}
    >
      <ModelAvatar name={name} />

      <div className="flex flex-col items-start flex-1">
        <div
          className={cn(
            "text-muted-foreground text-sm mb-1 select-none",
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
          <StatusIndicator status={status} />
        </div>
        <div className="flex justify-between w-full mt-2">
          <ChatBubbleTooltips
            messageId={message.id}
            isAi={role == "model"}
            messageModel={message.model}
            isSaved={message.isBookmarked}
            onCopy={handleCopy}
            onSave={handleSave}
          />
          <CollapseToggle
            show={isLongMessage && status == "succeeded"}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>
      </div>
    </div>
  );
};

export const ChatBubble = memo(ChatBubbleComponent, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.isBookmarked === next.message.isBookmarked &&
    prev.message.text === next.message.text &&
    prev.message.status === next.message.status &&
    prev.message.role === next.message.role &&
    prev.message.model === next.message.model &&
    prev.message.createdAt === next.message.createdAt
  );
});
