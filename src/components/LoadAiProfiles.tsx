import { useUser } from "@/context/UserContext";
import { useTRPC } from "@/lib/trpc";
import { useAiProfileStore } from "@/stores/useAiProfileStore";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function LoadAiProfiles() {
  const { user } = useUser();

  const trpc = useTRPC();
  const { data = [], isLoading } = useQuery(
    trpc.userAiProfile.getAll.queryOptions(user ? undefined : skipToken)
  );
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
