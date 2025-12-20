import { CollapseButton } from "@/components/CollapseButton";
import CustomFriendModal from "@/components/town/CustomFriendModal";
import { FriendCard } from "@/components/town/FriendCard";
import { RecommendedSection } from "@/components/town/RecommendedSection";
import {
  getRecommendedFriends,
  withsyFriends,
  type RecommendedFriends,
} from "@/components/town/withsyFriends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useEffect, useState } from "react";

export default function Page() {
  const [recommendedFriends, SetRecommendedFriends] =
    useState<RecommendedFriends | null>(null);

  const { collapsed } = useSidebarStore();

  useEffect(() => {
    getRecommendedFriends().then((recommendedFriends) => {
      SetRecommendedFriends(recommendedFriends);
    });
  }, []);

  if (!recommendedFriends) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="sticky top-0 z-50 mx-auto flex w-full max-w-6xl items-center justify-between p-2 select-none">
        <div>{collapsed && <CollapseButton hoverColor="bg-gray-100" />}</div>
        <div>
          <CustomFriendModal />
        </div>
      </div>
      <div className="h-full flex-1 overflow-y-auto pb-30">
        <Tabs
          defaultValue="discover"
          className="mx-auto h-full w-full max-w-6xl px-4 pt-4 select-none"
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
            <div className="grid items-stretch gap-4 gap-y-5 p-5 sm:grid-cols-3">
              {withsyFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="withsy">
            <div className="grid items-stretch gap-4 gap-y-5 p-5 sm:grid-cols-3">
              {withsyFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="custom" className="h-full">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="mb-4 text-2xl font-semibold">
                Invite your new friend!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
