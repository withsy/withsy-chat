export function getFilteredBookmarks({
  messages,
  sortBy,
  sortOrder,
}: {
  messages: any[];
  sortBy: "chattedAt" | "bookmarkedAt";
  sortOrder: "asc" | "desc";
}) {
  return messages.sort((a, b) => {
    const aTime = new Date(a[sortBy]).getTime();
    const bTime = new Date(b[sortBy]).getTime();
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });
}
