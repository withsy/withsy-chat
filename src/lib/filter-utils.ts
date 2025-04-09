export function getFilteredBookmarks({
  bookmarks,
  selectedTypes,
  selectedModels,
  sortBy,
  sortOrder,
}: {
  bookmarks: any[];
  selectedTypes: string[];
  selectedModels: string[];
  sortBy: "chattedAt" | "bookmarkedAt";
  sortOrder: "asc" | "desc";
}) {
  return bookmarks
    .filter((b) => selectedTypes.includes(b.type))
    .filter((b) => selectedModels.includes(b.model))
    .sort((a, b) => {
      const aTime = new Date(a[sortBy]).getTime();
      const bTime = new Date(b[sortBy]).getTime();
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });
}
