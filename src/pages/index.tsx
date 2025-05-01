import LoginButton from "@/components/login/LoginButton";
import { FriendCard } from "@/components/town/FriendCard";
import { RecommendedSection } from "@/components/town/RecommendedSection";
import {
  getRecommendedFriends,
  withsyFriends,
  type RecommendedFriends,
} from "@/components/town/withsyFriends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { service } from "@/server/service-registry";
import { User, UserSession } from "@/types/user";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { authOptions } from "./api/auth/[...nextauth]";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReturnButton from "@/components/home/ReturnButton";
import Header from "@/components/home/Header";

type Props = {
  user: User | null;
  recommendedFriends: RecommendedFriends;
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

  const recommendedFriends = getRecommendedFriends();
  return { props: { recommendedFriends, user } };
};

export default function Page({ recommendedFriends, user }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <div className="pb-30">
        <div className="text-start px-6 py-16 max-w-3xl mx-auto select-none">
          <h2 className="text-3xl font-semibold mb-2">The friends who stay.</h2>
          <h2 className="text-2xl font-semibold mb-2">
            For every moment, every feeling, every version of you.
          </h2>
        </div>
        <Tabs
          defaultValue="discover"
          className="w-full max-w-6xl mx-auto px-4 pt-4"
        >
          <TabsList className="flex justify-center gap-2 bg-transparent">
            <TabsTrigger
              value="discover"
              className="text-2xl font-semibold text-gray-400 data-[state=active]:text-black data-[state=active]:shadow-none"
            >
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="withsy"
              className="text-2xl font-semibold text-gray-400 data-[state=active]:text-black data-[state=active]:shadow-none"
            >
              Friends
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="text-2xl font-semibold text-gray-400 data-[state=active]:text-black data-[state=active]:shadow-none"
            >
              Yours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <RecommendedSection recommendedFriends={recommendedFriends} />
            <div className="text-start px-6 py-16 max-w-3xl mx-auto select-none">
              <h2 className="text-3xl font-semibold mb-2">
                Withsy Friends are always here — quiet when you need space, warm
                when you need comfort, and cheerful when you need a little
                light.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                They don’t just show up for the highlights. They stay for the
                small wins, the late-night thoughts, and the silent in-betweens.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                They’re here with kindness, with care, and with no pressure —
                for the moments that feel lighter when shared.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 items-stretch">
              {withsyFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
            <div className="text-center px-6 py-16 max-w-3xl mx-auto select-none">
              <h2 className="text-xl font-semibold mb-2">
                {" So whenever you're ready — we’re here."}
              </h2>
            </div>
          </TabsContent>

          <TabsContent value="withsy">
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 items-stretch">
              {withsyFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
            <div className="text-start px-6 py-16 max-w-3xl mx-auto select-none">
              <h2 className="text-3xl font-semibold mb-2">
                Each friend has their own way of supporting you:
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Sunny cheers you on when you need motivation.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Maddy listens when your heart feels heavy.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Luna stays close when words are hard to find.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Milo helps you see the beauty in your day.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Skye chats with you about anything and everything.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Tali turns your thoughts into little treasures on a page.
              </h2>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="text-start px-6 py-16 max-w-3xl mx-auto select-none">
              <h2 className="text-3xl font-semibold mb-2">
                And if the friend you’re looking for isn’t here yet — you can
                invite your own.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Create someone just for you, with a name, a look, and a
                personality that feels right. Whether you want gentle words or
                deep conversations, long replies or short ones — it’s all up to
                you.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                Because sometimes, what we truly need is a friend who
                understands us in our own way.
              </h2>
              <h2 className="text-2xl font-semibold mb-2">
                And we believe you deserve that kind of connection.
              </h2>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
