import { cn } from "@/lib/utils";
import { type ChatMessage } from "@/types/chat";
import { BookmarkCard } from "../bookmarks/BookmarkCard";
import { Drawer, DrawerContent } from "../ui/drawer";
import ChatDrawerHeader from "./ChatDrawerHeader";

type ResponsiveDrawerProps = {
  openDrawer: string | null;
  setOpenDrawer: (value: string | null) => void;
  isMobile: boolean;
  savedMessages?: ChatMessage[];
};

export const ResponsiveDrawer = ({
  openDrawer,
  setOpenDrawer,
  savedMessages,
  isMobile,
}: ResponsiveDrawerProps) => {
  const isDrawerOpen = !!openDrawer;

  let body;
  if (openDrawer == null) {
    body = <div>error</div>;
  } else if (openDrawer == "saved") {
    body = <SavedMessages messages={savedMessages ?? []} />;
  } else if (openDrawer == "branches") {
    body = <div>branches</div>;
  } else {
    // branch
    body = <div>branch</div>;
  }

  if (isMobile) {
    return (
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => setOpenDrawer(open ? openDrawer : null)}
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
        "h-full bg-gray-50",
        isDrawerOpen ? "w-[50%] border-l" : "w-0 overflow-hidden"
      )}
      style={{
        ...(isDrawerOpen && {
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
        }),
      }}
    >
      <ChatDrawerHeader openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      {body}
    </div>
  );
};

function SavedMessages({ messages }: { messages: ChatMessage[] }) {
  if (messages.length == 0) {
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
        />
      ))}
    </div>
  );
}
