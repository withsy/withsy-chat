import { IconWithLabel } from "@/components/IconWithLabel";
import { useSidebar } from "@/context/SidebarContext";
import { type LucideIcon } from "lucide-react";
import { useRouter } from "next/router";

interface SidebarTooltipProps {
  id: string;
  icon: LucideIcon;
  label?: string;
  fill?: boolean;
  size?: number;
}

export function SidebarTooltip({
  id,
  icon: Icon,
  label,
  fill,
  size = 24,
}: SidebarTooltipProps) {
  const { isMobile, collapsed, setCollapsed } = useSidebar();
  const router = useRouter();

  const className = `
              group flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors w-full 
              hover:bg-white cursor-pointer
            `;
  const handleLinkClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
    router.push(`/${id}`);
  };

  return (
    <button className={className} onClick={handleLinkClick}>
      <IconWithLabel
        icon={Icon}
        label={label}
        collapsed={collapsed}
        fill={fill}
        size={size}
      />
    </button>
  );
}
