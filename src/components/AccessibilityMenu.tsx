import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/UserContext";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Check, WandSparkles } from "lucide-react";
import { useState } from "react";
import { IconWithLabel } from "./IconWithLabel";

export function AccessibilityMenu({ hideLabels }: { hideLabels: boolean }) {
  const { user, setUserPrefsAndSave } = useUser();
  if (!user) throw new Error("User must exist.");

  const { isMobile } = useSidebarStore();

  const [modalOpen, setModalOpen] = useState(false);

  const items = [
    {
      label: "Enter to send",
      key: "enterToSend",
      value: user.preferences.enterToSend,
      onToggle: () =>
        setUserPrefsAndSave({ enterToSend: !user.preferences.enterToSend }),
    },
    {
      label: "Large text",
      key: "largeText",
      value: user.preferences.largeText,
      onToggle: () =>
        setUserPrefsAndSave({ largeText: !user.preferences.largeText }),
    },
    {
      label: "Wide view (PC only)",
      key: "wideView",
      value: user.preferences.wideView,
      onToggle: () =>
        setUserPrefsAndSave({ wideView: !user.preferences.wideView }),
    },
  ];

  const buttonClassName =
    "group flex items-center gap-1 rounded-md px-1 py-2 active:bg-white hover:bg-white hover:font-semibold active:bg-white active:font-semibold transition-colors";

  const renderItems = () =>
    items.map(({ label, value, onToggle, key }) => (
      <DropdownMenuItem
        key={key}
        onClick={onToggle}
        className="flex items-center justify-between"
      >
        {label}
        {value && (
          <Check
            className="w-4 h-4"
            style={{ color: `rgb(${user.preferences.themeColor})` }}
          />
        )}
      </DropdownMenuItem>
    ));

  if (isMobile) {
    return (
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <button className={buttonClassName} aria-label="Accessibility">
            <WandSparkles className="w-4 h-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Preferences</h2>
            {items.map(({ label, value, onToggle, key }) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 rounded cursor-pointer active:bg-gray-100"
                onClick={onToggle}
              >
                {label}
                {value && (
                  <Check
                    className="w-4 h-4"
                    style={{ color: `rgb(${user.preferences.themeColor})` }}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={buttonClassName} aria-label="Accessibility">
          <IconWithLabel icon={WandSparkles} fill={true} />
          {!hideLabels && <span className="select-none">Preferences</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {renderItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
