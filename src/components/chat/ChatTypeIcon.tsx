import type { Chat } from "@/types";
import { BookHeart, FolderRoot, GitBranch } from "lucide-react";

const iconMap = {
  chat: FolderRoot,
  branch: GitBranch,
  gratitudeJournal: BookHeart,
};

export function getChatTypeIcon(chatType: Chat.Type, iconClassName?: string) {
  const IconComponent = iconMap[chatType];
  if (!IconComponent) return null;
  return <IconComponent size={16} className={iconClassName} />;
}
