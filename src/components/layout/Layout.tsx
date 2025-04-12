import { useSidebar } from "@/context/SidebarContext";
import type { ReactNode } from "react";
import Header from "./Header";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { userPrefs } = useSidebar();
  const themeColor = userPrefs.themeColor ?? "0,123,255";
  const themeOpacity = userPrefs.themeOpacity ?? 0.1;
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: `rgba(${themeColor}, ${themeOpacity})`,
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <Main>{children}</Main>
      </div>
    </div>
  );
}
