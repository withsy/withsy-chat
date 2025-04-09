import { FilterSelect } from "@/components/FilterSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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

const defaultTypes = typeOptions.map((t) => t.value);
const defaultModels = modelOptions.map((m) => m.value);

type Props = {
  sortBy: string;
  setSortBy: (val: any) => void;
  sortOrder: string;
  setSortOrder: (val: any) => void;
  selectedTypes: string[];
  setSelectedTypes: (val: string[]) => void;
  selectedModels: string[];
  setSelectedModels: (val: string[]) => void;
};

export function BookmarkFilters({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedTypes,
  setSelectedTypes,
  selectedModels,
  setSelectedModels,
}: Props) {
  const reset = () => {
    setSortBy("bookmarkedAt");
    setSortOrder("desc");
    setSelectedTypes(defaultTypes);
    setSelectedModels(defaultModels);
  };

  const toggle = (
    val: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(val) ? list.filter((v) => v !== val) : [...list, val]
    );
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end border-b pb-4">
      {/* Sort */}
      <div className="flex gap-4 items-center">
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

      {/* Filter */}
      <div className="flex flex gap-3">
        {/* Type */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Type</span>
          {typeOptions.map((t) => (
            <label key={t.value} className="flex items-center gap-1 text-sm">
              <Checkbox
                checked={selectedTypes.includes(t.value)}
                onCheckedChange={() =>
                  toggle(t.value, selectedTypes, setSelectedTypes)
                }
              />
              {t.label}
            </label>
          ))}
        </div>

        {/* Model */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Model</span>
          {modelOptions.map((m) => (
            <label key={m.value} className="flex items-center gap-1 text-sm">
              <Checkbox
                checked={selectedModels.includes(m.value)}
                onCheckedChange={() =>
                  toggle(m.value, selectedModels, setSelectedModels)
                }
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="self-end">
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
