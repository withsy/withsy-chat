import { FilterSelect } from "@/components/FilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const sortOrderOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

type Props = {
  sortOrder: string;
  setSortOrder: (val: any) => void;
  searchText: string;
  setSearchText: (val: string) => void;
};

export function BookmarkFilters({
  sortOrder,
  setSortOrder,
  searchText,
  setSearchText,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const reset = () => {
    setSortOrder("desc");
    setSearchText("");
    toast.success("Filters reset");
  };

  return (
    <div className="mt-[40px]">
      <div className="flex justify-end items-center mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="flex items-center gap-1 text-sm"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            Reset Filters
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1 text-sm"
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
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex gap-2">
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
