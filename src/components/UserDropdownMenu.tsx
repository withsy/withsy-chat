import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/context/SidebarContext";
import {
  Archive,
  Cpu,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface ToggleMenuItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
}

export function ToggleMenuItem({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  tooltip,
}: ToggleMenuItemProps) {
  const content = (
    <div className="flex items-center justify-between px-2 py-1.5 opacity-100">
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );

  return tooltip && disabled ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="left">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    content
  );
}

interface UserMenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

function UserMenuItem({ icon: Icon, label, onClick }: UserMenuItemProps) {
  return (
    <DropdownMenuItem onSelect={onClick}>
      <Icon className="mr-2 h-4 w-4 text-black" />
      {label}
    </DropdownMenuItem>
  );
}

export default function UserDropdownMenu() {
  const { isMobile, userPrefs, setUserPrefAndSave, userPrefLoadings } =
    useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer select-none">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/thumbs/svg?seed=Yejin`}
            draggable={false}
          />
          <AvatarFallback>YJ</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 mt-2">
        <ToggleMenuItem
          id="tab-toggle"
          label="Wide View"
          checked={userPrefs["wideView"]}
          onChange={(v) => setUserPrefAndSave("wideView", v)}
          disabled={userPrefLoadings["wideView"]}
        />
        <ToggleMenuItem
          id="tab-toggle"
          label="Large Text"
          checked={userPrefs["largeText"]}
          onChange={(v) => setUserPrefAndSave("largeText", v)}
          disabled={userPrefLoadings["largeText"]}
        />
        <ToggleMenuItem
          id="tab-toggle"
          label="Enable Tabs"
          checked={userPrefs["enableTabs"]}
          onChange={(v) => setUserPrefAndSave("enableTabs", v)}
          disabled={userPrefLoadings["enableTabs"] || isMobile}
          tooltip="Tabs are not supported on mobile"
        />
        <ToggleMenuItem
          id="index-toggle"
          label="Show Index"
          checked={userPrefs["showIndex"]}
          onChange={(v) => setUserPrefAndSave("showIndex", v)}
          disabled={userPrefLoadings["showIndex"] || isMobile}
          tooltip="Index is not supported on mobile"
        />
        <DropdownMenuSeparator />
        <UserMenuItem icon={Archive} label="Archive" />
        <UserMenuItem icon={MessageSquare} label="Prompts" />
        <UserMenuItem icon={Cpu} label="Models" />
        <DropdownMenuSeparator />
        <UserMenuItem icon={Settings} label="Settings" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
