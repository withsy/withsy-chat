import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarStyleStore } from "@/stores/useAvatarStyleStore";
import { getModelAvatar } from "@/lib/avatar-utils";

type Props = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  path?: string;
  image?: string;
};

export function ModelAvatar({ name, size = "md", path, image }: Props) {
  const avatarStyle = useAvatarStyleStore((s) => s.style);

  const src = image ? image : path ? path : getModelAvatar(name, avatarStyle);

  const sizeClass = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-16 h-16 text-lg",
  }[size];

  const className = `${sizeClass} select-none`;

  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={name} draggable={false} />
      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
