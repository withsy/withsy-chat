import { useSelectedModel } from "@/context/SelectedModelContext";
import { useSidebar } from "@/context/SidebarContext";
import type { ChatModel } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { ModelDropdown } from "./ModelDropdown";
import { ModelSelectButton } from "./ModelSelectButton";

const models: { label: string; value: ChatModel }[] = [
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

  const selectedLabel =
    models.find((m) => m.value === selectedModel)?.label || "Select model";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <ModelSelectButton
        selectedLabel={selectedLabel}
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <ModelDropdown
          models={models}
          selectedValue={selectedModel}
          isMobile={isMobile}
          onSelect={(val) => {
            setSelectedModel(val);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
