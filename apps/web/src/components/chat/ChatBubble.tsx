import type { ChatId, ChatMessageId, ChatMessageInfo } from "@/common-schemas";
import { cn } from "@/lib/utils";
import { useAiProfileStore } from "@/stores/useAiProfileStore";
import { useUserStore } from "@/stores/useUserStore";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CollapseToggle } from "../CollapseToggle";
import { MarkdownBox } from "../MarkdownBox";
import { ModelAvatar } from "../ModelAvatar";
import { ChatBubbleTooltips } from "./ChatBubbleTooltips";
import { GetModelLabel } from "./ModelSelect";
import { StatusIndicator } from "./StatusIndicator";

export default function ChatBubble({
  chatMessageId,
  chatId,
}: {
  chatMessageId: ChatMessageId;
  chatId: ChatId;
}) {
  const chatMessage = useUserStore((s) => s.chatMessageMap.get(chatId));
  const [showReasoning, setShowReasoning] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // const { profiles } = useAiProfileStore();

  useEffect(() => {
    if (chatMessage) {
      const { text, role, isCollapsed } = chatMessage;
      const isLongMessage = text.length > 150;
      Promise.try(() => {
        setCollapsed(isCollapsed ?? (role === "user" && isLongMessage));
      });
    }
  }, [chatMessage, setCollapsed]);

  if (!chatMessage) {
    return null;
  }

  const { text, role, createdAt, reasoningText, status } = chatMessage;

  const collapseText = collapsed
    ? text.slice(0, 150) + (text.length > 150 ? "..." : "")
    : text;

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

  // const handleSave = () => {
  //   onToggleSaved?.(message.id, !message.isBookmarked);
  // };

  // const userProfile =
  //   role === "model" && message.model ? profiles[message.model] : null;
  // const image =
  //   role === "model" ? userProfile?.imageSource : session?.user?.image;
  // const name =
  //   role === "model"
  //     ? userProfile?.name ||
  //       (message.model ? GetModelLabel(message.model) : "AI")
  //     : (session?.user?.name ?? "username");

  // const collapseToggleProps = {
  //   show: isLongMessage && status === "succeeded",
  //   collapsed,
  //   setCollapsed,
  // };

  // const tooltipsProps = {
  //   chatType,
  //   messageId: message.id,
  //   isAi: role === "model",
  //   messageModel: message.model,
  //   isSaved: message.isBookmarked,
  //   onCopy: handleCopy,
  //   onSave: handleSave,
  // };

  // const items =
  //   role === "model"
  //     ? [
  //         <ChatBubbleTooltips key="tooltips" {...tooltipsProps} />,
  //         <CollapseToggle key="collapse" {...collapseToggleProps} />,
  //       ]
  //     : [
  //         <CollapseToggle key="collapse" {...collapseToggleProps} />,
  //         <ChatBubbleTooltips key="tooltips" {...tooltipsProps} />,
  //       ];

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 px-4",
        role === "model" ? "items-start" : "items-end",
        "flex-col gap-2",
      )}
    >
      {/* <ModelAvatar name={name} image={image} /> */}

      <div
        className={`flex flex-1 flex-col items-start ${
          role == "model" ? "w-full" : ""
        }`}
      >
        <div
          className={cn(
            "text-muted-foreground mb-1 flex items-center justify-between text-sm select-none",
            role === "model" ? "w-full text-left" : "text-right",
            role === "user" && "self-end",
          )}
        >
          <div>
            {/* {role === "model" ? name : "You"} ·{" "} */}
            {new Date(createdAt).toLocaleTimeString()}
          </div>
          {role === "model" && reasoningText && (
            <div
              className="text-muted-foreground -mt-1 mb-1 ml-auto flex cursor-pointer items-center gap-1 text-sm select-none"
              onClick={() => setShowReasoning((prev) => !prev)}
            >
              <button
                className={`transition-transform duration-200 ${
                  !text && "animate-pulse"
                }`}
              >
                {showReasoning ? "Hide Thinking" : "Show Thinking"}
              </button>
            </div>
          )}
        </div>

        <div
          className={cn(
            "mx-4 inline-block rounded-md px-2 py-2 break-all whitespace-pre-wrap",
            role === "user" ? "self-end" : "self-start",
          )}
          style={
            role == "user"
              ? {
                  backgroundColor: "rgb(248, 248, 247)",
                }
              : {}
          }
        >
          {showReasoning && reasoningText && (
            <MarkdownBox content={reasoningText} />
          )}
          <MarkdownBox content={collapseText} />
          <StatusIndicator status={status} />
        </div>
        {/* <div className="mt-2 flex w-full justify-between">{items}</div> */}
      </div>
    </div>
  );
}
