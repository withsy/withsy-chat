import { cn } from "@/lib/utils";
import type { ChatModel } from "@/types/chat";

type ModelSelectItemProps = {
  modelValue: string;
  selectedValue: ChatModel;
  label: string;
  isMobile: boolean;
  onSelect: (model: ChatModel) => void;
};

export function ModelSelectItem({
  modelValue,
  selectedValue,
  label,
  isMobile,
  onSelect,
}: ModelSelectItemProps) {
  return (
    <li
      key={modelValue}
      onClick={() => {
        onSelect(modelValue as ChatModel);
      }}
      className={cn(
        "cursor-pointer hover:bg-gray-100 active:bg-gray-100 select-none",
        modelValue === selectedValue && "bg-gray-200 font-medium",
        isMobile ? "text-lg px-2 py-3" : "px-2 py-2"
      )}
    >
      {label}
    </li>
  );
}
