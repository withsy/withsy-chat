import { Star } from "lucide-react";
import type { Schema } from "@/types/user-prompt";

interface PromptCardProps {
  prompt: Schema;
  themeColor: string;
  onClick: (prompt: Schema) => void;
}

export function PromptCard({ prompt, themeColor, onClick }: PromptCardProps) {
  return (
    <div
      key={prompt.id}
      className="p-4 rounded-lg border shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => onClick(prompt)}
    >
      <div className="h-[120px] overflow-hidden text-sm whitespace-pre-wrap">
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
