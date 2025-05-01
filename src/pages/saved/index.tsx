import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { PartialLoading } from "@/components/Loading";
import { useUser } from "@/context/UserContext";

export default function BookmarkIndex() {
  const { user } = useUser();
  if (!user || user == null) {
    return <PartialLoading />;
  }

  const { themeColor, themeOpacity } = user.preferences;
  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return <BookmarkPage user={user} headerStyle={headerStyle} />;
}
