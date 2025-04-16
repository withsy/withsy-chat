import EmptyChatInterface from "@/components/chat/EmptyChatView";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const { userSession } = useUser();
  return <EmptyChatInterface name={userSession?.user?.name ?? ""} />;
}
