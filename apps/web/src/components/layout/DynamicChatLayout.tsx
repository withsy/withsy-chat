import dynamic from "next/dynamic";

export const DynamicChatLayout = dynamic(
  () => import("@/components/layout/ChatLayout"),
  {
    ssr: false,
  },
);
