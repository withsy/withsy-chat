import { useUserPreferences } from "@/context/UserPreferencesContext";
import { useSession } from "next-auth/react";
import { type ReactNode } from "react";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
  className: string;
};

export default function ChatLayout({ children, className }: LayoutProps) {
  useSession({
    required: true,
  });

  const { useUserPreference } = useUserPreferences();
  const themeColor = useUserPreference("themeColor");
  const themeOpacity = useUserPreference("themeOpacity");
  const backgroundColor = `rgba(${themeColor}, ${themeOpacity})`;

  return (
    <div
      className={`relative flex h-[100dvh] overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <Sidebar />
      <div className="z-20 flex h-full min-w-0 flex-1 flex-col">
        <Main>{children}</Main>
      </div>
    </div>
  );
}
