import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { usePreferences } from "@/context/PreferencesContext";

function Page() {
  const { usePreference } = usePreferences();
  const themeColor = usePreference("themeColor");
  const themeOpacity = usePreference("themeOpacity");

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return <BookmarkPage headerStyle={headerStyle} />;
}

(Page as any).layoutType = "chat";
export default Page;
