import ChatView from "@/components/chat/ChatView";
import { PartialError } from "@/components/Error";
import { setTrpcCsrfToken } from "@/lib/trpc";
import { getCsrfToken } from "@/server/utils";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const { id } = router.query;
  const chatId = typeof id === "string" ? id : null;

  useEffect(() => {
    if (csrfToken) setTrpcCsrfToken(csrfToken);
  }, [csrfToken]);

  if (!chatId) return <PartialError message="Invalid chat id" />;

  return <ChatView chatId={chatId} />;
}
