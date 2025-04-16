import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { useState } from "react";
import { toast } from "sonner";
import { CollapseToggle } from "../CollapseToggle";
import { MarkdownBox } from "../MarkdownBox";
import { ModelAvatar } from "../ModelAvatar";
import { ChatBubbleTooltips } from "./ChatBubbleTooltips";

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const { userSession } = useUser();
  const { role, text: rawText } = message;

  const text = rawText ?? "";
  const isLongMessage = text.length > 150;
  const [collapsed, setCollapsed] = useState(role === "user" && isLongMessage);
  const displayedText = collapsed ? text.slice(0, 150) + "..." : text;

  const name = role === "model" ? "AI" : userSession?.user?.name ?? "username";

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
    toast.success("Saved!", {
      description: "Message saved.",
    });
  };

  const handleBranch = () => {
    console.log("start new branch");
  };

  const handleChangeModel = () => {
    console.log("change model");
  };
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
        <div className="flex justify-between w-full mt-2">
          <ChatBubbleTooltips
            isAi={role == "model"}
            onCopy={handleCopy}
            onSave={handleSave}
            onBranch={handleBranch}
            onChangeModel={handleChangeModel}
          />
          <CollapseToggle
            show={isLongMessage}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>
      </div>
    </div>
  );
}
