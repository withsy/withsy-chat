import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { Model } from "@repo/common";
import type { ModelInfo } from "./ModelSelect";
import { ModelSelectItem } from "./ModelSelectItem";

interface ModelDropdownProps {
  description?: string;
  models: ModelInfo[];
  selectedValue: Model;
  messageModel?: Model | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: Model) => void;
}

export function ModelDropdown({
  description,
  models,
  selectedValue,
  messageModel,
  onSelect,
  isOpen,
  onClose,
}: ModelDropdownProps) {
  const { isMobile } = useSidebarStore();

  const content = (
    <>
      <div className="px-2 py-1 text-gray-400">
        {description ?? "Switch model"}
      </div>
      {models.map((model) => (
        <ModelSelectItem
          key={model.value}
          modelValue={model.value}
          selectedValue={selectedValue}
          label={model.label}
          messageModel={messageModel}
          description={model.description}
          isMobile={isMobile}
          onSelect={(value) => {
            onSelect(value);
            onClose();
          }}
        />
      ))}
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <div className="p-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!isOpen) {
    return null;
  }

  return (
    <ul className="absolute bottom-full z-10 mb-1 w-max min-w-full rounded-lg border border-gray-200 bg-white p-2 shadow-md">
      {content}
    </ul>
  );
}
