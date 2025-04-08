export function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const targetDate = new Date(dateStr);
  const diff = Math.floor(
    (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";

  return dateStr.replace(/-/g, ".");
}
