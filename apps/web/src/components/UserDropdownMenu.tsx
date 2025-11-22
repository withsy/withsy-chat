import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
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
import { Label } from "@/components/ui/label";

interface UserMenuItemProps {
  icon: LucideIcon;
  label: string;
  largeText?: boolean;
  onClick?: () => void;
  checked?: boolean;
  preventClose?: boolean;
}

type MenuActionItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  checked?: boolean;
};

type MenuItem = "separator" | MenuActionItem;

function UserMenuItem({
  icon: Icon,
  label,
  largeText = false,
  onClick,
  checked = false,
  preventClose = false,
}: UserMenuItemProps) {
  const { isMobile } = useSidebarStore();

  const base = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "flex items-center justify-between rounded px-2 py-2 hover:bg-gray-100 cursor-pointer w-full",
        largeText ? "text-lg" : "text-sm"
      )}
    >
      <div className="flex items-center">
        <Icon className={cn("mr-2", isMobile ? "h-6 w-6" : "h-4 w-4")} />
        <Label className="text-black">{label}</Label>
      </div>
      <div>
        {checked && (
          <Check
            className="h-4 w-4"
            style={{ color: `rgb(var(--theme-color))` }}
          />
        )}
      </div>
    </div>
  );

  if (isMobile) return base;

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        if (preventClose) e.preventDefault();
        onClick?.();
      }}
      className="p-0"
    >
      {base}
    </DropdownMenuItem>
  );
}

export default function UserDropdownMenu() {
  const { isMobile } = useSidebarStore();
  const { user, setUserPrefsAndSave } = useUser();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  // Theme 메뉴 아이템 클릭 시 드롭다운과 드로어를 닫고 테마 모달 열기
  const handleThemeClick = () => {
    // 모바일일 경우 드로어 닫기
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      // 데스크탑일 경우 드롭다운 닫기
      setDropdownOpen(false);
    }

    // 약간의 딜레이 후 테마 모달 열기
    setTimeout(() => {
      setThemeModalOpen(true);
    }, 100);
  };

  const preferenceItems = [
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

  const userMenuItems: MenuItem[] = [
    "separator",
    {
      icon: Palette,
      label: "Theme",
      onClick: handleThemeClick,
    },
    "separator",
    {
      icon: LogOut,
      label: "Log out",
      onClick: async () => signOut({ callbackUrl: "/" }),
    },
  ];

  const renderMenuItems = () => (
    <>
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
          <DropdownMenuSeparator key={`sep-${idx}`} className="px-4" />
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
      <DropdownMenuSeparator className="px-4" />
      <div className="flex justify-center p-2">
        <span className="text-xs text-muted-foreground select-none">
          withsy with{" "}
          <span style={{ color: `rgb(${user.preferences.themeColor})` }}>
            ♥
          </span>
        </span>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <>
          {/* 버튼은 항상 동일하게 */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "cursor-pointer flex items-center rounded-md w-full gap-2 px-2.5 py-3 hover:bg-white active:bg-white font-semibold select-none"
            )}
          >
            <ModelAvatar
              name={user.name ?? ""}
              image={user.imageUrl}
              size="sm"
            />
            <span>{user.name}</span>
          </button>
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="p-4 space-y-2">
              {renderMenuItems()}
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "cursor-pointer flex items-center rounded-md w-full gap-2 px-2.5 py-2 font-semibold select-none",
                dropdownOpen ? "bg-white" : "hover:bg-white active:bg-white"
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
              "w-48 p-2 m-2 justify-between",
              user.preferences.largeText ? "text-lg" : "text-base"
            )}
          >
            {renderMenuItems()}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ThemeSettingsModal
        open={themeModalOpen}
        setThemeModalOpen={setThemeModalOpen}
      />
    </>
  );
}
