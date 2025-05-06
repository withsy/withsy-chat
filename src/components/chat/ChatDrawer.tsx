import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type * as Chat from "@/types/chat";
import type * as Message from "@/types/message";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { FolderGit2, FolderRoot, GitBranch } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BookmarkCard } from "../bookmarks/BookmarkCard";
import { PartialError } from "../Error";
import { PartialLoading } from "../Loading";
import { PromptCard } from "../prompts/PromptCard";
import { Drawer, DrawerContent } from "../ui/drawer";
import ChatDrawerHeader from "./ChatDrawerHeader";

type ChatDrawerProps = {
  savedMessages?: MessageData[];
};

export const ChatDrawer = ({ savedMessages }: ChatDrawerProps) => {
  const trpc = useTRPC();
  const { chat } = useChatStore();
  const { isMobile } = useSidebarStore();
  const { openDrawer, setOpenDrawer } = useDrawerStore();

  const router = useRouter();
  const isDrawerOpen = !!openDrawer;
  const chatId = chat?.id;
  const chatBranchList = useQuery(
    trpc.chatBranch.list.queryOptions(
      chatId && openDrawer === "branches" ? { chatId } : skipToken
    )
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { parentId, ...restQuery } = router.query;
    if (typeof parentId === "string") {
      setOpenDrawer(parentId);
      router.replace(
        { pathname: router.pathname, query: restQuery },
        undefined,
        { shallow: true }
      );
    }
  }, [router.query.parentId, setOpenDrawer, router]);

  useEffect(() => {
    if (isDrawerOpen) {
      const timer = setTimeout(() => setReady(true), 50);
      return () => clearTimeout(timer);
    } else {
      setReady(false);
    }
  }, [isDrawerOpen]);

  const handleCloseDrawer = () => {
    setOpenDrawer(null);
  };

  let body;
  if (openDrawer == null) {
    body = <div className="text-sm text-muted-foreground">No content</div>;
  } else if (openDrawer === "saved") {
    body = <SavedMessages messages={savedMessages ?? []} />;
  } else if (openDrawer === "branches") {
    body = <Branches chatBranchList={chatBranchList} />;
  } else if (openDrawer === "prompt") {
    body = <Prompts />;
  } else {
    body = <div className="text-sm text-muted-foreground">No content</div>;
  }

  if (isMobile) {
    return (
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDrawer();
          else setOpenDrawer(openDrawer);
        }}
      >
        <DrawerContent className="h-full rounded-t-2xl flex flex-col">
          {ready && body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 pb-15",
        isDrawerOpen ? "w-[30%] border-l" : "w-0 overflow-hidden"
      )}
    >
      <ChatDrawerHeader
        openDrawer={openDrawer}
        setOpenDrawer={handleCloseDrawer}
      />
      {body}
    </div>
  );
};

