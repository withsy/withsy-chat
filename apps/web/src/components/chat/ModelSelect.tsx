import { useUserContext } from "@/features/user/contexts/UserContext";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { Model } from "@repo/common";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ModelDropdown } from "./ModelDropdown";
import { ModelSelectButton } from "./ModelSelectButton";

const defaultModelMap = {
  "gemini-2.5-flash": {
    label: "Gemini 2.5 Flash",
    description: "Fast and lightweight",
  },
  "grok-3": {
    label: "Grok 3",
    description: "Latest version with advanced reasoning capabilities",
  },
  "grok-3-mini": {
    label: "Grok 3 Mini",
    description: "Optimized for efficiency while maintaining quality",
  },
  "grok-3-mini-fast": {
    label: "Grok 3 Mini Fast",
    description: "Fastest response times with balanced performance",
  },
} satisfies Record<Model, { label: string; description: string }>;

export function GetModelLabel(model: Model) {
  return defaultModelMap[model].label;
}

export type ModelInfo = {
  label: string;
  value: Model;
  description: string;
};

interface ModelSelectProps {
  description?: string;
  button?: ReactNode;
  messageModel?: Model | null;
  onSelectModel?: (model: Model) => void;
}

export function ModelSelect({
  description,
  button,
  messageModel,
  onSelectModel,
}: ModelSelectProps) {
  const { isMobile } = useSidebarStore();
  const { userSessionStorage, dispatchUserSessionStorage } = useUserContext();
  const { selectedModel = "gemini-2.5-flash" } = userSessionStorage;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models: ModelInfo[] = useMemo(() => {
    return Object.entries(defaultModelMap).map(([key, value]) => {
      const model = key as Model;

      return {
        label: value.label,
        value: model,
        description: value.description,
      };
    });
  }, []);

  const selectedLabel =
    models.find((m) => m.value === selectedModel)?.label || "Select model";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (!isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobile]);

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
      <ModelDropdown
        messageModel={messageModel}
        description={description}
        models={models}
        selectedValue={selectedModel}
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={(value) => {
          dispatchUserSessionStorage({
            kind: "setSelectedModel",
            selectedModel: value,
          });
          onSelectModel?.(value);
          setOpen(false);
        }}
      />
    </div>
  );
}
