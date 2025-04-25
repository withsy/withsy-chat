import { FriendCard } from "@/components/town/FriendCard";
import { RecommendedSection } from "@/components/town/RecommendedSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const withsyFriends = [
  {
    name: "Skye",
    role: "Got something on your mind? Let’s chat!",
    specialty: "Creative Expression",
  },
  {
    name: "Luna",
    role: "I’ll be right here when you need me.",
    specialty: "Soft Support",
  },
  {
    name: "Tali",
    role: "Your thoughts matter—let’s write them down.",
    specialty: "Book Notes",
  },
  {
    name: "Milo",
    role: "Let’s write something beautiful together.",
    specialty: "Gratitude Journaling",
  },
  {
    name: "Sunny",
    role: "You’re stronger than you think!",
    specialty: "Goals & Habits",
  },
  {
    name: "Maddy",
    role: "Tell me everything. I’m listening.",
    specialty: "Emotional Venting",
  },
];

function getRecommendedFriends() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return {
      message: "Good morning! Start your day with clear goals and motivation.",
      bestFriend: withsyFriends.find((f) => f.name === "Sunny")!,
      extraFriend: withsyFriends.find((f) => f.name === "Skye")!,
    };
  } else if (hour >= 11 && hour < 17) {
    return {
      message: "Afternoons are perfect for creativity. Let's express yourself!",
      bestFriend: withsyFriends.find((f) => f.name === "Skye")!,
      extraFriend: withsyFriends.find((f) => f.name === "Milo")!,
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      message: "Evening is a great time to reflect and be thankful.",
      bestFriend: withsyFriends.find((f) => f.name === "Milo")!,
      extraFriend: withsyFriends.find((f) => f.name === "Sunny")!,
    };
  } else {
    return {
      message: "Late night thoughts? I'm here for you with comfort and care.",
      bestFriend: withsyFriends.find((f) => f.name === "Luna")!,
      extraFriend: withsyFriends.find((f) => f.name === "Maddy")!,
    };
  }
}

export default function Page() {
  const { message, bestFriend, extraFriend } = getRecommendedFriends();
  return (
    <div className="flex flex-col h-screen">
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
