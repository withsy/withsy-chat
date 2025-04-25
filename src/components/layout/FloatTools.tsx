import { useSidebarStore } from "@/stores/useSidebarStore";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

export function FloatTools() {
  const { collapsed, toggle } = useSidebarStore();

  const iconSize = 20;

  const buttonClassName = `cursor-pointer rounded-md group w-8 h-8 flex items-center justify-center hover:bg-white active:bg-white`;
  return (
    <div className="flex items-center gap-3">
      <button onClick={toggle} className={buttonClassName}>
        {collapsed ? (
          <PanelRightClose size={iconSize} className="group-hover:text-black" />
        ) : (
          <PanelRightOpen size={iconSize} className="group-hover:text-black" />
        )}
      </button>
    </div>
  );
}
