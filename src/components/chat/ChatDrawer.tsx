export function DrawerContent({ drawerType }: { drawerType: string }) {
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
