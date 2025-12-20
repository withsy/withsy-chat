import { CollapseButton } from "@/components/CollapseButton";
import { PartialLoading } from "@/components/Loading";
import ModelCard from "@/components/models/ModelCard";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useAiProfileStore } from "@/stores/useAiProfileStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Model } from "@repo/common";

const MODELS = Model.options;

function Page() {
  const { collapsed } = useSidebarStore();
  const { profiles, isLoading } = useAiProfileStore();
  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");

  if (isLoading) {
    return <PartialLoading />;
  }

  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <div className="relative flex h-full flex-col">
      <div
        className="absolute top-0 left-0 flex h-[50px] w-full items-center justify-between px-4 select-none"
        style={headerStyle}
      >
        <div>{collapsed && <CollapseButton />}</div>
      </div>
      <div className="mt-[50px] overflow-y-auto p-5">
        <p className="text-muted-foreground mb-6">
          Make each AI model feel a little more personal by giving it a friendly
          name and a unique profile image. Images should be under 1MB, and names
          can be up to 20 characters long.
        </p>

        <div className="flex-1 space-y-4">
          {MODELS.map((model) => {
            const profile = profiles[model];
            return (
              <ModelCard
                key={model}
                model={model}
                name={profile?.name ?? model}
                image={profile?.imageSource}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

(Page as any).layoutType = "chat";
export default Page;
