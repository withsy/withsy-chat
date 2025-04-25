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
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 items-stretch">
              {withsyFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="withsy">
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 items-stretch">
              {withsyFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 place-items-center">
              support soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
