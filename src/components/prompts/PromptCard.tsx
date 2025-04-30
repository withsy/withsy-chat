import { Star, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Schema } from "@/types/user-prompt";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PromptCardProps {
  prompt: Schema;
  themeColor: string;
  onClick: (prompt: Schema) => void;
  onDelete?: (promptId: string) => void;
  onToggleStar?: (prompt: Schema) => void;
  onMakeDefault?: (promptId: string) => void;
  chatId?: string;
  active?: boolean;
}

export function PromptCard({
  prompt,
  themeColor,
  onClick,
  onDelete,
  onToggleStar,
  onMakeDefault,
  chatId,
  active,
}: PromptCardProps) {
  const updateChat = trpc.chat.update.useMutation({
    onSuccess: () => {
      toast.success("Prompt applied", {
        description: "This prompt has been set as active.",
      });
    },
    onError: (error) => {
      toast.error("Failed to apply prompt", {
        description: error.message ?? "Something went wrong.",
      });
    },
  });
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
        {chatId && (
          <button
            className="text-xs font-medium text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              updateChat.mutate({
                chatId,
                userPromptId: prompt.id,
              });
            }}
          >
            {active ? "Applied" : "Apply"}
          </button>
        )}
      </div>
    </div>
  );
}
