import { useSelectedModel } from "@/context/SelectedModelContext";
import { useSidebar } from "@/context/SidebarContext";
import type { ChatModel } from "@/types/chat";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ModelDropdown } from "./ModelDropdown";
import { ModelSelectButton } from "./ModelSelectButton";

const models: {
  label: string;
  value: ChatModel;
  description: string;
}[] = [
  {
    label: "gemini-2.0-flash",
    value: "gemini-2.0-flash",
    description: "Fast and lightweight",
  },
  {
    label: "gemini-1.5-pro",
    value: "gemini-1.5-pro",
    description: "Strong reasoning, broad context understanding",
  },
  {
    label: "gpt-4o",
    value: "gpt-4o",
    description: "High accuracy, multi-modal data processing",
  },
];

interface ModelSelectProps {
  description?: string;
  button?: ReactNode;
  messageModel?: ChatModel | null;
  onSelectModel?: (model: ChatModel) => void;
}

export function ModelSelect({
  description,
  button,
  messageModel,
  onSelectModel,
}: ModelSelectProps) {
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
      {button ? (
        <div onClick={() => setOpen((prev) => !prev)}>{button}</div>
      ) : (
        <ModelSelectButton
          selectedLabel={selectedLabel}
          onClick={() => setOpen((prev) => !prev)}
        />
      )}
      {open && (
        <ModelDropdown
          messageModel={messageModel}
          description={description}
          models={models}
          selectedValue={selectedModel}
          isMobile={isMobile}
          onSelect={(val) => {
            setSelectedModel(val);
            onSelectModel?.(val);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
