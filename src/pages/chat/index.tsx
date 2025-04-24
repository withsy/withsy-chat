import EmptyChatView from "@/components/chat/EmptyChatView";

type Prompt = {
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isStar: boolean;
};

const prompts: Prompt[] = [
  {
    title: "Daily Reflection",
    content: "Write about what you learned today.",
    createdAt: "2025-04-01T10:00:00Z",
    updatedAt: "2025-04-21T09:00:00Z",
    isStar: true,
  },
  {
    title: "Meeting Summary",
    content: "Summarize the key points from today’s meeting.",
    createdAt: "2025-03-15T12:30:00Z",
    updatedAt: "2025-04-20T18:30:00Z",
    isStar: true,
  },
  {
    title: "Brainstorm Ideas",
    content: "Come up with five new app feature ideas.",
    createdAt: "2025-02-10T08:15:00Z",
    updatedAt: "2025-03-11T14:00:00Z",
    isStar: false,
  },
  {
    title: "Weekly Goals",
    content: "List your goals for the week.",
    createdAt: "2025-04-05T16:45:00Z",
    updatedAt: "2025-04-18T11:20:00Z",
    isStar: false,
  },
  {
    title: "Book Summary",
    content: "Summarize the book you read this week.",
    createdAt: "2025-03-01T20:00:00Z",
    updatedAt: "2025-03-30T08:00:00Z",
    isStar: false,
  },
  {
    title: "Random Thoughts",
    content: "Write down whatever comes to mind.",
    createdAt: "2025-04-10T07:30:00Z",
    updatedAt: "2025-04-22T12:00:00Z",
    isStar: false,
  },
];

export default function Page() {
  return <EmptyChatView prompts={prompts} />;
}
