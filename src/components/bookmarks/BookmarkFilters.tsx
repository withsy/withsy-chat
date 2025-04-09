import { useState } from "react";
import { FilterSelect } from "@/components/FilterSelect";
import { filterOptions } from "@/config/bookmark-filters";

export function BookmarkFilters() {
  const [sort, setSort] = useState("latest");
  const [type, setType] = useState("all");
  const [model, setModel] = useState("all");

  return (
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div className="flex flex-wrap gap-3 items-center">
        <FilterSelect
          value={sort}
          onChange={setSort}
          options={filterOptions.sort.options}
          placeholder={filterOptions.sort.label}
          className="w-[160px]"
        />
        <FilterSelect
          value={type}
          onChange={setType}
          options={filterOptions.type.options}
          placeholder={filterOptions.type.label}
          className="w-[180px]"
        />
        <FilterSelect
          value={model}
          onChange={setModel}
          options={filterOptions.model.options}
          placeholder={filterOptions.model.label}
          className="w-[160px]"
        />
      </div>

      <div className="text-sm whitespace-nowrap">
        {filterOptions.sort.label}:{" "}
        <span className="capitalize font-bold">{sort}</span> ·{" "}
        {filterOptions.type.label}:{" "}
        <span className="font-bold">
          {filterOptions.type.options.find((o) => o.value === type)?.label}
        </span>{" "}
        · {filterOptions.model.label}:{" "}
        <span className="font-bold">
          {filterOptions.model.options.find((o) => o.value === model)?.label}
        </span>
      </div>
    </div>
  );
}
