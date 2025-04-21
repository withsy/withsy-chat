import { useSelectedModel } from "@/context/SelectedModelContext";
import { useSidebar } from "@/context/SidebarContext";
import { AtSign, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ModelSelectItem } from "./ModelSelectItem";

const models = [
  { label: "gemini-2.0-flash", value: "gemini-2.0-flash" },
  { label: "gemini-1.5-pro", value: "gemini-1.5-pro" },
  { label: "gpt-4o", value: "gpt-4o" },
];

export function ModelSelect() {
  const { isMobile } = useSidebar();
  const { selectedModel, setSelectedModel } = useSelectedModel();
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
        className="inline-flex items-center gap-1 rounded px-2 py-[2px] font-medium text-gray-500 hover:bg-gray-200 active:bg-gray-200 transition"
      >
        <AtSign size={12} />
        <span>
          {models.find((m) => m.value === selectedModel)?.label ||
            "Select model"}
        </span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {open && (
        <ul className="absolute z-10 bottom-full mb-1 w-max min-w-full rounded-lg border border-gray-200 bg-white shadow-md p-2">
          <div className="text-gray-400 px-2 py-1">Switch model</div>
          {models.map((model) => (
            <ModelSelectItem
              key={model.value}
              modelValue={model.value}
              selectedValue={selectedModel}
              label={model.label}
              isMobile={isMobile}
              onSelect={(val) => {
                setSelectedModel(val);
                setOpen(false);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
