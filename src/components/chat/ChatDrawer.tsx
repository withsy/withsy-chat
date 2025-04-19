import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Chat, type ChatMessage } from "@/types/chat";
import { skipToken } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={cn(
        "h-full bg-gray-50 transition-all duration-300",
        isDrawerOpen ? "w-[50%] border-l" : "w-0 overflow-hidden"
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
        {chatListBranches.data.map((x: Chat) => {
          return <div key={x.id}>{x.title}</div>;
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
