import { trpc } from "@/lib/trpc";
import type { ChatMessage } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import { ChatInputBox } from "./ChatInputBox";
import { ChatMessageList } from "./ChatMessageList";

type Props = {
  chatId?: string;
  initialMessages: ChatMessage[];
  children?: React.ReactNode;
};

export function ChatSessionPage({ chatId, initialMessages, children }: Props) {
  const [chatMessageId, setChatMessageId] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const router = useRouter();
  const startChat = trpc.chat.start.useMutation();
  const sendChatMessage = trpc.chatMessage.send.useMutation();
  const receiveChatMessage = trpc.chatMessage.receive.useSubscription(
    !!chatMessageId
      ? {
          chatMessageId,
        }
      : skipToken,
    {
      onError(error) {
        toast.error(`Receive chat message failed. error: ${error}`);
      },
      onData(data) {
        console.log(data);
      },
    }
  );

  const onSendMessage = (message: string) => {
    if (chatId) {
      setChatMessageId("");
      sendChatMessage.mutate(
        { chatId, message, model: "" },
        {
          onError(error) {
            toast.error(`Send message failed. error: ${error}`);
          },
          onSuccess(data) {
            setChatMessageId(data.id);
          },
        }
      );
    } else {
      startChat.mutate(
        { message, model: "" },
        {
          onError(error) {
            toast.error(`Start chat failed. error: ${error}`);
          },
          onSuccess(data) {
            router.push(`/chat/${data.chat.id}`);
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto px-4 py-2 mb-[120px]">
        <div className="mx-auto w-full max-w-3xl">
          <ChatMessageList messages={messages} />
          {children}
        </div>
      </div>

      <div className="absolute bottom-[2vh] left-0 right-0 flex justify-center px-4">
        <div className="w-full max-w-3xl">
          <ChatInputBox onSendMessage={onSendMessage} />
        </div>
      </div>
    </div>
  );
}
