import { FilterSelect } from "@/components/FilterSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const sortByOptions = [
  { label: "Conversation Time", value: "chattedAt" },
  { label: "Bookmarked On", value: "bookmarkedAt" },
];

const sortOrderOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

const modelOptions = [
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-3.5", value: "gpt-3.5" },
  { label: "Claude-3", value: "claude-3" },
];

const defaultModels = modelOptions.map((m) => m.value);

type Props = {
  sortBy: string;
  setSortBy: (val: any) => void;
  sortOrder: string;
  setSortOrder: (val: any) => void;
  selectedModels: string[];
  setSelectedModels: (val: string[]) => void;
  searchText: string;
  setSearchText: (val: string) => void;
};

export function BookmarkFilters({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedModels,
  setSelectedModels,
  searchText,
  setSearchText,
}: Props) {
  const reset = () => {
    setSortBy("bookmarkedAt");
    setSortOrder("desc");
    setSelectedModels(defaultModels);
    setSearchText("");
    toast.success("Filters reset");
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
    <div className="flex flex-col gap-4 border-b pb-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex gap-2">
          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            options={sortByOptions}
            placeholder="Sort by"
            className="w-full sm:w-[180px]"
          />
          <FilterSelect
            value={sortOrder}
            onChange={setSortOrder}
            options={sortOrderOptions}
            placeholder="Order"
            className="w-full sm:w-[160px]"
          />
        </div>

        <div className="flex-1 ">
          <Input
            type="text"
            placeholder="Search title or content..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full "
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
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

        <div>
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
