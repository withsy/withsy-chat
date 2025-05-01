import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useChatStore } from "@/stores/useChatStore";
import type { UserPrompt } from "@/types";
import { MoreVertical, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface PromptCardProps {
  prompt: UserPrompt.Data;
  themeColor: string;
  onClick: (prompt: UserPrompt.Data) => void;
  onDelete?: (promptId: string) => void;
  onToggleStar?: (prompt: UserPrompt.Data) => void;
  onMakeDefault?: (promptId: string) => void;
  isActive?: boolean;
  isDefault?: boolean;
}

export function PromptCard({
  prompt,
  themeColor,
  onClick,
  onDelete,
  onToggleStar,
  onMakeDefault,
  isActive,
  isDefault,
}: PromptCardProps) {
  const { chat, updatePromptId } = useChatStore();
  const updateChat = trpc.chat.update.useMutation({
    onSuccess: (_data, variables) => {
      if (variables.userPromptId === null) {
        toast.success("Prompt cleared", {
          description: "The active prompt has been removed.",
        });
        updatePromptId(null);
      } else {
        toast.success("Prompt applied", {
          description: "This prompt has been set as active.",
        });
        updatePromptId(variables.userPromptId ?? null);
      }
    },
    onError: (error) => {
      toast.error("Failed to apply prompt", {
        description: error.message ?? "Something went wrong.",
      });
    },
  });

  const cornerButton = isDefault ? (
    <Badge>default</Badge>
  ) : chat != null ? (
    isActive ? (
      <button
        className="text-xs font-medium text-primary hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          updateChat.mutate({
            chatId: chat.id,
            userPromptId: null,
          });
        }}
      >
        Clear
      </button>
    ) : (
      <button
        className="text-xs font-medium text-primary hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          updateChat.mutate({
            chatId: chat.id,
            userPromptId: prompt.id,
          });
        }}
      >
        Apply
      </button>
    )
  ) : (
    <div />
  );

  return (
    <div className="p-4 rounded-lg border shadow-sm hover:shadow-md transition relative group">
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {(onToggleStar || onMakeDefault || onDelete) && (
              <button className="p-1 hover:bg-muted rounded">
                <MoreVertical size={16} />
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            {onToggleStar && (
              <DropdownMenuItem onClick={() => onToggleStar?.(prompt)}>
                {prompt.isStarred ? "Unstar" : "Star"}
              </DropdownMenuItem>
            )}
            {onMakeDefault && (
              <DropdownMenuItem onClick={() => onMakeDefault?.(prompt.id)}>
                Make Default
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete?.(prompt.id)}
                className="text-red-500"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className="h-[120px] overflow-hidden text-sm whitespace-pre-wrap cursor-pointer"
        onClick={() => onClick(prompt)}
      >
        {prompt.text}
      </div>
      <div className="mt-4 font-semibold flex justify-between items-center gap-1">
        <div className="truncate flex items-center gap-1">
          {prompt.isStarred && <Star size={14} fill={`rgb(${themeColor})`} />}
          <span>{prompt.title}</span>
        </div>
        {cornerButton}
      </div>
    </div>
  );
}
