import { useSidebar } from "@/context/SidebarContext";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import UserDropdownMenu from "../UserDropdownMenu";
import { datas, SidebarTooltip } from "./sidebar/SidebarTooltip";

export default function Header() {
  const { collapsed, toggle } = useSidebar();
  const iconSize = 24;
  return (
    <header className="flex items-center justify-between h-16 px-4 py-1 z-50">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="cursor-pointer rounded-md group w-9 h-9 flex items-center justify-center hover:bg-white"
        >
          {collapsed ? (
            <PanelRightClose
              size={iconSize}
              className="group-hover:text-black text-gray-500"
            />
          ) : (
            <PanelRightOpen
              size={iconSize}
              className="group-hover:text-black text-gray-500"
            />
          )}
        </button>
        {datas.map((data) => (
          <SidebarTooltip
            key={data.id}
            id={data.id}
            icon={data.icon}
            label={data.label}
            fill={data.fill}
            size={iconSize}
          />
        ))}
      </div>

      <div className="flex items-center ml-auto gap-2">
        <UserDropdownMenu />
      </div>
    </header>
  );
}
