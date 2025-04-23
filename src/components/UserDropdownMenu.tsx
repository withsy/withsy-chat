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
  BookText,
  Image,
  LogOut,
  MailOpen,
  Palette,
  Settings,
  SquareTerminal,
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
  const { isMobile } = useSidebarStore();

  return (
    <DropdownMenuItem
      onSelect={onClick}
      className={cn(
        "flex items-center active:bg-gray-100",
        isMobile ? "py-3 px-2" : "py-2 px-2"
      )}
    >
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
    </DropdownMenuItem>
  );
}

export default function UserDropdownMenu() {
  const { userPrefs, userSession } = useUser();

  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const userMenuItems: MenuItem[] = [
    { icon: Image, label: "Models" },
    { icon: SquareTerminal, label: "Prompts" },
    {
      icon: Palette,
      label: "Theme",
      onClick: () => setThemeModalOpen(true),
    },
    { icon: Settings, label: "Settings" },
    "separator",
    { icon: BookText, label: "Guide" },
    { icon: MailOpen, label: "Contact" },
    "separator",
    {
      icon: LogOut,
      label: "Log out",
      onClick: async () => {
        signOut({ callbackUrl: "/" });
      },
    },
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
          className={cn(
            "w-48 p-2",
            userPrefs.largeText ? "text-lg" : "text-base"
          )}
        >
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
          <DropdownMenuSeparator key={`sep-text`} />
          <div className="flex justify-center p-2">
            <span className="text-xs text-muted-foreground select-none">
              withsy with{" "}
              <span
                style={{
                  color: `rgb(${userPrefs.themeColor})`,
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
