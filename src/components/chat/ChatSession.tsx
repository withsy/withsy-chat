import { useSidebar } from "@/context/SidebarContext";
import { trpc } from "@/lib/trpc";
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
  const { addChat } = useSidebar();
  const [messages, setMessages] = useState(initialMessages);
  const [streamMessageId, setStreamMessageId] = useState<number | null>();
  const utils = trpc.useUtils();
  const startChat = trpc.chat.start.useMutation();
  const sendChatMessage = trpc.chatMessage.send.useMutation();

  useEffect(() => {
    setMessages(initialMessages);
  }, [chatId, initialMessages]);

  useEffect(() => {
    const message =
      messages.find((x) => x.status === "processing") ??
      messages.find((x) => x.status === "pending");
    if (message) setStreamMessageId(message.id);
  }, [messages]);

  const _receiveChatChunk = trpc.chatChunk.receiveStream.useSubscription(
    streamMessageId != null ? { chatMessageId: streamMessageId } : skipToken,
    {
      onStarted() {
        console.log(
          `Start to receive chunk for chat message id: ${streamMessageId}.`
        );
      },
      onComplete() {
        setMessages((prev) =>
          prev.map((x) =>
            x.id === streamMessageId ? { ...x, status: "succeeded" } : x
          )
        );
        console.log(
          `Complete to receive chunk for chat message id: ${streamMessageId}.`
        );
      },
      onError(error) {
        setMessages((prev) =>
          prev.map((x) =>
            x.id === streamMessageId ? { ...x, status: "failed" } : x
          )
        );
        toast.error(`Receive chat message failed. error: ${error}`);
      },
      onData(data) {
        const chunk = data.data;
        const msg = messages.find((x) => x.id === chunk.chatMessageId);
        if (msg) {
          msg.text = msg.text ?? "";
          msg.text += chunk.text;
        }
        console.log(`TODO: chunk to message. chunk text: ${chunk.text}`);
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
              ChatMessage.parse(data.modelChatMessage),
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
    <div className="flex flex-col h-full relative items-center">
      <div className="flex-1 overflow-y-auto py-4 mb-[120px] w-full">
        <ChatMessageList messages={messages} />
        {children}
      </div>

      <div className="absolute bottom-[2vh] left-0 right-0 flex justify-center px-4">
        <ChatInputBox onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
