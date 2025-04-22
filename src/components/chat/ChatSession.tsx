import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSelectedModelStore } from "@/stores/useSelectedModelStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { ChatMessage } from "@/types/chat";
import { Chat } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { ChatDrawer } from "./ChatDrawer";
import ChatHeader from "./ChatHeader";
import { ChatInputBox } from "./ChatInputBox";
import { ChatMessageList } from "./ChatMessageList";

type Props = {
  chat: Chat | null;
  initialMessages: ChatMessage[];
  children?: React.ReactNode;
};

export function ChatSession({ chat, initialMessages, children }: Props) {
  const router = useRouter();
  const { messageId } = router.query;

  const { isMobile } = useSidebarStore();
  const { selectedModel } = useSelectedModelStore();
  const { userPrefs } = useUser();
  const [messages, setMessages] = useState(initialMessages);
  const [streamMessageId, setStreamMessageId] = useState<number | null>(null);
  const stableChat = useMemo(() => chat, [chat]);

  const { openDrawer } = useDrawerStore();

  const utils = trpc.useUtils();

  const shouldAutoScrollRef = useRef(true);

  const chatStart = trpc.chat.start.useMutation();
  const messageSend = trpc.message.send.useMutation();

  useEffect(() => {
    setMessages(initialMessages);
  }, [chat, initialMessages]);

  useEffect(() => {
    shouldAutoScrollRef.current = true;
  }, [chat?.id]);

  useEffect(() => {
    if (messageId && messageId !== "last") {
      const id = parseInt(messageId as string, 10);
      setStreamMessageId(id);
    }
  }, [messageId]);

  const _messageChunkReceive = trpc.messageChunk.receive.useSubscription(
    streamMessageId != null ? { messageId: streamMessageId } : skipToken,
    {
      onComplete() {
        setMessages((prev) =>
          prev.map((x) =>
            x.id === streamMessageId ? { ...x, status: "succeeded" } : x
          )
        );
        setStreamMessageId(null);
      },
      onError(error) {
        setMessages((prev) =>
          prev.map((x) =>
            x.id === streamMessageId ? { ...x, status: "failed" } : x
          )
        );
        setStreamMessageId(null);
        toast.error(`Receive chat message failed. error: ${error}`);
      },
      onData(data) {
        const chunk = data.data;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === streamMessageId
              ? {
                  ...msg,
                  text: (msg.text ?? "") + chunk.text,
                  status: "processing",
                }
              : msg
          )
        );
      },
    }
  );

  const onSendMessage = (message: string) => {
    if (chat != null) {
      shouldAutoScrollRef.current = true;
      messageSend.mutate(
        {
          chatId: chat.id,
          text: message,
          model: selectedModel,
          idempotencyKey: uuid(),
        },
        {
          onError(error) {
            toast.error(`Send message failed. error: ${error}`);
          },
          onSuccess(data) {
            setMessages((prev) => [
              ...prev,
              data.userMessage,
              data.modelMessage,
            ]);
            setStreamMessageId(data.modelMessage.id);
            utils.chat.list.invalidate();
          },
        }
      );
    } else {
      shouldAutoScrollRef.current = true;
      chatStart.mutate(
        { text: message, model: selectedModel, idempotencyKey: uuid() },
        {
          onSuccess(data) {
            utils.chat.list.invalidate();
            router.push(
              `/chat/${data.chat.id}?messageId=${data.modelMessage.id}`
            );
          },
        }
      );
    }
  };

  const messageUpdate = trpc.message.update.useMutation();

  const handleToggleSaved = (id: number, newValue: boolean) => {
    shouldAutoScrollRef.current = false;

    messageUpdate.mutate(
      { messageId: id, isBookmarked: newValue },
      {
        onSuccess: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === id ? { ...msg, isBookmarked: newValue } : msg
            )
          );

          if (newValue) {
            toast.success("Saved for later", {
              description: "You can find it in your saved list.",
            });
          } else {
            toast.success("Removed from saved", {
              description: "It's no longer in your saved list.",
            });
          }
        },
        onError: () => {
          toast.error("Failed", {
            description: "Please try again or contact support.",
          });
        },
      }
    );
  };

  const savedMessages = useMemo(
    () => messages.filter((msg) => msg.isBookmarked),
    [messages]
  );

  return (
    <div className="flex h-full relative">
      <div
        className={cn(
          "flex flex-col h-full relative items-center transition-all duration-300",
          isMobile ? "w-full" : openDrawer ? "w-[70%]" : "w-full"
        )}
      >
        {chat && <ChatHeader chat={chat} />}
        <div
          className={cn(
            "flex-1 overflow-y-auto mt-[50px] mb-[150px] w-full transition-all duration-300",
            userPrefs.wideView
              ? "md:w-[95%] md:mx-auto"
              : "md:w-[80%] md:mx-auto"
          )}
        >
          {(chat || messages.length > 0) && (
            <ChatMessageList
              chat={stableChat}
              messages={messages}
              onToggleSaved={handleToggleSaved}
              shouldAutoScrollRef={shouldAutoScrollRef}
            />
          )}
          {children}
        </div>
        <div className="absolute bottom-[2vh] left-0 right-0 flex flex-col items-center justify-center px-4">
          <ChatInputBox onSendMessage={onSendMessage} />
          <div className="text-xs text-gray-500 mt-1">
            AI can make mistakes — please double-check
          </div>
        </div>
      </div>
      <ChatDrawer chat={chat} savedMessages={savedMessages} />
    </div>
  );
}
