import ChatView from "@/components/chat/ChatView";
import { PartialError } from "@/components/Error";
import { DynamicChatLayout } from "@/components/layout/DynamicChatLayout";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;
  const chatId = typeof id === "string" ? id : null;

  if (!chatId) return <PartialError message="Invalid chat id" />;

  return (
    <DynamicChatLayout>
      <ChatView chatId={chatId} />{" "}
    </DynamicChatLayout>
  );
}
