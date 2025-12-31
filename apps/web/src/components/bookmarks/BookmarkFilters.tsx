import { FilterSelect } from "@/components/FilterSelect";
import { Input } from "@/components/ui/input";

const orderOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

export function BookmarkFilters({
  order,
  setOrder,
  searchText,
  setSearchText,
}: {
  order: string;
  setOrder: (x: string) => void;
  searchText: string;
  setSearchText: (x: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex gap-2">
          <FilterSelect
            value={order}
            onChange={setOrder}
            options={orderOptions}
            placeholder="Order"
            className="w-full sm:w-[160px]"
          />
        </div>

        <div className="min-w-[200px] flex-1">
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
