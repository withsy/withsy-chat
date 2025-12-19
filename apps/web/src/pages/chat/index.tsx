import EmptyChatView from "@/components/chat/EmptyChatView";

function Page() {
  return <EmptyChatView />;
}

(Page as any).layoutType = "chat";
export default Page;
