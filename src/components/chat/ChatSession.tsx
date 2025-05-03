import { ChatSessionProvider } from "@/context/ChatSessionContext";
import { useUser } from "@/context/UserContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSelectedModelStore } from "@/stores/useSelectedModelStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Chat, Message } from "@/types";
import { MessageId } from "@/types/id";
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
import MobileChatHeader from "./MobileChatHeader";

type Props = {
  initialMessages: Message.Data[];
  children?: React.ReactNode;
};

export function ChatSession({ initialMessages, children }: Props) {
  const { chat } = useChatStore();
  const router = useRouter();

  const { collapsed, isMobile } = useSidebarStore();
  const { selectedModel } = useSelectedModelStore();
  const { user } = useUser();
  const [messages, setMessages] = useState(initialMessages);
  const [streamMessageId, setStreamMessageId] = useState<string | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [usageLimit, setUsageLimit] = useState<UserUsageLimit | null>(null);

  const { openDrawer } = useDrawerStore();

  const utils = trpc.useUtils();
  const usageQuery = trpc.userUsageLimit.get.useQuery(undefined, {
    enabled: !!chat?.id,
  });

  const chatStart = trpc.chat.start.useMutation({
    onError(error) {
      const _res = Chat.StartError.safeParse(error.data);
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
      const _res = Message.SendError.safeParse(error.data);
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
  }, [initialMessages]);

  // 포커스 설정: 드로어 애니메이션(300ms) 후 포커스 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldFocusInput(true);
      const resetTimer = setTimeout(() => setShouldFocusInput(false), 500);
      return () => clearTimeout(resetTimer);
    }, 300); // 애니메이션 완료 후 포커스 설정
    return () => clearTimeout(timer);
  }, [chat?.id, collapsed]);

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
                    reasoningText: msg.reasoningText + chunk.reasoningText,
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

  const handleRegenerateSuccess = (newMessage: Message.Data) => {
    setMessages((prev) => [...prev, newMessage]);
    setStreamMessageId(newMessage.id);
    utils.chat.list.invalidate();
  };

  const savedMessages = useMemo(
    () => messages.filter((msg) => msg.isBookmarked),
    [messages]
  );

  if (!user) return null;

  return (
    <div className="flex h-full relative">
      <div
        className={cn(
          "flex flex-col h-full relative items-center transition-all duration-300",
          isMobile ? "w-full" : openDrawer ? "w-[70%]" : "w-full"
        )}
      >
        {isMobile ? (
          <MobileChatHeader chatTitle={chat?.title} chatType={chat?.type} />
        ) : (
          <ChatHeader chatTitle={chat?.title} chatType={chat?.type} />
        )}
        <div
          className={cn(
            "flex-1 overflow-y-auto mt-[50px] w-full transition-all duration-300",
            user.preferences.wideView
              ? "md:w-[95%] md:mx-auto"
              : "md:w-[80%] md:mx-auto"
          )}
        >
          {(chat || messages.length > 0) && (
            <ChatSessionProvider onRegenerateSuccess={handleRegenerateSuccess}>
              <ChatMessageList
                messages={messages}
                onToggleSaved={handleToggleSaved}
              />
            </ChatSessionProvider>
          )}
        </div>
        {children}
        <div className="w-full px-4 sticky bottom-0 bg-white z-10 flex flex-col items-center">
          <ChatInputBox
            onSendMessage={onSendMessage}
            shouldFocus={shouldFocusInput}
            usageLimit={usageLimit}
          />
          <div className="text-xs text-gray-500 mt-2 mb-2">
            AI can make mistakes — please double-check.
          </div>
        </div>
      </div>
      <ChatDrawer savedMessages={savedMessages} />
    </div>
  );
}
