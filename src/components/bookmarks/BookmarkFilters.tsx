import { FilterSelect } from "@/components/FilterSelect";
import { Input } from "@/components/ui/input";
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
  return (
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
  );
}
