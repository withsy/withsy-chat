import { useSidebarStore } from "@/stores/useSidebarStore";
import { PanelRightClose, PanelRightOpen, PenLine } from "lucide-react";
import { useRouter } from "next/router";

export function HeaderTooltipGroup() {
  const { isMobile, setCollapsed, collapsed, toggle } = useSidebarStore();
  const router = useRouter();

  const iconSize = 20;
  const handleLinkClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
    router.push(`/chat`);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className={`cursor-pointer rounded-md group w-8 h-8 flex items-center justify-center hover:bg-white active:bg-white`}
      >
        {collapsed ? (
          <PanelRightClose size={iconSize} className="group-hover:text-black" />
        ) : (
          <PanelRightOpen size={iconSize} className="group-hover:text-black" />
        )}
      </button>
      <button
        onClick={handleLinkClick}
        className={`cursor-pointer rounded-md group w-8 h-8 flex items-center justify-center hover:bg-white active:bg-white`}
      >
        <PenLine size={iconSize} className="group-hover:text-black" />
      </button>
    </div>
  );
}
