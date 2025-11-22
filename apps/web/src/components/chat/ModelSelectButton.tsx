import { AtSign, ChevronDown } from "lucide-react";

interface ModelSelectButtonProps {
  selectedLabel: string;
  onClick: () => void;
}

export function ModelSelectButton({
  selectedLabel,
  onClick,
}: ModelSelectButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded px-2 py-[2px] font-medium text-gray-500 hover:bg-gray-200 active:bg-gray-200 transition"
    >
      <AtSign size={12} />
      <span>{selectedLabel || "Select model"}</span>
      <ChevronDown size={12} className="text-gray-400" />
    </button>
  );
}
