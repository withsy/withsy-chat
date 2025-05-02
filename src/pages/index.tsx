import BranchHistory from "@/components/home/BranchHistory";
import { Hero } from "@/components/home/Hero";
import PromptTransparency from "@/components/home/PromptTransparency";
import SaveStar from "@/components/home/SaveStar";
import ThemeAndPrefsSection from "@/components/home/ThemeAndPrefs";
import { service } from "@/server/service-registry";
import { User } from "@/types";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

type Props = {
  user: User.Data | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  let user: User.Data | null = null;
  if (session) {
    const userSession = User.Session.parse(session);
    user = await service.user.get(userSession.user.id);
  }

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
