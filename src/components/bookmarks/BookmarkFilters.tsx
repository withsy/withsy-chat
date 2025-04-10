import { FilterSelect } from "@/components/FilterSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(true);

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
    <div className="border-b pb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filters
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1"
          >
            {isOpen ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Filters
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Filters
              </>
            )}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-4">
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

            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Search title or content..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Model</span>
                {modelOptions.map((m) => (
                  <label
                    key={m.value}
                    className="flex items-center gap-1 text-sm"
                  >
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
          </div>
        </div>
      )}
    </div>
  );
}
