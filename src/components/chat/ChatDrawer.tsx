import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Chat, type ChatMessage } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { FolderGit2, GitBranch } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BookmarkCard } from "../bookmarks/BookmarkCard";
import { PartialError } from "../Error";
import { PartialLoading } from "../Loading";
import { Drawer, DrawerContent } from "../ui/drawer";
import ChatDrawerHeader from "./ChatDrawerHeader";

type ResponsiveDrawerProps = {
  chatId: string | undefined;
  openDrawer: string | null;
  setOpenDrawer: (value: string | null) => void;
  isMobile: boolean;
  savedMessages?: ChatMessage[];
};

export const ResponsiveDrawer = ({
  chatId,
  openDrawer,
  setOpenDrawer,
  savedMessages,
  isMobile,
}: ResponsiveDrawerProps) => {
  const router = useRouter();
  const isDrawerOpen = !!openDrawer;
  const chatListBranches = trpc.chat.listBranches.useQuery(
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
    body = <Branches chatListBranches={chatListBranches} />;
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

function Branches({ chatListBranches }: { chatListBranches: any }) {
  const router = useRouter();
  if (chatListBranches.isLoading) {
    return <PartialLoading />;
  } else if (chatListBranches.isError) {
    return <PartialError />;
  } else if (chatListBranches.data) {
    if (chatListBranches.data.length == 0) {
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          No branches yet.
        </div>
      );
    }
    return (
      <div>
        <div className="flex gap-2 items-center p-2 font-semibold text-sm">
          <FolderGit2 size={16} />
          List of Branches
        </div>
        {chatListBranches.data.map((x: Chat) => {
          return (
            <div
              key={x.id}
              className="flex gap-2 p-3 items-center select-none m-2 border shadow-xs"
              onClick={() => router.push(`/chat/${x.id}?messageId=last`)}
              style={{
                borderRadius: 10,
              }}
            >
              <GitBranch size={16} />
              {x.title}
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
