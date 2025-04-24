import { FriendCard } from "@/components/town/FriendCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const withsyFriends = [
  {
    name: "Milo",
    role: "Let’s write something beautiful together.",
    specialty: "Gratitude Journaling",
  },
  {
    name: "Maddy",
    role: "Tell me everything. I’m listening.",
    specialty: "Emotional Venting",
  },
  {
    name: "Sunny",
    role: "You’re stronger than you think!",
    specialty: "Goals & Habits",
  },
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
];

const customFriends = [
  {
    name: "Echo",
    role: "Let’s build your own path.",
    specialty: "Productivity & Focus",
  },
  {
    name: "Nova",
    role: "Shine your way through challenges.",
    specialty: "Motivational Talk",
  },
];

const allFriends = [...withsyFriends, ...customFriends];

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pb-30">
        <Tabs
          defaultValue="discover"
          className="w-full max-w-6xl mx-auto px-4 pt-4"
        >
          <TabsList className="flex justify-center gap-2">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="withsy">Withsy Friends</TabsTrigger>
            <TabsTrigger value="custom">Your Own</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 place-items-center">
              {allFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="withsy">
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 place-items-center">
              {withsyFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid gap-4 sm:grid-cols-3 gap-y-5 p-5 place-items-center">
              {customFriends.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
