import { useSidebar } from "@/context/SidebarContext";
import { type LucideIcon } from "lucide-react";

interface IconWithLabelProps {
  icon: LucideIcon;
  label?: string;
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
  const { userPrefs } = useSidebar();
  const { themeColor } = userPrefs;
  const className = `transition-colors hover:text-black group-hover:text-black`;
  return (
    <>
      <Icon size={size} className={className} fill="none" />
      {fill && (
        <Icon
          size={size}
          className="absolute opacity-0 group-hover:opacity-100 text-black transition-all"
          style={{
            fill: `rgb(${themeColor})`,
          }}
        />
      )}
      {!collapsed && label && <span className="relative z-10">{label}</span>}
    </>
  );
}
