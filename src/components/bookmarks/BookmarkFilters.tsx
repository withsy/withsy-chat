import { useState } from "react";
import { FilterSelect } from "@/components/FilterSelect";
import { Checkbox } from "@/components/ui/checkbox";

// --- Filter option data ---
const sortByOptions = [
  { label: "Conversation Time", value: "chattedAt" },
  { label: "Bookmarked On", value: "bookmarkedAt" },
];

const sortOrderOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

const typeOptions = [
  { label: "Chat", value: "chat" },
  { label: "Thread", value: "thread" },
];

const modelOptions = [
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-3.5", value: "gpt-3.5" },
];

// --- Helper to toggle checkbox selection ---
const toggleSelection = (
  value: string,
  selected: string[],
  setSelected: (v: string[]) => void
) => {
  if (selected.includes(value)) {
    setSelected(selected.filter((v) => v !== value));
  } else {
    setSelected([...selected, value]);
  }
};

// --- Main Filter UI ---
export function BookmarkFilters() {
  const [sortBy, setSortBy] = useState<"chattedAt" | "bookmarkedAt">(
    "bookmarkedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "chat",
    "thread",
  ]);
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "gpt-4",
    "gpt-3.5",
  ]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end border-b pb-4">
      {/* Sort section */}
      <div className="flex flex-wrap gap-4 items-center">
        <FilterSelect
          value={sortBy}
          onChange={setSortBy}
          options={sortByOptions}
          placeholder="Sort by"
          className="w-[180px]"
        />
        <FilterSelect
          value={sortOrder}
          onChange={setSortOrder}
          options={sortOrderOptions}
          placeholder="Order"
          className="w-[160px]"
        />
      </div>

      {/* Filter section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">Type</span>
          {typeOptions.map((type) => (
            <label key={type.value} className="flex items-center gap-1 text-sm">
              <Checkbox
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() =>
                  toggleSelection(type.value, selectedTypes, setSelectedTypes)
                }
              />
              {type.label}
            </label>
          ))}
        </div>

        {/* Model Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">Model</span>
          {modelOptions.map((model) => (
            <label
              key={model.value}
              className="flex items-center gap-1 text-sm"
            >
              <Checkbox
                checked={selectedModels.includes(model.value)}
                onCheckedChange={() =>
                  toggleSelection(
                    model.value,
                    selectedModels,
                    setSelectedModels
                  )
                }
              />
              {model.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
