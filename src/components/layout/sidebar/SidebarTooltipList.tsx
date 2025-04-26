import { CollapseButton } from "@/components/CollapseButton";
import UserDropdownMenu from "@/components/UserDropdownMenu";
import { Archive, Bookmark, PenLine, Smile } from "lucide-react";
import { SidebarTooltip } from "./SidebarTooltip";

export default function SidebarTooltipList() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <UserDropdownMenu />
        <CollapseButton />
      </div>
      <SidebarTooltip
        id={"friends"}
        icon={Smile}
        fill={true}
        label={"Friends"}
        size={16}
      />
      <SidebarTooltip
        id={"moments"}
        icon={Archive}
        fill={true}
        label={"Moments"}
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
