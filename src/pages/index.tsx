import LoginButton from "@/components/login/LoginButton";
import { FriendCard } from "@/components/town/FriendCard";
import { RecommendedSection } from "@/components/town/RecommendedSection";
import {
  getRecommendedFriends,
  withsyFriends,
} from "@/components/town/withsyFriends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";

export default function Page() {
  const { user } = useUser();
  const { message, bestFriend, extraFriend } = getRecommendedFriends();

  return (
    <div className="flex flex-col h-screen">
      {/* ✅ 헤더 영역 */}
      <div className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-end">
          {!user && <LoginButton />}
        </div>
      </div>

      {/* ✅ 콘텐츠 영역 */}
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
