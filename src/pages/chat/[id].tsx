import ChatView from "@/components/chat/ChatView";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;

  const chatId = typeof id === "string" ? id : null;
  if (!chatId) return <div>Invalid chatId</div>;

  return <ChatView chatId={chatId} />;
}