function Prompts() {
  const trpc = useTRPC();
  const { chat } = useChatStore();
  const { data: defaultPrompt, isLoading: isLoadingDefaultPrompt } = useQuery(
    trpc.userDefaultPrompt.get.queryOptions(undefined, {
      retry: false,
    })
  );
  const { data: prompts, isLoading: isLoadingPrompts } = useQuery(
    trpc.userPrompt.list.queryOptions()
  );

  const updateChatPrompt = useMutation(trpc.chat.update.mutationOptions());
  if (isLoadingDefaultPrompt || isLoadingPrompts) {
    return <div>Loading...</div>;
  }

  const handleApplyPrompt = (promptId: string | null) => {
    if (chat) {
      updateChatPrompt.mutate({
        chatId: chat.id,
        userPromptId: promptId,
      });
    }
  };

  const appliedPrompt = prompts?.find((p) => p.id === chat?.userPromptId);
  const remainingPrompts =
    prompts?.filter(
      (p) =>
        p.id !== defaultPrompt?.userPrompt?.id && p.id !== chat?.userPromptId
    ) ?? [];

  return (
    <div className="overflow-y-auto max-h-[100%] flex flex-col space-y-6 p-4 select-none">
      <div className="space-y-2">
        <p className="text-sm text-black font-semibold">Applied</p>
        <p className="text-sm text-muted-foreground">
          These prompts are currently applied to this chat.
        </p>
        {defaultPrompt?.userPrompt && (
          <PromptCard
            key={defaultPrompt.userPromptId}
            prompt={defaultPrompt.userPrompt}
            onClick={() => handleApplyPrompt(defaultPrompt.userPromptId)}
            isDefault={true}
            isActive={defaultPrompt.userPromptId === chat?.userPromptId}
          />
        )}
        {appliedPrompt &&
          appliedPrompt.id !== defaultPrompt?.userPrompt?.id && (
            <PromptCard
              key={appliedPrompt.id}
              prompt={appliedPrompt}
              onClick={() => handleApplyPrompt(appliedPrompt.id)}
              isActive={true}
            />
          )}
      </div>

      {/* Prompts Section */}
      {remainingPrompts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-black font-semibold">Prompts</p>
          <p className="text-sm text-muted-foreground">
            Click to apply a new prompt. It will replace the currently applied
            prompt.
          </p>

          {remainingPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onClick={() => handleApplyPrompt(prompt.id)}
              isActive={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedMessages({ messages }: { messages: MessageData[] }) {
  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        No saved items yet.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[100%] m-2 flex flex-col gap-y-4 bg-transparent">
      <span className="text-sm select-none">
        {"Here you can find the messages you've saved from this chat."}
      </span>
      {messages.map((msg) => (
        <BookmarkCard
          key={msg.id}
          messageId={msg.id}
          chatId={msg.chatId}
          text={msg.text}
          createdAt={msg.createdAt}
          hideUnsave={true}
        />
      ))}
    </div>
  );
}

function Branches({ chatBranchList }: { chatBranchList: any }) {
  const { chat } = useChatStore();
  const router = useRouter();
  if (chatBranchList.isLoading) {
    return <PartialLoading />;
  } else if (chatBranchList.isError) {
    return <PartialError />;
  } else if (chatBranchList.data) {
    let originalChat;
    if (chat && chat.type == "branch" && chat.parentMessage) {
      const chatId = chat.parentMessage.chatId;
      const messageId = chat.parentMessageId;
      const parentMessageText = chat.parentMessage.text;
      originalChat = (
        <div className="m-2">
          <div className="flex gap-2 items-center font-semibold text-sm mb-3 select-none">
            <FolderRoot size={16} />
            Original Chat
          </div>
          <span className="text-sm select-none">
            You are viewing a branch. Tap below to go back to the original chat.
          </span>
          <div
            key={chat.parentMessageId}
            className="flex gap-2 p-3 mt-2 items-center select-none border shadow-xs  hover:bg-gray-100 hover:font-semibold active:bg-gray-100 active:font-semibold"
            onClick={() =>
              router.push(`/chat/${chatId}?messageId=${messageId}`)
            }
            style={{
              borderRadius: 10,
            }}
          >
            <GitBranch size={16} />
            {parentMessageText.length > 20
              ? `${parentMessageText.slice(0, 20)}...`
              : chat.parentMessage?.text}{" "}
          </div>
        </div>
      );
    }
    if (chatBranchList.data.length == 0) {
      if (originalChat) return originalChat;
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          No Branches Yet.
        </div>
      );
    }
    return (
      <div className="overflow-y-auto max-h-[100%] m-2 flex flex-col gap-y-4 bg-transparent">
        {originalChat}
        <div className="flex gap-2 items-center font-semibold text-sm select-none">
          <FolderGit2 size={16} />
          Branch List
        </div>
        <span className="text-sm select-none">
          Branches created from this chat. Tap to jump to a specific branch.
        </span>
        {chatBranchList.data.map((x: ChatData) => {
          return (
            <div
              key={x.id}
              className="flex gap-2 p-3 items-center select-none border shadow-xs hover:bg-gray-100 hover:font-semibold active:bg-gray-100 active:font-semibold"
              onClick={() => router.push(`/chat/${x.id}`)}
              style={{
                borderRadius: 10,
              }}
            >
              <GitBranch size={16} />
              {x.title.length > 20 ? `${x.title.slice(0, 20)}...` : x.title}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
      No Branches Yet.
    </div>
  );
}
