import dynamic from "next/dynamic";

export const ChatLayout = dynamic(
  () => import("@/components/layout/_ChatLayout"),
  {
    ssr: false,
  },
);
