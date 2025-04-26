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
import type { GetServerSideProps } from "next";

type Props = {
  recommendedFriends: RecommendedFriends;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const recommendedFriends = getRecommendedFriends();
  return { props: { recommendedFriends } };
};

export default function Page({ recommendedFriends }: Props) {
  const { collapsed } = useSidebarStore();
  return (
    <div className="flex flex-col h-screen">
      <div className="w-full sticky top-0 z-50 max-w-6xl mx-auto p-2 flex justify-between items-center select-none">
        <div>{collapsed && <CollapseButton hoverColor="bg-gray-100" />}</div>
        <div>
          <CustomFriendModal />
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
            <RecommendedSection recommendedFriends={recommendedFriends} />
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
