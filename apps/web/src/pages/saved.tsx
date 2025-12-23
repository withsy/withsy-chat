import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { DynamicChatLayout } from "@/components/layout/DynamicChatLayout";
import { useUserPreference } from "@/hooks/useUserPreference";

export default function Page() {
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <DynamicChatLayout>
      <BookmarkPage headerStyle={headerStyle} />{" "}
    </DynamicChatLayout>
  );
}
