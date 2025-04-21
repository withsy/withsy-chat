import type { ChatModel } from "@/types/chat";
import { ModelSelectItem } from "./ModelSelectItem";

interface ModelDropdownProps {
  description?: string;
  models: { label: string; value: ChatModel; description: string }[];
  selectedValue: ChatModel;
  isMobile: boolean;
  onSelect: (value: ChatModel) => void;
}

export function ModelDropdown({
  description,
  models,
  selectedValue,
  isMobile,
  onSelect,
}: ModelDropdownProps) {
  return (
    <ul className="absolute z-10 bottom-full mb-1 w-max min-w-full rounded-lg border border-gray-200 bg-white shadow-md p-2">
      <div className="text-gray-400 px-2 py-1">
        {description ? description : "Switch model"}
      </div>
      {models.map((model) => (
        <ModelSelectItem
          key={model.value}
          modelValue={model.value}
          selectedValue={selectedValue}
          label={model.label}
          description={model.description}
          isMobile={isMobile}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
