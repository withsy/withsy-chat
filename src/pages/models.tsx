import { CollapseButton } from "@/components/CollapseButton";
import LoadAiProfiles from "@/components/LoadAiProfiles";
import { PartialLoading } from "@/components/Loading";
import ModelCard from "@/components/models/ModelCard";
import { useUser } from "@/context/UserContext";
import { setTrpcCsrfToken } from "@/lib/trpc";
import { getCsrfToken, getUser } from "@/server/utils";
import { useAiProfileStore } from "@/stores/useAiProfileStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Model } from "@/types/model";
import type { UserData } from "@/types/user";
import type { GetServerSideProps } from "next";
import { useEffect } from "react";

type Props = {
  csrfToken: string;
  user: UserData | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const csrfToken = getCsrfToken(res);
  const user = await getUser({ req, res });
  return { props: { csrfToken, user } };
};

function ModelsPage({ csrfToken, user }: Props) {
  const { setUser } = useUser();
  const { collapsed } = useSidebarStore();
  const { profiles, isLoading } = useAiProfileStore();

  const MODELS = Model.options;

  useEffect(() => {
    if (csrfToken) setTrpcCsrfToken(csrfToken);
  }, [csrfToken]);

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  if (!user || isLoading) {
    return <PartialLoading />;
  }

  const { themeColor, themeOpacity } = user.preferences;
  const headerStyle: React.CSSProperties = {
    backgroundColor: `rgba(${themeColor}, ${themeOpacity / 2})`,
  };

  return (
    <div className="flex flex-col h-full relative">
      <LoadAiProfiles />

      <div
        className="absolute top-0 left-0 w-full h-[50px] px-4 flex items-center justify-between select-none"
        style={headerStyle}
      >
        <div>{collapsed && <CollapseButton />}</div>
      </div>
      <div className="mt-[50px] p-5 overflow-y-auto">
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
                csrfToken={csrfToken}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

(ModelsPage as any).layoutType = "chat";
export default ModelsPage;
