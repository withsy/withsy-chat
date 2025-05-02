import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc"; // 너가 쓰는 trpc 경로에 맞춰 수정
import { Model } from "@/types/model";
import { ModelAvatar } from "@/components/ModelAvatar";

type AiProfile = {
  model: string;
  name: string;
  image?: string; // base64 or URL
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">AI Model Profiles</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {MODELS.map((model) => {
          const profile = profiles[model];
          return (
            <div
              key={model}
              className="border rounded-xl p-4 flex items-center gap-4"
            >
              {profile?.image ? (
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.image} alt={model} />
                  <AvatarFallback>
                    {model.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <ModelAvatar name={model} />
              )}
              <div className="flex-1">
                <div className="font-semibold">{profile?.name || model}</div>
                <div className="text-sm text-muted-foreground">{model}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 추후 수정 모달 연결
                  alert(`Edit profile for ${model}`);
                }}
              >
                Edit
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
