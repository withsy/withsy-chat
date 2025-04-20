import { useUser } from "@/context/UserContext";
import { type ReactNode } from "react";
import Header from "./Header";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { userPrefs } = useUser();
  const themeColor = userPrefs.themeColor;
  const themeOpacity = userPrefs.themeOpacity;
  const backgroundColor = `rgba(${themeColor}, ${themeOpacity})`;
  return (
    <div
      className="flex overflow-hidden h-[100dvh]"
      style={{ backgroundColor }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 h-full pt-16">
        <Header />
        <Main>{children}</Main>
      </div>
    </div>
  );
}
