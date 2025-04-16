import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { Drawer, DrawerContent } from "../ui/drawer";
import ChatDrawerHeader from "./ChatDrawerHeader";

type ResponsiveDrawerProps = {
  openDrawer: string | null;
  setOpenDrawer: (value: string | null) => void;
  isMobile: boolean;
  bookmarkedMessages?: ChatMessage[];
};

export const ResponsiveDrawer = ({
  openDrawer,
  setOpenDrawer,
  bookmarkedMessages,
  isMobile,
}: ResponsiveDrawerProps) => {
  const isDrawerOpen = !!openDrawer;
  console.log("bookmarked", bookmarkedMessages, bookmarkedMessages?.length);

  const drawerBody = (
    <>
      <button onClick={() => setOpenDrawer(null)}>Close</button>
      <CustomDrawerContent drawerType={openDrawer!} />
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => setOpenDrawer(open ? openDrawer : null)}
      >
        <DrawerContent className="h-[80%] rounded-t-2xl p-4">
          {drawerBody}
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
      <div className="p-4">{drawerBody}</div>
    </div>
  );
};

function CustomDrawerContent({ drawerType }: { drawerType: string }) {
  switch (drawerType) {
    case "saved-messages":
      return <div>Saved Messages Content</div>;
    case "message-branches":
      return <div>Branches Content</div>;
    default:
      return null;
  }
}
