import { cn } from "@/lib/utils";
import type { ChatModel } from "@/types/chat";

type ModelSelectItemProps = {
  modelValue: string;
  selectedValue: ChatModel;
  label: string;
  description: string;
  isMobile: boolean;
  messageModel?: ChatModel | null;
  onSelect: (model: ChatModel) => void;
};

export function ModelSelectItem({
  modelValue,
  selectedValue,
  label,
  description,
  isMobile,
  messageModel,
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
        (messageModel == modelValue ||
          (!messageModel && modelValue === selectedValue)) &&
          "bg-gray-200 font-medium",
        isMobile ? "text-lg px-2 py-3" : "px-2 py-2"
      )}
    >
      <div className="font-medium">
        {label}
        {messageModel && messageModel == modelValue ? " (in use)" : ""}
      </div>
      <div className="text-sm text-gray-500">{description}</div>
    </li>
  );
}
