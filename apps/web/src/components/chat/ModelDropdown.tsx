import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { Model } from "@/types/model";
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
      <div className="text-gray-400 px-2 py-1">
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

  if (!isOpen) return null;

  return (
    <ul className="absolute z-10 bottom-full mb-1 w-max min-w-full rounded-lg border border-gray-200 bg-white shadow-md p-2">
      {content}
    </ul>
  );
}
