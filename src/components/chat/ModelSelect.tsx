import { cn } from "@/lib/utils";
import type { ChatModel } from "@/types/chat";
import { AtSign, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: ChatModel;
  onChange: (model: ChatModel) => void;
};

const models = [
  { label: "gemini-2.0-flash", value: "gemini-2.0-flash" },
  { label: "gemini-1.5-pro", value: "gemini-1.5-pro" },
  { label: "gpt-4o", value: "gpt-4o" },
];

export function ModelSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded px-2 py-[2px] text-xs font-semibold text-gray-500 hover:bg-gray-200 transition"
      >
        <AtSign size={12} />
        <span>
          {models.find((m) => m.value === value)?.label || "Select model"}
        </span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {open && (
        <ul className="absolute z-10 bottom-full mb-1 w-max min-w-full rounded border border-gray-200 bg-white shadow-md p-1">
          {models.map((model) => (
            <li
              key={model.value}
              onClick={() => {
                onChange(model.value as ChatModel);
                setOpen(false);
              }}
              className={cn(
                "cursor-pointer px-3 py-2 hover:bg-gray-100",
                model.value === value && "bg-gray-100 font-semibold"
              )}
            >
              {model.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
