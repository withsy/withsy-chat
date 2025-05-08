import BranchHistory from "@/components/home/BranchHistory";
import { Hero } from "@/components/home/Hero";
import PromptTransparency from "@/components/home/PromptTransparency";
import SaveStar from "@/components/home/SaveStar";
import ThemeAndPrefsSection from "@/components/home/ThemeAndPrefs";
import { useUser } from "@/context/UserContext";
import { getUser } from "@/server/utils";
import type { UserData } from "@/types/user";
import type { GetServerSideProps } from "next";
import { useEffect } from "react";

type Props = {
  user: UserData | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const user = await getUser({ req: context.req, res: context.res });
  return { props: { user } };
};

function Page({ user }: Props) {
  const { setUser } = useUser();

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  return (
    <div>
      <Hero user={user} />
      <ThemeAndPrefsSection />
      <PromptTransparency />
      <SaveStar />
      <BranchHistory />
    </div>
  );
}

(Page as any).layoutType = "home";
export default Page;
