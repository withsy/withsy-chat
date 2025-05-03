import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAiProfileStore } from "@/stores/useAiProfileStore";

export default function LoadAiProfiles() {
  const { data = [], isLoading } = trpc.userAiProfile.getAll.useQuery();
  const { setProfiles, setLoading } = useAiProfileStore();

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const profileMap = Object.fromEntries(data.map((p) => [p.model, p]));
    setProfiles(profileMap);
  }, [data]);

  return null;
}
