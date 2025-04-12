import { useSidebar } from "@/context/SidebarContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatInputBox } from "./ChatInputBox";
import { ChatMessageList } from "./ChatMessageList";

type Props = {
  chatId: string | null;
  initialMessages: ChatMessage[];
  children?: React.ReactNode;
};

export function ChatSession({ chatId, initialMessages, children }: Props) {
  const router = useRouter();
  const { addChat, userPrefs, isMobile } = useSidebar();
  const [messages, setMessages] = useState(initialMessages);
  const wideView = userPrefs["wideView"];

  useEffect(() => {
    setMessages(initialMessages);
  }, [chatId, initialMessages]);

  const utils = trpc.useUtils();
  const startChat = trpc.chat.start.useMutation();
  const sendChatMessage = trpc.chatMessage.send.useMutation();

  const message =
    messages.find((x) => x.status === "processing") ??
    messages.find((x) => x.status === "pending");

  const _receiveChatChunk = trpc.chatChunk.receiveStream.useSubscription(
    message ? { chatMessageId: message.id } : skipToken,
    {
      onError(error) {
        toast.error(`Receive chat message failed. error: ${error}`);
      },
      onData(data) {
        const text = data.data.text;
        if (text.length !== 0) {
          // TODO: create chunk variables.
          setMessages((prev) => [
            ...prev,
            {
              id: Math.floor(Math.random() * 100000) + 1,
              chatId: chatId!,
              text,
              model: "gemini-2.0-flash",
              role: "model",
              status: "succeeded",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }
      },
    }
  );

  const onSendMessage = (message: string) => {
    if (chatId != null) {
      sendChatMessage.mutate(
        { chatId, text: message, model: "gemini-2.0-flash" },
        {
          onError(error) {
            toast.error(`Send message failed. error: ${error}`);
          },
          onSuccess(data) {
            setMessages((prev) => [
              ...prev,
              ChatMessage.parse(data.userChatMessage),
            ]);
            utils.chat.list.invalidate();
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
            router.push(`/chat/${data.chat.id}`);
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto py-4 mb-[120px]">
        <div
          className={cn(
            "mx-auto w-full",
            !isMobile && (wideView ? "max-w-[90%]" : "max-w-[80%]"),
            isMobile && "max-w-[90%]"
          )}
        >
          <ChatMessageList messages={messages} />
          {children}
        </div>
      </div>

      <div className="absolute bottom-[2vh] left-0 right-0 flex justify-center px-4">
        <div
          className={cn(
            "w-full",
            !isMobile && (wideView ? "max-w-[90%]" : "max-w-[80%]")
          )}
        >
          <ChatInputBox onSendMessage={onSendMessage} />
        </div>
      </div>
    </div>
  );
}
