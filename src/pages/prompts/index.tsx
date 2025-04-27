import { PartialLoading } from "@/components/Loading";
import { useUser } from "@/context/UserContext";

export default function PromptsPage() {
  const { user } = useUser();
  if (!user || user == null) {
    return <PartialLoading />;
  }
  return <div />;
}
