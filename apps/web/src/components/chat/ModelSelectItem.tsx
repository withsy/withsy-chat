import { cn } from "@/lib/utils";
import { Model } from "@repo/common";

type ModelSelectItemProps = {
  modelValue: string;
  selectedValue: Model;
  label: string;
  description: string;
  isMobile: boolean;
  messageModel?: Model | null;
  onSelect: (model: Model) => void;
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
        onSelect(Model.parse(modelValue));
      }}
      className={cn(
        "cursor-pointer list-none select-none hover:bg-gray-100 active:bg-gray-100",
        (messageModel == modelValue ||
          (!messageModel && modelValue === selectedValue)) &&
          "bg-gray-200 font-medium",
        isMobile ? "px-2 py-3 text-lg" : "px-2 py-2",
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
