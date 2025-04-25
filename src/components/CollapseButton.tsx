import { useSidebarStore } from "@/stores/useSidebarStore";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

export function CollapseButton() {
  const { collapsed, toggle } = useSidebarStore();

  const iconSize = 16;

  const buttonClassName = `cursor-pointer rounded-md group w-8 h-8 flex items-center justify-center hover:bg-white active:bg-white`;
  return (
    <button onClick={toggle} className={buttonClassName}>
      {collapsed ? (
        <ChevronsRight size={iconSize} className="group-hover:text-black" />
      ) : (
        <ChevronsLeft size={iconSize} className="group-hover:text-black" />
      )}
    </button>
  );
}
