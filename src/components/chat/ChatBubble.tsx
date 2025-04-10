import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils"; // optional: classnames helper
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // or just use lucide icon
import { modelAvatarMap } from "@/lib/avatar-utils";
import { ModelAvatar } from "../ModelAvatar";

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const isAI = message.isAI;
  const username = "Jenn";
  const fallbackName = isAI ? message.model ?? "AI" : username ?? "You";
  return (
    <div className={cn("flex gap-3", isAI ? "flex-row" : "flex-row-reverse")}>
      <ModelAvatar name={fallbackName} />

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
