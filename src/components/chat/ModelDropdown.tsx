import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useSidebar } from "@/context/SidebarContext";
import type { ChatModel } from "@/types/chat";
import { ModelSelectItem } from "./ModelSelectItem";

interface ModelDropdownProps {
  description?: string;
  models: { label: string; value: ChatModel; description: string }[];
  selectedValue: ChatModel;
  messageModel?: ChatModel | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: ChatModel) => void;
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
  const { isMobile } = useSidebar();

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
