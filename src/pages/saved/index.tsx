import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { PartialLoading } from "@/components/Loading";
import { useUser } from "@/context/UserContext";

export default function BookmarkIndex() {
  const { user } = useUser();
  if (!user || user == null) {
    return <PartialLoading />;
  }
  return <BookmarkPage user={user} />;
}
