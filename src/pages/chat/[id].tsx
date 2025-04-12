import ChatView from "@/components/chat/ChatView";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id, chatMessageId } = router.query;

  const chatId = typeof id === "string" ? id : null;
  const messageId =
    typeof chatMessageId === "string" ? Number(chatMessageId) : 0;

  if (!chatId) return <div>Invalid chatId</div>;

  return <ChatView chatId={chatId} chatMessageId={messageId} />;
}
