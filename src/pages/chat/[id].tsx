import ChatView from "@/components/chat/ChatView";
import { PartialError } from "@/components/Error";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;

  const chatId = typeof id === "string" ? id : null;
  if (!chatId) return <PartialError message="Invaild chat id" />;

  return <ChatView chatId={chatId} />;
}
