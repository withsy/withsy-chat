import { cn } from "@/lib/utils";
import type { ChatModel } from "@/types/chat";
import { useState } from "react";

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
  const [isTouchHover, setIsTouchHover] = useState(false);

  return (
    <li
      key={modelValue}
      onClick={() => {
        onSelect(modelValue as ChatModel);
      }}
      className={cn(
        "cursor-pointer hover:bg-gray-50 select-none",
        modelValue === selectedValue && "bg-gray-100 font-semibold",
        isMobile ? "text-lg px-2 py-3" : "px-2 py-2",
        isTouchHover && "bg-gray-50"
      )}
      onTouchStart={() => setIsTouchHover(true)}
      onTouchEnd={() => setIsTouchHover(false)}
    >
      {label}
    </li>
  );
}
