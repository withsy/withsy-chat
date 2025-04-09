export const filterOptions = {
  sort: {
    label: "Sort",
    options: [
      { label: "Latest", value: "latest" },
      { label: "Oldest", value: "oldest" },
    ],
  },
  type: {
    label: "Type",
    options: [
      { label: "Chats + Threads", value: "all" },
      { label: "Chat", value: "chat" },
      { label: "Thread", value: "thread" },
    ],
  },
  model: {
    label: "Model",
    options: [
      { label: "All Models", value: "all" },
      { label: "GPT-4", value: "gpt-4" },
      { label: "GPT-3.5", value: "gpt-3.5" },
    ],
  },
};
