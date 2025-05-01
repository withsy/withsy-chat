import { service } from "@/server/service-registry";
import { User, UserSession } from "@/types/user";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { Hero } from "@/components/home/Hero";
import ThemeAndPrefsSection from "@/components/home/ThemeAndPrefs";
import PromptTransparency from "@/components/home/PromptTransparency";
import SaveStar from "@/components/home/SaveStar";
import BranchHistory from "@/components/home/BranchHistory";

type Props = {
  user: User | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  let user: User | null = null;
  if (session) {
    const userSession = UserSession.parse(session);
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
