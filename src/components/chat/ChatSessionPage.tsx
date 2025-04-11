import { useSidebar } from "@/context/SidebarContext";
import { trpc } from "@/lib/trpc";
import type { ChatMessage } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatInputBox } from "./ChatInputBox";
import { ChatMessageList } from "./ChatMessageList";
type Props = {
  chatId?: string;
  initialAiChatMessageId: number;
  initialMessages: ChatMessage[];
  children?: React.ReactNode;
};

export function ChatSessionPage({
  chatId,
  initialMessages,
  initialAiChatMessageId,
  children,
}: Props) {
  const router = useRouter();
  const { addChat } = useSidebar();
  const [aiChatMessageId, setAiChatMessageId] = useState(
    initialAiChatMessageId
  );
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [chatId, initialMessages]);

  const utils = trpc.useUtils();
  const startChat = trpc.chat.start.useMutation();
  const sendChatMessage = trpc.chat.sendMessage.useMutation();
  const receiveChatMessage = trpc.chat.receiveMessageStream.useSubscription(
    chatId && aiChatMessageId !== 0
      ? {
          chatMessageId: aiChatMessageId,
        }
      : skipToken,
    {
      onError(error) {
        toast.error(`Receive chat message failed. error: ${error}`);
      },
      onData(data) {
        // TODO: refactor
        if (data.text) {
          setMessages((prev) => [
            ...prev,
            {
              id: Math.floor(Math.random() * 100000) + 1,
              chatId: chatId!,
              text: data.text,
              model: "gemini-2.0-flash",
              data: { role: "model" },
              isAi: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }
      },
    }
  );

  const onSendMessage = (message: string) => {
    if (chatId) {
      setAiChatMessageId(0);
      sendChatMessage.mutate(
        { chatId, text: message, model: "gemini-2.0-flash" },
        {
          onError(error) {
            toast.error(`Send message failed. error: ${error}`);
          },
          onSuccess(data) {
            setMessages((prev) => [...prev, data.userChatMessage]);
            setAiChatMessageId(data.aiChatMessageId);
          },
        }
      );
    } else {
      startChat.mutate(
        { text: message, model: "gemini-2.0-flash" },
        {
          onSuccess(data) {
            addChat(data.chat);
            utils.chat.list.invalidate();
            router.push(
              `/chat/${data.chat.id}?chatMessageId=${data.aiChatMessageId}`
            );
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto px-4 py-2 mb-[120px]">
        <div className="mx-auto w-full">
          <ChatMessageList messages={messages} />
          {children}
        </div>
      </div>

      <div className="absolute bottom-[2vh] left-0 right-0 flex justify-center px-4">
        <div className="w-full">
          <ChatInputBox onSendMessage={onSendMessage} />
        </div>
      </div>
    </div>
  );
}
