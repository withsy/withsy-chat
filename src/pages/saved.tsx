import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { PartialLoading } from "@/components/Loading";
import { useUser } from "@/context/UserContext";
import { setTrpcCsrfToken } from "@/lib/trpc";
import { getCsrfToken, getUser } from "@/server/utils";
import type { UserData } from "@/types/user";
import type { GetServerSideProps } from "next";
import { useEffect } from "react";

type Props = {
  csrfToken: string;
  user: UserData | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const csrfToken = getCsrfToken(res);
  const user = await getUser({ req, res });
  return { props: { csrfToken, user } };
};

function SavedPage({ csrfToken, user }: Props) {
  const { setUser } = useUser();

  useEffect(() => {
    if (csrfToken) setTrpcCsrfToken(csrfToken);
  }, [csrfToken]);

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  if (!user) {
    return <PartialLoading />;
  }

  const { themeColor, themeOpacity } = user.preferences;
  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return <BookmarkPage user={user} headerStyle={headerStyle} />;
}

(SavedPage as any).layoutType = "chat";
export default SavedPage;
