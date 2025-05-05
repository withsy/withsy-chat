import BookmarkPage from "@/components/bookmarks/BookmarkPage";
import { PartialLoading } from "@/components/Loading";
import { useUser } from "@/context/UserContext";
import { setTrpcCsrfToken } from "@/lib/trpc";
import { getCsrfToken } from "@/server/utils";
import type { GetServerSideProps } from "next";
import { useEffect } from "react";

type Props = {
  csrfToken: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  res,
}) => {
  const csrfToken = getCsrfToken(res);
  return { props: { csrfToken } };
};

export default function BookmarkIndex({ csrfToken }: Props) {
  const { user } = useUser();

  useEffect(() => {
    if (csrfToken) setTrpcCsrfToken(csrfToken);
  }, [csrfToken]);

  if (!user || user == null) {
    return <PartialLoading />;
  }

  const { themeColor, themeOpacity } = user.preferences;
  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return <BookmarkPage user={user} headerStyle={headerStyle} />;
}
