import { ChatSessionProvider } from "@/context/ChatSessionContext";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSelectedModelStore } from "@/stores/useSelectedModelStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Chat, ChatStartError } from "@/types/chat";
import { MessageId, MessageSendError, type Message } from "@/types/message";
import type { UserUsageLimit } from "@/types/user-usage-limit";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { ChatDrawer } from "./ChatDrawer";
import ChatHeader from "./ChatHeader";
import { ChatInputBox } from "./ChatInputBox";
import { ChatMessageList } from "./ChatMessageList";

type Props = {
  chat: Chat | null;
  initialMessages: Message[];
  children?: React.ReactNode;
};

export function ChatSession({ chat, initialMessages, children }: Props) {
  const router = useRouter();

  const { isMobile } = useSidebarStore();
  const { selectedModel } = useSelectedModelStore();
  const { userPrefs } = useUser();
  const [messages, setMessages] = useState(initialMessages);
  const [streamMessageId, setStreamMessageId] = useState<string | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [usageLimit, setUsageLimit] = useState<UserUsageLimit | null>(null);
  const stableChat = useMemo(() => chat, [chat]);

  const { openDrawer } = useDrawerStore();

  const utils = trpc.useUtils();
  const usageQuery = trpc.userUsageLimit.get.useQuery(undefined, {
    enabled: !!chat?.id,
  });

  const chatStart = trpc.chat.start.useMutation({
    onError(error) {
      const res = ChatStartError.safeParse(error.data);
      toast.error(`Chat starting failed.`);
    },
    onSuccess(data) {
      utils.chat.list.invalidate();
      router.push(
        `/chat/${data.chat.id}?streamMessageId=${data.modelMessage.id}`
      );
    },
  });

  const messageSend = trpc.message.send.useMutation({
    onError(error) {
      const res = MessageSendError.safeParse(error.data);
      toast.error(`Message sending failed.`);
    },
    onSuccess(data) {
      setMessages((prev) => [...prev, data.userMessage, data.modelMessage]);
      setStreamMessageId(data.modelMessage.id);
      utils.chat.list.invalidate();
    },
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [chat, initialMessages]);

  useEffect(() => {
    setShouldFocusInput(true);
    const timer = setTimeout(() => setShouldFocusInput(false), 500);
    return () => clearTimeout(timer);
  }, [chat?.id]);

  useEffect(() => {
    const { streamMessageId } = router.query;
    if (streamMessageId) {
      setStreamMessageId(MessageId.parse(streamMessageId));
    }
  }, [router.query, router.query.streamMessageId]);

  useEffect(() => {
    if (usageQuery.isSuccess && usageQuery.data) {
      setUsageLimit(usageQuery.data);
    }
  }, [chat?.id, usageQuery.isSuccess, usageQuery.data]);

  const _messageChunkReceive = trpc.messageChunk.receive.useSubscription(
    streamMessageId != null ? { messageId: streamMessageId } : skipToken,
    {
      onStarted() {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === streamMessageId
              ? {
                  ...msg,
                  text: "",
                  status: "processing",
                }
              : msg
          )
        );
      },
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
        if (data.data.type === "chunk") {
          const chunk = data.data.chunk;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === streamMessageId
                ? {
                    ...msg,
                    text: msg.text + chunk.text,
                  }
                : msg
            )
          );
        } else if (data.data.type === "usageLimit") {
          const usageLimit = data.data.usageLimit;
          if (usageLimit) {
            setUsageLimit(usageLimit);
          }
        }
      },
    }
  );

  const onSendMessage = (message: string) => {
    if (chat != null) {
      messageSend.mutate({
        chatId: chat.id,
        text: message,
        model: selectedModel,
        idempotencyKey: uuid(),
      });
    } else {
      chatStart.mutate({
        text: message,
        model: selectedModel,
        idempotencyKey: uuid(),
      });
    }
  };

  const messageUpdate = trpc.message.update.useMutation();

  const handleToggleSaved = (id: string, newValue: boolean) => {
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

  const handleRegenerateSuccess = (newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage]);
    setStreamMessageId(newMessage.id);
    utils.chat.list.invalidate();
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
            <ChatSessionProvider onRegenerateSuccess={handleRegenerateSuccess}>
              <ChatMessageList
                chat={stableChat}
                messages={messages}
                onToggleSaved={handleToggleSaved}
              />
            </ChatSessionProvider>
          )}
          {children}
        </div>
        <div className="absolute bottom-[2vh] left-0 right-0 flex flex-col items-center justify-center px-4">
          <ChatInputBox
            onSendMessage={onSendMessage}
            shouldFocus={shouldFocusInput}
            usageLimit={usageLimit}
          />
          <div className="text-xs text-gray-500 mt-1">
            AI can make mistakes — please double-check.
          </div>
        </div>
      </div>
      <ChatDrawer chat={chat} savedMessages={savedMessages} />
    </div>
  );
}
