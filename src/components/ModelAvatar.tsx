// components/ModelAvatar.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getModelAvatar } from "@/lib/avatar-utils";

type Props = {
  name: string;
  size?: "sm" | "md" | "lg";
};

export function ModelAvatar({ name, size = "md" }: Props) {
  const src = getModelAvatar(name);

  const sizeClass = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  }[size];

  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={src} alt={name} draggable={false} />
      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
