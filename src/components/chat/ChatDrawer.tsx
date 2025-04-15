import { cn } from "@/lib/utils";
import { Drawer, DrawerContent } from "../ui/drawer";

type ResponsiveDrawerProps = {
  openDrawer: string | null;
  setOpenDrawer: (value: string | null) => void;
  isMobile: boolean;
};

export const ResponsiveDrawer = ({
  openDrawer,
  setOpenDrawer,
  isMobile,
}: ResponsiveDrawerProps) => {
  const isDrawerOpen = !!openDrawer;

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
        "h-full bg-white transition-all duration-300",
        isDrawerOpen ? "w-[30%] border-l" : "w-0 overflow-hidden"
      )}
    >
      <div className="p-4">{drawerBody}</div>
    </div>
  );
};

function CustomDrawerContent({ drawerType }: { drawerType: string }) {
  switch (drawerType) {
    case "message-index":
      return <div>Message Index Content</div>;
    case "saved-messages":
      return <div>Saved Messages Content</div>;
    case "message-branches":
      return <div>Branches Content</div>;
    default:
      return null;
  }
}
