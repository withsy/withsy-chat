import EmptyChatInterface from "@/components/chat/EmptyChatView";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const { user } = useUser();
  return <EmptyChatInterface name={user?.name ?? ""} />;
}
