import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Model } from "@/types/model";
import ModelCard from "@/components/models/ModelCard";

type AiProfile = {
  model: string;
  name: string;
  imageUrl?: string;
};

export default function ModelsPage() {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">AI Model Profiles</h1>
      <div className="flex-1 overflow-y-auto space-y-4">
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
  );
}
