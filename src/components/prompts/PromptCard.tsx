import { Star, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Schema } from "@/types/user-prompt";

interface PromptCardProps {
  prompt: Schema;
  themeColor: string;
  onClick: (prompt: Schema) => void;
  onDelete?: (promptId: string) => void;
  onToggleStar?: (prompt: Schema) => void;
  onMakeDefault?: (promptId: string) => void;
}

export function PromptCard({
  prompt,
  themeColor,
  onClick,
  onDelete,
  onToggleStar,
  onMakeDefault,
}: PromptCardProps) {
  return (
    <div className="p-4 rounded-lg border shadow-sm hover:shadow-md transition relative group">
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem onClick={() => onToggleStar?.(prompt)}>
              {prompt.isStarred ? "Unstar" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMakeDefault?.(prompt.id)}>
              Make Default
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(prompt.id)}
              className="text-red-500"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className="h-[120px] overflow-hidden text-sm whitespace-pre-wrap cursor-pointer"
        onClick={() => onClick(prompt)}
      >
        {prompt.text}
      </div>
      <div className="mt-4 font-semibold truncate flex items-center gap-1">
        {prompt.isStarred && <Star size={14} fill={`rgb(${themeColor})`} />}
        <span>{prompt.title}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        {new Date(prompt.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
