import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPreference } from "@/hooks/useUser";
import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { MoreVertical, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface PromptCardProps {
  prompt: UserPromptData;
  onClick: (prompt: UserPromptData) => void;
  onDelete?: (promptId: string) => void;
  onToggleStar?: (prompt: UserPromptData) => void;
  onMakeDefault?: (promptId: string | null) => void;
  isActive?: boolean;
  isDefault?: boolean;
}

export function PromptCard({
  prompt,
  onClick,
  onDelete,
  onToggleStar,
  onMakeDefault,
  isActive,
  isDefault,
}: PromptCardProps) {
  const trpc = useTRPC();
  const themeColor = useUserPreference("themeColor");

  const { chat, updatePromptId } = useChatStore();
  const updateChat = useMutation(
    trpc.chat.update.mutationOptions({
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
    }),
  );

  const cornerButton = isDefault ? (
    <Badge style={{ backgroundColor: `rgb(${themeColor})` }}>default</Badge>
  ) : chat != null ? (
    isActive ? (
      <button
        className="text-primary rounded-sm bg-gray-200 px-2 py-1 text-xs font-medium hover:underline"
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
        className="text-primary rounded-sm bg-gray-200 px-2 py-1 text-xs font-medium hover:underline"
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
    <div className="group relative rounded-lg border p-4 shadow-sm transition hover:shadow-md">
      <div
        className="absolute top-2 right-2 opacity-0 transition group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {(onToggleStar || onMakeDefault || onDelete) && (
              <button className="hover:bg-muted rounded p-1">
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
            {onMakeDefault &&
              (isDefault ? (
                <DropdownMenuItem onClick={() => onMakeDefault?.(null)}>
                  Remove Default
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onMakeDefault?.(prompt.id)}>
                  Make Default
                </DropdownMenuItem>
              ))}
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
        className="h-[120px] cursor-pointer overflow-hidden text-sm whitespace-pre-wrap"
        onClick={() => onClick(prompt)}
      >
        {prompt.text}
      </div>
      <div className="mt-4 flex items-center justify-between gap-1 font-semibold">
        <div className="flex min-w-0 items-center gap-1">
          {prompt.isStarred && (
            <Star
              size={16}
              fill={`rgb(${user.preferences.themeColor})`}
              className="shrink-0"
            />
          )}
          <span className="block truncate leading-none">{prompt.title}</span>
        </div>
        {cornerButton}
      </div>
    </div>
  );
}
