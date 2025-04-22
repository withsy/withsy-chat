import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useDrawerStore } from "@/stores/useDrawerStore";
import type { ChatMessage } from "@/types/chat";
import { Chat } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { Bookmark, FolderGit2, FolderRoot, GitBranch } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BookmarkCard } from "../bookmarks/BookmarkCard";
import { PartialError } from "../Error";
import { PartialLoading } from "../Loading";
import { Drawer, DrawerContent } from "../ui/drawer";
import ChatDrawerHeader from "./ChatDrawerHeader";

type ChatDrawerProps = {
  chat: Chat | null;
  isMobile: boolean;
  savedMessages?: ChatMessage[];
};

export const ChatDrawer = ({
  chat,
  savedMessages,
  isMobile,
}: ChatDrawerProps) => {
  const { openDrawer, setOpenDrawer } = useDrawerStore();

  const router = useRouter();
  const isDrawerOpen = !!openDrawer;
  const chatId = chat?.id;
  const branchList = trpc.branch.list.useQuery(
    chatId && openDrawer === "branches" ? { chatId } : skipToken
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
    body = <Branches branchList={branchList} chat={chat} />;
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
        <DrawerContent className="h-[80%] rounded-t-2xl p-4">
          {ready && body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={cn(
        "h-full transition-all duration-300",
        isDrawerOpen ? "w-[30%] border-l" : "w-0 overflow-hidden"
      )}
      style={{
        ...(isDrawerOpen && {
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
        }),
      }}
    >
      <ChatDrawerHeader
        openDrawer={openDrawer}
        setOpenDrawer={handleCloseDrawer}
      />
      {body}
    </div>
  );
};

function SavedMessages({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        No saved items yet.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[80%] m-2 flex flex-col gap-y-4 bg-transparent">
      <div className="flex gap-2 items-center font-semibold text-sm select-none">
        <Bookmark size={16} />
        Saved Messages
      </div>
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

function Branches({
  chat,
  branchList,
}: {
  chat: Chat | null;
  branchList: any;
}) {
  const router = useRouter();
  if (branchList.isLoading) {
    return <PartialLoading />;
  } else if (branchList.isError) {
    return <PartialError />;
  } else if (branchList.data) {
    let originalChat;
    if (chat && chat.type == "branch" && chat.parentMessage) {
      const chatId = chat.parentMessage.chatId;
      const messageId = chat.parentMessageId;
      const parentMessageText = chat.parentMessage.text ?? "";
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
    if (branchList.data.length == 0) {
      if (originalChat) return originalChat;
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          No Branches Yet.
        </div>
      );
    }
    return (
      <div className="overflow-y-auto max-h-[80%] m-2 flex flex-col gap-y-4 bg-transparent">
        {originalChat}
        <div className="flex gap-2 items-center font-semibold text-sm select-none">
          <FolderGit2 size={16} />
          Branch List
        </div>
        <span className="text-sm select-none">
          Branches created from this chat. Tap to jump to a specific branch.
        </span>
        {branchList.data.map((x: Chat) => {
          return (
            <div
              key={x.id}
              className="flex gap-2 p-3 items-center select-none border shadow-xs hover:bg-gray-100 hover:font-semibold active:bg-gray-100 active:font-semibold"
              onClick={() => router.push(`/chat/${x.id}?messageId=last`)}
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
      Unknown Error. Please Report.
    </div>
  );
}
