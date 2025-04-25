import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { userPrefs } = useUser();
  const pathname = usePathname();
  const themeColor = userPrefs.themeColor;
  const themeOpacity = userPrefs.themeOpacity;
  const backgroundColor = `rgba(${themeColor}, ${themeOpacity})`;

  const isChatPage =
    pathname.startsWith("/chat") || pathname.startsWith("/saved");
  return (
    <div
      className="flex overflow-hidden h-[100dvh]"
      style={isChatPage ? { backgroundColor } : {}}
    >
      <Sidebar isChatPage={isChatPage} />
      <div className="flex flex-col flex-1 h-full ">
        <Main>{children}</Main>
      </div>
    </div>
  );
}
