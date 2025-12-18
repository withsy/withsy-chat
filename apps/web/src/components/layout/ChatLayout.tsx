import { usePreferences } from "@/context/PreferencesContext";
import { useUser } from "@/context/UserContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
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

  const { usePreference } = usePreferences();
  const themeColor = usePreference("themeColor");
  const themeOpacity = usePreference("themeOpacity");
  const backgroundColor = `rgba(${themeColor}, ${themeOpacity})`;

  return (
    <div
      className={`flex overflow-hidden h-[100dvh] relative ${className}`}
      style={{ backgroundColor }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 h-full z-20 min-w-0">
        <Main>{children}</Main>
      </div>
    </div>
  );
}
