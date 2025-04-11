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
import { cn } from "@/lib/utils";
import {
  Archive,
  Cpu,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ModelAvatar } from "./ModelAvatar";

interface ToggleMenuItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
  largeText?: boolean;
}

export function ToggleMenuItem({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  tooltip,
  largeText = false,
}: ToggleMenuItemProps) {
  const content = (
    <div className="flex items-center justify-between px-2 py-1.5 opacity-100">
      <Label htmlFor={id} className={cn(largeText && "text-lg")}>
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
  largeText?: boolean;
  onClick?: () => void;
}

function UserMenuItem({
  icon: Icon,
  label,
  largeText = false,
  onClick,
}: UserMenuItemProps) {
  return (
    <DropdownMenuItem onSelect={onClick}>
      <Icon className="mr-2 h-4 w-4 text-black" />
      <Label className={cn(largeText && "text-lg")}>{label}</Label>
    </DropdownMenuItem>
  );
}

export default function UserDropdownMenu() {
  const username = "Jenn";
  const { userPrefs, setUserPrefAndSave, userPrefLoadings } = useSidebar();
  const largeText = userPrefs["largeText"];

  const toggleItems = [
    {
      id: "wideView",
      label: "Wide View",
    },
    {
      id: "largeText",
      label: "Large Text",
    },
    {
      id: "enableTabs",
      label: "Enable Tabs",
    },
    {
      id: "showIndex",
      label: "Show Index",
    },
  ] as const;

  const userMenuItems = [
    "separator",
    { icon: Archive, label: "Archive" },
    { icon: MessageSquare, label: "Prompts" },
    { icon: Cpu, label: "Models" },
    "separator",
    { icon: Settings, label: "Settings" },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="cursor-pointer">
          <ModelAvatar name={username} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn("w-48 mt-2", largeText ? "text-lg" : "text-base")}
      >
        {toggleItems.map(({ id, label }) => (
          <ToggleMenuItem
            key={id}
            id={`${id}-toggle`}
            label={label}
            checked={userPrefs[id] ?? false}
            onChange={(v) => setUserPrefAndSave(id, v)}
            disabled={userPrefLoadings[id]}
            largeText={userPrefs["largeText"] ?? false}
          />
        ))}
        {userMenuItems.map((item, idx) =>
          item === "separator" ? (
            <DropdownMenuSeparator key={`sep-${idx}`} />
          ) : (
            <UserMenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              largeText={userPrefs["largeText"] ?? false}
            />
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
