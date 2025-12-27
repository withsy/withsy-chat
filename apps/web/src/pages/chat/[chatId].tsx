import { ChatSession } from "@/components/chat/ChatSession";
import { ChatLayout } from "@/components/layout/ChatLayout";
import { PartialLoading } from "@/components/Loading";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const [chatId, SetChatId] = useState("");

  useEffect(() => {
    if (router.isReady) {
      const { query } = router;

      Promise.try(() => {
        if (typeof query.chatId === "string" && query.chatId) {
          SetChatId(query.chatId);
        }
      });
    }
  }, [router, router.isReady]);

  if (!chatId) {
    return <PartialLoading />;
  }

  return (
    <ChatLayout>
      <ChatSession chatId={chatId} />
    </ChatLayout>
  );
}
