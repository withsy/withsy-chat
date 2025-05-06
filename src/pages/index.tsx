import BranchHistory from "@/components/home/BranchHistory";
import { Hero } from "@/components/home/Hero";
import PromptTransparency from "@/components/home/PromptTransparency";
import SaveStar from "@/components/home/SaveStar";
import ThemeAndPrefsSection from "@/components/home/ThemeAndPrefs";
import { getUser } from "@/server/utils";
import { User } from "@/types";
import type { GetServerSideProps } from "next";

type Props = {
  user: User.Data | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const user = await getUser({ req: context.req, res: context.res });
  return { props: { user } };
};

export default function Page({ user }: Props) {
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
