import { useUserPreference } from "@/features/user/hooks/useUserPreference";
import { useIsClient } from "@/hooks/useIsClient";
import { nunito } from "@/lib/fonts";
import { useSession } from "next-auth/react";
import { type ReactNode } from "react";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

export default function ChatLayout({ children }: { children?: ReactNode }) {
  useSession({
    required: true,
  });
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");
  const backgroundColor = `rgba(${themeColor}, ${themeOpacity})`;
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={`relative flex h-[100dvh] overflow-hidden ${nunito.className}`}
      style={{ backgroundColor }}
    >
      <Sidebar />
      <Main>{children}</Main>
    </div>
  );
}
