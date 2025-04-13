import { type LucideIcon } from "lucide-react";

interface IconWithLabelProps {
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  fill?: boolean;
  size?: number;
}

export function IconWithLabel({
  icon: Icon,
  label,
  collapsed = false,
  fill = false,
  size = 16,
}: IconWithLabelProps) {
  return (
    <>
      <Icon
        size={size}
        className="group-hover:text-primary transition-colors text-gray-500"
        fill="none"
      />
      {fill && (
        <Icon
          size={size}
          className="absolute opacity-0 group-hover:opacity-100 text-primary transition-all"
          fill="currentColor"
        />
      )}
      {!collapsed && <span className="relative z-10">{label}</span>}
    </>
  );
}
