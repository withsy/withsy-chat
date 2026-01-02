import { ChatSession } from "@/components/chat/ChatSession";
import ChatLayout from "@/components/layout/ChatLayout";
import { PartialLoading } from "@/components/Loading";
import { useRouter } from "next/router";

export default function Page() {
  const { isReady, query } = useRouter();

  if (!isReady) {
    return <PartialLoading />;
  }

  let chatId = "";
  if (typeof query.chatId === "string" && query.chatId) {
    chatId = query.chatId;
  }

  if (!chatId) {
    throw new Error("Invalid query parameter.");
  }

  return (
    <ChatLayout>
      <ChatSession chatId={chatId} />
    </ChatLayout>
  );
}
