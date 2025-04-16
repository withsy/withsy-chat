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
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import {
  Cpu,
  LogOut,
  MessageSquare,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ModelAvatar } from "./ModelAvatar";
import { ThemeSettingsModal } from "./modal/ThemeSettingsModal";

interface MenuActionItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

type MenuItem = "separator" | MenuActionItem;

interface ToggleMenuItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
  largeText?: boolean;
  themeColor?: string;
}

export function ToggleMenuItem({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  tooltip,
  largeText = false,
  themeColor,
}: ToggleMenuItemProps) {
  const content = (
    <div className="flex items-center justify-between px-2 py-1.5 opacity-100">
      <Label htmlFor={id} className={cn(largeText && "text-lg", "px-2")}>
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        style={{
          backgroundColor: checked ? `rgb(${themeColor})` : undefined,
        }}
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
  const { userPrefs, setUserPrefAndSave, userPrefLoadings, userSession } =
    useUser();

  const { largeText } = userPrefs;
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const toggleItems = [
    {
      id: "largeText",
      label: "Large Text",
    },
  ] as const;

  const userMenuItems: MenuItem[] = [
    "separator",
    { icon: MessageSquare, label: "Prompts" },
    { icon: Cpu, label: "Models" },
    {
      icon: Palette,
      label: "Theme",
      onClick: () => setThemeModalOpen(true),
    },
    { icon: Settings, label: "Settings" },
    "separator",
    { icon: LogOut, label: "Log out", onClick: () => signOut() },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="cursor-pointer">
            <ModelAvatar name={userSession?.user?.name ?? ""} />
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
              checked={userPrefs[id]}
              onChange={(v) => setUserPrefAndSave(id, v)}
              disabled={userPrefLoadings[id]}
              largeText={userPrefs["largeText"]}
              themeColor={userPrefs.themeColor}
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
                largeText={userPrefs["largeText"]}
                onClick={item.onClick}
              />
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ThemeSettingsModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </>
  );
}
