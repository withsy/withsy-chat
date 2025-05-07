import EmptyChatView from "@/components/chat/EmptyChatView";
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

export default function Page({ csrfToken }: Props) {
  useEffect(() => {
    if (csrfToken) setTrpcCsrfToken(csrfToken);
  }, [csrfToken]);

  return <EmptyChatView />;
}
