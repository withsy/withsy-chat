import type { ChatType } from "@/types/chat";
import { BookHeart, FolderRoot, GitBranch } from "lucide-react";

const iconMap = {
  chat: FolderRoot,
  branch: GitBranch,
  gratitudeJournal: BookHeart,
};

export function getChatTypeIcon(chatType: ChatType, iconClassName?: string) {
  const IconComponent = iconMap[chatType];
  if (!IconComponent) return null;
  return <IconComponent size={16} className={iconClassName} />;
}
