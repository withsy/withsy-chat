import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { useUserPreferences } from "@/context/UserPreferencesContext";

function Page() {
  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return <BookmarkPage headerStyle={headerStyle} />;
}

(Page as any).layoutType = "chat";
export default Page;
