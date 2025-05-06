import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import {
  Check,
  CornerDownLeft,
  Layout,
  LogOut,
  Palette,
  Text,
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
  checked?: boolean;
}

type MenuItem = "separator" | MenuActionItem;

interface UserMenuItemProps {
  icon: LucideIcon;
  label: string;
  largeText?: boolean;
  onClick?: () => void;
  checked?: boolean;
  preventClose?: boolean;
}

function UserMenuItem({
  icon: Icon,
  label,
  largeText = false,
  onClick,
  checked = false,
  preventClose = false,
}: UserMenuItemProps) {
  const { isMobile } = useSidebarStore();

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        if (preventClose) {
          e.preventDefault();
        }
        onClick?.();
      }}
      className={cn(
        "flex items-center justify-between active:bg-gray-100",
        isMobile ? "py-3 px-2" : "py-2 px-2"
      )}
    >
      <div className="flex items-center">
        <Icon className={cn("mr-2", isMobile ? "h-6 w-6" : "h-4 w-4")} />
        <Label
          className={cn(
            "text-black",
            isMobile ? "text-lg" : "",
            largeText && "text-lg"
          )}
        >
          {label}
        </Label>
      </div>
      {checked && (
        <Check
          className="h-4 w-4"
          style={{ color: `rgb(var(--theme-color))` }}
        />
      )}
    </DropdownMenuItem>
  );
}

export default function UserDropdownMenu() {
  const { isMobile } = useSidebarStore();
  const { user, setUserPrefsAndSave } = useUser();

  const [themeModalOpen, setThemeModalOpen] = useState(false);

  if (!user) return null;

  const userMenuItems: MenuItem[] = [
    "separator",
    {
      icon: Palette,
      label: "Theme",
      onClick: () => setThemeModalOpen(true),
    },
  ];

  const preferenceItems: MenuActionItem[] = [
    {
      icon: CornerDownLeft,
      label: "Enter to send",
      checked: user.preferences.enterToSend,
      onClick: () =>
        setUserPrefsAndSave({ enterToSend: !user.preferences.enterToSend }),
    },
    {
      icon: Text,
      label: "Large text",
      checked: user.preferences.largeText,
      onClick: () =>
        setUserPrefsAndSave({ largeText: !user.preferences.largeText }),
    },
    {
      icon: Layout,
      label: "Wide view",
      checked: user.preferences.wideView,
      onClick: () =>
        setUserPrefsAndSave({ wideView: !user.preferences.wideView }),
    },
  ];

  const mobileClassName = isMobile ? "px-2.5 py-3" : "px-2.5 py-2";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "cursor-pointer flex items-center rounded-md w-full gap-2",
              mobileClassName,
              "hover:bg-white active:bg-white font-semibold select-none"
            )}
          >
            <ModelAvatar
              name={user.name ?? ""}
              image={user.imageUrl}
              size="sm"
            />
            <span>{user.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            "w-48 p-2 m-2",
            user.preferences.largeText ? "text-lg" : "text-base"
          )}
        >
          {preferenceItems.map((item) => (
            <UserMenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              largeText={user.preferences.largeText}
              onClick={item.onClick}
              checked={item.checked}
              preventClose
            />
          ))}
          {userMenuItems.map((item, idx) =>
            item === "separator" ? (
              <DropdownMenuSeparator className="px-4" key={`sep-${idx}`} />
            ) : (
              <UserMenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                largeText={user.preferences.largeText}
                onClick={item.onClick}
              />
            )
          )}
          <UserMenuItem
            key="Log out"
            icon={LogOut}
            label="Log out"
            largeText={user.preferences.largeText}
            onClick={async () => {
              signOut({ callbackUrl: "/" });
            }}
          />

          <DropdownMenuSeparator className="px-4" />

          {/* Footer */}
          <div className="flex justify-center p-2">
            <span className="text-xs text-muted-foreground select-none">
              withsy with{" "}
              <span
                style={{
                  color: `rgb(${user.preferences.themeColor})`,
                }}
              >
                ♥
              </span>
            </span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeSettingsModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </>
  );
}
