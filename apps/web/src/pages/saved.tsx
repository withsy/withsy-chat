import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { ChatLayout } from "@/components/layout/ChatLayout";
import { useUserPreference } from "@/hooks/useUserPreference";

export default function Page() {
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <ChatLayout>
      <BookmarkPage headerStyle={headerStyle} />{" "}
    </ChatLayout>
  );
}
