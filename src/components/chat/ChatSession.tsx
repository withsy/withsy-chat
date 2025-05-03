import { ChatSessionProvider } from "@/context/ChatSessionContext";
import { useUser } from "@/context/UserContext";
import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSelectedModelStore } from "@/stores/useSelectedModelStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Chat, Message, MessageChunk } from "@/types";
import { MessageId } from "@/types/id";
import type { UserUsageLimit } from "@/types/user-usage-limit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SuperJSON from "superjson";
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
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { chat } = useChatStore();
  const router = useRouter();

  const { collapsed, isMobile } = useSidebarStore();
  const { selectedModel } = useSelectedModelStore();
  const { user } = useUser();
  const [messages, setMessages] = useState(initialMessages);
  const [streamMessageId, setStreamMessageId] = useState<string | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [usageLimit, setUsageLimit] = useState<UserUsageLimit | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const { openDrawer } = useDrawerStore();

  const usageQuery = useQuery(
    trpc.userUsageLimit.get.queryOptions(undefined, {
      enabled: !!chat?.id,
    })
  );

  const chatStart = useMutation(
    trpc.chat.start.mutationOptions({
      onError(error) {
        const _res = Chat.StartError.safeParse(error.data);
        toast.error(`Chat starting failed.`);
      },
      onSuccess(data) {
        queryClient.invalidateQueries(trpc.chat.list.queryFilter());
        router.push(
          `/chat/${data.chat.id}?streamMessageId=${data.modelMessage.id}`
        );
      },
    })
  );

  const messageSend = useMutation(
    trpc.message.send.mutationOptions({
      onError(error) {
        const _res = Message.SendError.safeParse(error.data);
        toast.error(`Message sending failed.`);
      },
      onSuccess(data) {
        setMessages((prev) => [...prev, data.userMessage, data.modelMessage]);
        setStreamMessageId(data.modelMessage.id);
        queryClient.invalidateQueries(trpc.chat.list.queryFilter());
      },
    })
  );

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

  useEffect(() => {
    if (streamMessageId == null) {
      closeEventSource(eventSource);
      setEventSource(null);
      return;
    }

    const source = new EventSource(`/api/messages/${streamMessageId}`);
    source.addEventListener("open", () => {
      setMessages((prevMessages) =>
        prevMessages.map((x) =>
          x.id === streamMessageId
            ? {
                ...x,
                text: "",
                status: "processing",
              }
            : x
        )
      );
    });

    let isSuccess = false;
    source.addEventListener("error", () => {
      closeEventSource(source);
      setMessages((prev) =>
        prev.map((x) =>
          x.id === streamMessageId
            ? { ...x, status: isSuccess ? "succeeded" : "failed" }
            : x
        )
      );
      setStreamMessageId(null);
      if (!isSuccess) toast.error("Receive chat message failed.");
    });

    source.addEventListener("message", (ev) => {
      const event = MessageChunk.Event.parse(SuperJSON.parse(ev.data));
      if (event.type === "chunk") {
        const chunk = event.chunk;
        setMessages((prevMessages) =>
          prevMessages.map((x) =>
            x.id === streamMessageId
              ? {
                  ...x,
                  text: x.text + chunk.text,
                  reasoningText: x.reasoningText + chunk.reasoningText,
                }
              : x
          )
        );
      } else if (event.type === "usageLimit") {
        const usageLimit = event.usageLimit;
        if (usageLimit) setUsageLimit(usageLimit);
        isSuccess = true;
      }
    });

    setEventSource(source);
    return () => {
      closeEventSource(source);
    };
  }, [streamMessageId]);

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

  const messageUpdate = useMutation(trpc.message.update.mutationOptions());

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
    queryClient.invalidateQueries(trpc.chat.list.queryFilter());
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

function closeEventSource(source: EventSource | null) {
  if (!source) return;
  if (source.readyState === source.CLOSED) return;
  source.close();
}
