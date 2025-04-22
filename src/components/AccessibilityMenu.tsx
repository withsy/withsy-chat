import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/UserContext";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Check, PersonStanding } from "lucide-react";
import { useState } from "react";

export function AccessibilityMenu({ hideLabels }: { hideLabels: boolean }) {
  const { userPrefs, setUserPrefsAndSave } = useUser();
  const { isMobile } = useSidebarStore();

  const [modalOpen, setModalOpen] = useState(false);

  const items = [
    {
      label: "Enter to send",
      key: "enterToSend",
      value: userPrefs.enterToSend,
      onToggle: () =>
        setUserPrefsAndSave({ enterToSend: !userPrefs.enterToSend }),
    },
    {
      label: "Large text",
      key: "largeText",
      value: userPrefs.largeText,
      onToggle: () => setUserPrefsAndSave({ largeText: !userPrefs.largeText }),
    },
    {
      label: "Wide view (PC only)",
      key: "wideView",
      value: userPrefs.wideView,
      onToggle: () => setUserPrefsAndSave({ wideView: !userPrefs.wideView }),
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
            style={{ color: `rgb(${userPrefs.themeColor})` }}
          />
        )}
      </DropdownMenuItem>
    ));

  if (isMobile) {
    return (
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <button className={buttonClassName} aria-label="Accessibility">
            <PersonStanding className="w-5 h-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Accessibility</h2>
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
                    style={{ color: `rgb(${userPrefs.themeColor})` }}
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
          <PersonStanding className="w-5 h-5" />
          {!hideLabels && <span>Accessibility</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {renderItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
