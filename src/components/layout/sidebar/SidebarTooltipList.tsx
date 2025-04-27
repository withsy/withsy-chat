import { CollapseButton } from "@/components/CollapseButton";
import UserDropdownMenu from "@/components/UserDropdownMenu";
import { Bookmark, PenLine, TableProperties } from "lucide-react";
import { SidebarTooltip } from "./SidebarTooltip";

export default function SidebarTooltipList() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <UserDropdownMenu />
        <CollapseButton />
      </div>
      <SidebarTooltip
        id={"prompts"}
        icon={TableProperties}
        fill={true}
        label={"Prompts"}
        size={16}
      />
      <SidebarTooltip
        id={"saved"}
        icon={Bookmark}
        fill={true}
        label={"All Saved"}
        size={16}
      />
      <SidebarTooltip
        id={"chat"}
        icon={PenLine}
        fill={true}
        label={"New Chat"}
        size={16}
      />
    </div>
  );
}
