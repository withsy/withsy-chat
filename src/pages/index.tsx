import LoginButton from "@/components/login/LoginButton";
import { FriendCard } from "@/components/town/FriendCard";
import { RecommendedSection } from "@/components/town/RecommendedSection";
import {
  getRecommendedFriends,
  withsyFriends,
} from "@/components/town/withsyFriends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();

  const { user } = useUser();
  const { message, bestFriend, extraFriend } = getRecommendedFriends();

  return (
    <div className="flex flex-col h-screen">
      <div className="w-full bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto p-2 flex justify-end select-none">
          {user ? (
            <div
              className="flex items-center gap-2 underline underline-offset-8 p-2 hover:bg-gray-200 active:bg-gray-200 rounded-md"
              onClick={() => {
                router.push("/friends");
              }}
            >
              <div className="text-xl font-semibold">Return to chat</div>
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-30">
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
            <RecommendedSection
              bestFriend={bestFriend}
              extraFriend={extraFriend ?? withsyFriends[0]}
              message={message}
            />
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
