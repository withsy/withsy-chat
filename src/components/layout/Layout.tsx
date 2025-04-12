import type { ReactNode } from "react";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Main>{children}</Main>
    </div>
  );
}
