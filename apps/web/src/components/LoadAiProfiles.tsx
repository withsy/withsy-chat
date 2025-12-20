import { useTRPC } from "@/lib/trpc";
import { useAiProfileStore } from "@/stores/useAiProfileStore";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LoadAiProfiles() {
  const { status } = useSession();

  const trpc = useTRPC();
  const { data = [], isLoading } = useQuery(
    trpc.userAiProfile.list.queryOptions(undefined, {
      enabled: status === "authenticated",
    }),
  );
  const { setProfiles, setLoading } = useAiProfileStore();

  useEffect(() => {
    setLoading(isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    const profileMap = Object.fromEntries(data.map((p) => [p.model, p]));
    setProfiles(profileMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return null;
}
