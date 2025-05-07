import EmptyChatView from "@/components/chat/EmptyChatView";
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

export default function Page({ csrfToken, user }: Props) {
  const { setUser } = useUser();

  useEffect(() => {
    if (csrfToken) setTrpcCsrfToken(csrfToken);
  }, [csrfToken]);

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  return <EmptyChatView />;
}
