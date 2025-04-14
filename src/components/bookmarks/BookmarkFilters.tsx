import { FilterSelect } from "@/components/FilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const sortByOptions = [
  { label: "Conversation Time", value: "chattedAt" },
  { label: "Saved On", value: "bookmarkedAt" },
];

const sortOrderOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

type Props = {
  sortBy: string;
  setSortBy: (val: any) => void;
  sortOrder: string;
  setSortOrder: (val: any) => void;
  searchText: string;
  setSearchText: (val: string) => void;
};

export function BookmarkFilters({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  searchText,
  setSearchText,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const reset = () => {
    setSortBy("bookmarkedAt");
    setSortOrder("desc");
    setSearchText("");
    toast.success("Filters reset");
  };

  return (
    <div className="pb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
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
                <ChevronUp className="w-4 h-4 text-gray-500" />
                Hide Filters
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-gray-500" />
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
        </div>
      )}
    </div>
  );
}
