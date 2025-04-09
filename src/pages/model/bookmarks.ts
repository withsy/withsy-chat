export interface BookmarkCardProps {
  type: string;
  //   type: "chat" | "thread";
  model: string;
  title: string;
  chattedAt: string;
  bookmarkedAt: string;
  content: string;
  note: string;
}
