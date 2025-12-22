import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useUpdateUserPreferences } from "@/hooks/useUpdateUserPreferences";
import { useUserPreference } from "@/hooks/useUserPreference";
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
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { ModelAvatar } from "./ModelAvatar";
import { ThemeSettingsModal } from "./modal/ThemeSettingsModal";

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
        "flex w-full cursor-pointer items-center justify-between rounded px-2 py-2 hover:bg-gray-100",
        largeText ? "text-lg" : "text-sm",
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
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const enterToSend = useUserPreference("enterToSend");
  const largeText = useUserPreference("largeText");
  const wideView = useUserPreference("wideView");
  const themeColor = useUserPreference("themeColor");
  const { updateUserPreferences } = useUpdateUserPreferences();

  const { data: session } = useSession({
    required: true,
  });
  const name = session?.user?.name ?? "";
  const image = session?.user?.image ?? "";

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
      checked: enterToSend,
      onClick: () => updateUserPreferences({ enterToSend: !enterToSend }),
    },
    {
      icon: Text,
      label: "Large text",
      checked: largeText,
      onClick: () => updateUserPreferences({ largeText: !largeText }),
    },
    {
      icon: Layout,
      label: "Wide view",
      checked: wideView,
      onClick: () => updateUserPreferences({ wideView: !wideView }),
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
          largeText={largeText}
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
            largeText={largeText}
            onClick={item.onClick}
          />
        ),
      )}
      <DropdownMenuSeparator className="px-4" />
      <div className="flex justify-center p-2">
        <span className="text-muted-foreground text-xs select-none">
          withsy with <span style={{ color: `rgb(${themeColor})` }}>♥</span>
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
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-3 font-semibold select-none hover:bg-white active:bg-white",
            )}
          >
            <ModelAvatar size="sm" name={name} image={image} />
            {name && <span>{name}</span>}
          </button>
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="space-y-2 p-4">
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
                "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 font-semibold select-none",
                dropdownOpen ? "bg-white" : "hover:bg-white active:bg-white",
              )}
            >
              <ModelAvatar size="sm" name={name} image={image} />
              {name && <span>{name}</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              "m-2 w-48 justify-between p-2",
              largeText ? "text-lg" : "text-base",
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
