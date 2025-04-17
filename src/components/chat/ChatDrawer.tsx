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

  if (isMobile) {
    return (
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => setOpenDrawer(open ? openDrawer : null)}
      >
        <DrawerContent className="h-[80%] rounded-t-2xl p-4">
          <CustomDrawerContent messages={savedMessages ?? []} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={cn(
        "h-full bg-white",
        isDrawerOpen ? "w-[30%] border-l" : "w-0 overflow-hidden"
      )}
      style={{
        ...(isDrawerOpen && {
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
        }),
      }}
    >
      <ChatDrawerHeader openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      <CustomDrawerContent messages={savedMessages ?? []} />
    </div>
  );
};

function CustomDrawerContent({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="overflow-y-auto max-h-[80%] pr-2">
      {messages.map((msg) => (
        <BookmarkCard
          key={msg.id}
          messageId={msg.id}
          chatId={msg.chatId}
          text={msg.text}
          createdAt={msg.createdAt}
          updatedAt={msg.updatedAt}
        />
      ))}
    </div>
  );
}
