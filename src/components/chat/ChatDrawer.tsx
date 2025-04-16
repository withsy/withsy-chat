import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent } from "../ui/drawer";
import { ChatBubble } from "./ChatBubble";
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
  const [messages, setMessages] = useState(savedMessages);
  console.log("여기서는?", savedMessages);

  const updateMessageMutation = trpc.chatMessage.update.useMutation();

  const handleToggleSaved = (id: number, newValue: boolean) => {
    updateMessageMutation.mutate(
      { chatMessageId: id, isBookmarked: newValue },
      {
        onSuccess: () => {
          setMessages((prev) =>
            (prev ?? []).map((msg) =>
              msg.id === id ? { ...msg, isBookmarked: newValue } : msg
            )
          );

          if (newValue) {
            toast.success("Saved for later", {
              description: "You can find it in your saved list.",
            });
          } else {
            toast.success("Removed from saved", {
              description: "It’s no longer in your saved list.",
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
  if (isMobile) {
    return (
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => setOpenDrawer(open ? openDrawer : null)}
      >
        <DrawerContent className="h-[80%] rounded-t-2xl p-4">
          <CustomDrawerContent
            messages={messages ?? []}
            onToggleSaved={handleToggleSaved}
          />
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
      <CustomDrawerContent
        messages={messages ?? []}
        onToggleSaved={handleToggleSaved}
      />
    </div>
  );
};

function CustomDrawerContent({
  messages,
  onToggleSaved,
}: {
  messages: ChatMessage[];
  onToggleSaved: (id: number, newValue: boolean) => void;
}) {
  console.log(messages);
  return (
    <div>
      test
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} onToggleSaved={onToggleSaved} />
      ))}
    </div>
  );
}
