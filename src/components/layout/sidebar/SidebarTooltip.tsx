import { IconWithLabel } from "@/components/IconWithLabel";
import { useSidebarStore } from "@/stores/useSidebarStore";
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
  const { isMobile, collapsed, setCollapsed } = useSidebarStore();
  const router = useRouter();
  const isActive = `/${id}` == router.asPath;
  const mobileClassName = isMobile ? "px-2.5 py-3 select-none" : "px-2.5 py-2";

  const className = `
              group flex items-center gap-2 ${mobileClassName} rounded-md transition-colors w-full 
              hover:bg-white hover:font-semibold cursor-pointer select-none active:bg-white active:font-semibold ${
                isActive ? "font-semibold" : ""
              }
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
        isActive={isActive}
      />
    </button>
  );
}
