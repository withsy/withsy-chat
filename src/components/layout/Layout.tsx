import { useUser } from "@/context/UserContext";
import { type ReactNode } from "react";
import Header from "./Header";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { user } = useUser();

  const backgroundColor = `rgba(${
    user?.preferences.themeColor ?? "255,87,34"
  }, ${user?.preferences.themeOpacity ?? 0.2})`;
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
