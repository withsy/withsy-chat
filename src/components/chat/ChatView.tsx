import { ChatSession } from "@/components/chat/ChatSession";
import { trpc } from "@/lib/trpc";
import { PartialError } from "../Error";
import { PartialLoading } from "../Loading";

type Props = {
  chatId: string;
};

export default function ChatView({ chatId }: Props) {
  const getChat = trpc.chat.get.useQuery({
    chatId,
    options: {
      include: {
        parentMessage: true,
      },
    },
  });
  const listChatMessages = trpc.chatMessage.list.useQuery({
    options: { scope: { by: "chat", chatId } },
  });

  if (getChat.isLoading) return <PartialLoading />;
  if (getChat.isError || !getChat.data)
    return <PartialError message="Loading Chat" />;

  if (listChatMessages.isLoading) return <PartialLoading />;
  if (listChatMessages.isError || !listChatMessages.data)
    return <PartialError message="Loading Messages" />;

  return (
    <ChatSession chat={getChat.data} initialMessages={listChatMessages.data} />
  );
}
