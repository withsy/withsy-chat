import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Model } from "@/types/model";
import ModelCard from "@/components/models/ModelCard";
import { CollapseButton } from "@/components/CollapseButton";
import { useUser } from "@/context/UserContext";
import { PartialLoading } from "@/components/Loading";
import { useSidebarStore } from "@/stores/useSidebarStore";

type AiProfile = {
  model: string;
  name: string;
  imageUrl?: string;
};

export default function ModelsPage() {
  const { user } = useUser();
  const { collapsed } = useSidebarStore();

  const MODELS = Model.options;
  const [profiles, setProfiles] = useState<Record<string, AiProfile>>({});
  const { data: fetchedProfiles = [], refetch } =
    trpc.userAiProfile.getAll.useQuery();

  useEffect(() => {
    if (fetchedProfiles.length > 0) {
      const profileMap = Object.fromEntries(
        fetchedProfiles.map((p) => [p.model, p])
      );
      setProfiles(profileMap);
    }
  }, [fetchedProfiles]);

  if (!user) {
    return <PartialLoading />;
  }
  const { themeColor, themeOpacity } = user.preferences;
  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };
  return (
    <div className="flex flex-col h-full relative">
      <div
        className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between select-none"
        style={headerStyle}
      >
        <div>{collapsed && <CollapseButton />}</div>
      </div>
      <div className="mt-[50px] p-5 overflow-y-auto ">
        <p className="text-muted-foreground text-sm mb-6">
          Make each AI model feel a little more personal by giving it a friendly
          name and a unique profile image. Images should be under 1MB, and names
          can be up to 20 characters long. It’s a small touch, but it helps make
          your experience feel more like you.
        </p>
        <div className="flex-1 space-y-4">
          {MODELS.map((model) => {
            const profile = profiles[model];
            return (
              <ModelCard
                key={model}
                model={model}
                name={profile?.name ? profile.name : model}
                image={profile?.imageUrl ?? undefined}
                refetch={refetch}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
