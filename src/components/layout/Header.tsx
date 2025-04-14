import UserDropdownMenu from "../UserDropdownMenu";
import { SidebarTooltipGroup } from "./sidebar/SidebarTooltip";

export default function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-4 py-1 z-50">
      <SidebarTooltipGroup />
      <div className="flex items-center ml-auto gap-2">
        <UserDropdownMenu />
      </div>
    </header>
  );
}
