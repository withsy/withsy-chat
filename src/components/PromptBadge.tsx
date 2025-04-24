import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function PromptBadge({
  title,
  isStar,
  color,
}: {
  title: string;
  isStar: boolean;
  color: string;
}) {
  return (
    <Badge
      className="flex items-center gap-1 rounded-full text-xs font-medium px-2 py-1 select-none"
      variant="outline"
    >
      {isStar && <Star size={12} fill={`rgb(${color})`} />}
      {title}
    </Badge>
  );
}
